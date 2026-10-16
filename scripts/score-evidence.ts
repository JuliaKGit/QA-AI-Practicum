import crypto from 'crypto';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

type Side = 'drift' | 'bug';
type DecisionOutcome = 'act' | 'escalate' | 'inconclusive';

interface EvidenceTest {
  file: string;
  title: string;
}

interface EvidenceItem {
  id: string;
  kind: string;
  artifact: string;
  line?: number;
  excerpt?: string;
}

interface EvidenceFile {
  test: EvidenceTest;
  items: EvidenceItem[];
  [key: string]: unknown;
}

interface RequiredRule {
  id: string;
  kind: string;
  requiredWhenSide?: Side;
}

interface WeightedRule {
  id: string;
  kind: string;
  side: Side | null;
  weight: number;
  oracle?: boolean;
}

interface Rubric {
  required: RequiredRule[];
  weighted: WeightedRule[];
  thresholds: { act: number; escalate: number };
}

export interface ScoreResult {
  decisionId: string;
  decision: DecisionOutcome;
  side: Side | null;
  score: number;
  oracle: boolean;
  verified: string[];
  missing: string[];
  contradictions: string[];
  rule: string;
  allowedActions: string[];
}

const GIT_PREFIXES = ['tests/', 'pages/', 'features/'];
const FORBIDDEN_EVIDENCE_KEYS = new Set(['score', 'confidence', 'weight']);
const MIN_EXCERPT_LEN = 8;

function loadRubric(repoRoot: string): Rubric {
  const rubricPath = path.join(repoRoot, 'config', 'evidence-rubric.json');
  return JSON.parse(fs.readFileSync(rubricPath, 'utf8')) as Rubric;
}

export function computeDecisionId(evidenceBytes: Buffer): string {
  return crypto.createHash('sha256').update(evidenceBytes).digest('hex').slice(0, 12);
}

function hasForbiddenScoreFields(value: unknown, seen = new Set<unknown>()): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  if (seen.has(value)) {
    return false;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((entry) => hasForbiddenScoreFields(entry, seen));
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_EVIDENCE_KEYS.has(key)) {
      return true;
    }
    if (hasForbiddenScoreFields(child, seen)) {
      return true;
    }
  }
  return false;
}

function normalizePath(artifact: string): string {
  return artifact.replace(/\\/g, '/');
}

function usesGitHead(artifact: string, fixtureRoot: string | undefined): boolean {
  if (fixtureRoot) {
    return false;
  }
  const normalized = normalizePath(artifact);
  return GIT_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function readArtifactContent(
  artifact: string,
  repoRoot: string,
  fixtureRoot: string | undefined,
): string | null {
  const normalized = normalizePath(artifact);
  try {
    if (usesGitHead(normalized, fixtureRoot)) {
      return execFileSync('git', ['show', `HEAD:${normalized}`], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    }
    const base = fixtureRoot ?? repoRoot;
    const fullPath = path.join(base, normalized);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return fs.readFileSync(fullPath, 'utf8');
  } catch {
    return null;
  }
}

function verifyLineExcerpt(
  content: string,
  line: number | undefined,
  excerpt: string | undefined,
): boolean {
  if (line === undefined || excerpt === undefined) {
    return false;
  }
  if (excerpt.length < MIN_EXCERPT_LEN) {
    return false;
  }
  const lines = content.split(/\r?\n/);
  if (line < 1 || line > lines.length) {
    return false;
  }
  return lines[line - 1].includes(excerpt);
}

function weightedById(rubric: Rubric): Map<string, WeightedRule> {
  return new Map(rubric.weighted.map((entry) => [entry.id, entry]));
}

function requiredById(rubric: Rubric): Map<string, RequiredRule> {
  return new Map(rubric.required.map((entry) => [entry.id, entry]));
}

interface PlaywrightJsonReport {
  suites?: PlaywrightSuite[];
  errors?: { message?: string }[];
}

interface PlaywrightSuite {
  suites?: PlaywrightSuite[];
  specs?: PlaywrightSpec[];
}

interface PlaywrightSpec {
  tests?: PlaywrightTest[];
}

interface PlaywrightTest {
  results?: PlaywrightResult[];
}

interface PlaywrightResult {
  status?: string;
  errors?: { message?: string }[];
  error?: { message?: string };
}

function firstErrorLineFromReport(report: PlaywrightJsonReport): string | null {
  const queue: PlaywrightSuite[] = [...(report.suites ?? [])];
  while (queue.length > 0) {
    const suite = queue.shift();
    if (!suite) {
      break;
    }
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          if (result.status === 'passed') {
            continue;
          }
          const message =
            result.errors?.[0]?.message ??
            result.error?.message ??
            undefined;
          if (message) {
            return message.split('\n')[0].trim();
          }
        }
      }
    }
    queue.push(...(suite.suites ?? []));
  }
  for (const err of report.errors ?? []) {
    if (err.message) {
      return err.message.split('\n')[0].trim();
    }
  }
  return null;
}

function reportHasPassingRun(report: PlaywrightJsonReport): boolean {
  const queue: PlaywrightSuite[] = [...(report.suites ?? [])];
  let sawTest = false;
  while (queue.length > 0) {
    const suite = queue.shift();
    if (!suite) {
      break;
    }
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          sawTest = true;
          if (result.status !== 'passed') {
            return false;
          }
        }
      }
    }
    queue.push(...(suite.suites ?? []));
  }
  return sawTest;
}

function rerunReportPath(repoRoot: string, decisionId: string): string {
  return path.join(repoRoot, '.test-artifacts', 'reruns', `${decisionId}.json`);
}

function runPlaywrightRerun(
  repoRoot: string,
  testFile: string,
  title: string,
  decisionId: string,
): PlaywrightJsonReport {
  const outPath = rerunReportPath(repoRoot, decisionId);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  try {
    execFileSync(
      'npx',
      ['playwright', 'test', testFile, '-g', title, '--reporter=json'],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: outPath },
      },
    );
  } catch {
    // Playwright exits non-zero when tests fail; JSON report is still written.
  }
  return JSON.parse(fs.readFileSync(outPath, 'utf8')) as PlaywrightJsonReport;
}

function loadRerunReport(
  repoRoot: string,
  decisionId: string,
  fixtureRoot?: string,
): PlaywrightJsonReport | null {
  const candidates = [
    rerunReportPath(repoRoot, decisionId),
    fixtureRoot
      ? path.join(fixtureRoot, '.test-artifacts', 'reruns', `${decisionId}.json`)
      : null,
  ].filter((p): p is string => p !== null);
  for (const outPath of candidates) {
    if (fs.existsSync(outPath)) {
      return JSON.parse(fs.readFileSync(outPath, 'utf8')) as PlaywrightJsonReport;
    }
  }
  return null;
}

function verifyItemArtifact(
  item: EvidenceItem,
  repoRoot: string,
  fixtureRoot: string | undefined,
): boolean {
  if (item.kind === 'rerun') {
    return fs.existsSync(
      path.join(repoRoot, normalizePath(item.artifact)),
    ) || (fixtureRoot
      ? fs.existsSync(path.join(fixtureRoot, normalizePath(item.artifact)))
      : false);
  }
  const content = readArtifactContent(item.artifact, repoRoot, fixtureRoot);
  if (content === null) {
    return false;
  }
  return verifyLineExcerpt(content, item.line, item.excerpt);
}

function buildResult(
  partial: Omit<ScoreResult, 'allowedActions'> & { allowedActions?: string[] },
): ScoreResult {
  const side = partial.side;
  const decision = partial.decision;
  let allowedActions: string[] = [];
  if (decision === 'act' && side === 'drift') {
    allowedActions = ['self-heal'];
  } else if (decision === 'act' && side === 'bug') {
    allowedActions = ['bug-reporter'];
  } else if (decision === 'escalate') {
    allowedActions = ['human-review'];
  }
  return { ...partial, allowedActions };
}

export function scoreEvidence(options: {
  evidencePath: string;
  repoRoot: string;
  fixtureRoot?: string;
  verifyOnly?: boolean;
}): ScoreResult {
  const { evidencePath, repoRoot, fixtureRoot, verifyOnly = false } = options;
  const evidenceBytes = fs.readFileSync(evidencePath);
  const evidence = JSON.parse(evidenceBytes.toString('utf8')) as EvidenceFile;
  const decisionId = computeDecisionId(evidenceBytes);
  const rubric = loadRubric(repoRoot);
  const weightedMap = weightedById(rubric);
  const requiredMap = requiredById(rubric);

  const baseInconclusive = (rule: string, extra: Partial<ScoreResult> = {}): ScoreResult =>
    buildResult({
      decisionId,
      decision: 'inconclusive',
      side: null,
      score: 0,
      oracle: false,
      verified: extra.verified ?? [],
      missing: extra.missing ?? [],
      contradictions: extra.contradictions ?? [],
      rule,
      ...extra,
    });

  if (hasForbiddenScoreFields(evidence)) {
    return baseInconclusive('rule 1');
  }

  const verified: string[] = [];
  const missing: string[] = [];
  const itemById = new Map(evidence.items.map((item) => [item.id, item]));

  for (const req of rubric.required) {
    if (req.requiredWhenSide === 'drift' || req.id === 'R4') {
      continue;
    }
    const item = itemById.get(req.id);
    if (!item || item.kind !== req.kind) {
      missing.push(req.id);
      continue;
    }
    if (verifyItemArtifact(item, repoRoot, fixtureRoot)) {
      verified.push(req.id);
    } else {
      missing.push(req.id);
    }
  }

  const r4Item = itemById.get('R4');
  const r4Rule = requiredMap.get('R4');
  if (!r4Item || !r4Rule || r4Item.kind !== r4Rule.kind) {
    missing.push('R4');
  }

  if (missing.length > 0) {
    return baseInconclusive('rule 2', { verified, missing });
  }

  const r1 = itemById.get('R1');
  const r1Excerpt = r1?.excerpt?.trim() ?? '';
  let rerunReport: PlaywrightJsonReport | null = null;

  if (verifyOnly) {
    rerunReport = loadRerunReport(repoRoot, decisionId, fixtureRoot);
  } else {
    rerunReport = runPlaywrightRerun(
      repoRoot,
      evidence.test.file,
      evidence.test.title,
      decisionId,
    );
  }

  if (!rerunReport) {
    missing.push('R4');
    return baseInconclusive('rule 2', { verified, missing });
  }

  if (reportHasPassingRun(rerunReport)) {
    return baseInconclusive('rule 3', { verified });
  }

  const rerunErrorLine = firstErrorLineFromReport(rerunReport);
  if (!rerunErrorLine || !r1Excerpt || !rerunErrorLine.includes(r1Excerpt)) {
    missing.push('R4');
    return baseInconclusive('rule 2', { verified, missing });
  }
  verified.push('R4');

  for (const item of evidence.items) {
    if (requiredMap.has(item.id) || verified.includes(item.id)) {
      continue;
    }
    const rule = weightedMap.get(item.id);
    if (!rule) {
      continue;
    }
    if (rule.weight === 0) {
      if (verifyItemArtifact(item, repoRoot, fixtureRoot)) {
        verified.push(item.id);
      }
      continue;
    }
    if (item.kind !== rule.kind) {
      continue;
    }
    if (verifyItemArtifact(item, repoRoot, fixtureRoot)) {
      verified.push(item.id);
    }
  }

  const verifiedDrift = rubric.weighted.filter(
    (w) => w.side === 'drift' && w.weight > 0 && verified.includes(w.id),
  );
  const verifiedBug = rubric.weighted.filter(
    (w) => w.side === 'bug' && w.weight > 0 && verified.includes(w.id),
  );

  if (verifiedDrift.length > 0 && verifiedBug.length > 0) {
    return baseInconclusive('rule 4', {
      verified,
      contradictions: [...verifiedDrift.map((w) => w.id), ...verifiedBug.map((w) => w.id)],
    });
  }

  let side: Side | null = null;
  if (verifiedDrift.length > 0) {
    side = 'drift';
  } else if (verifiedBug.length > 0) {
    side = 'bug';
  }

  if (side === 'drift') {
    const r3 = itemById.get('R3');
    const r3Rule = requiredMap.get('R3');
    if (!r3 || !r3Rule || r3.kind !== r3Rule.kind) {
      missing.push('R3');
      return baseInconclusive('rule 2', { verified, missing });
    }
    if (!verifyItemArtifact(r3, repoRoot, fixtureRoot)) {
      missing.push('R3');
      return baseInconclusive('rule 2', { verified, missing });
    }
    if (!verified.includes('R3')) {
      verified.push('R3');
    }
  }

  const activeWeighted = side === 'drift' ? verifiedDrift : side === 'bug' ? verifiedBug : [];
  const score = activeWeighted.reduce((sum, entry) => sum + entry.weight, 0);
  const oracle = activeWeighted.some((entry) => entry.oracle === true);

  if (score === 0) {
    return baseInconclusive('rule 5', { verified, side, score, oracle });
  }

  if (score >= rubric.thresholds.act && oracle) {
    return buildResult({
      decisionId,
      decision: 'act',
      side,
      score,
      oracle,
      verified,
      missing,
      contradictions: [],
      rule: 'rule 6',
    });
  }

  if (score >= rubric.thresholds.escalate) {
    return buildResult({
      decisionId,
      decision: 'escalate',
      side,
      score,
      oracle,
      verified,
      missing,
      contradictions: [],
      rule: 'rule 7',
    });
  }

  return baseInconclusive('rule 8', { verified, side, score, oracle });
}

function parseArgs(argv: string[]): {
  evidencePath: string;
  verifyOnly: boolean;
  fixtureRoot?: string;
} {
  const positional = argv.filter((arg) => !arg.startsWith('--'));
  let verifyOnly = false;
  let fixtureRoot: string | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--verify-only') {
      verifyOnly = true;
    } else if (argv[i] === '--root') {
      fixtureRoot = path.resolve(argv[i + 1] ?? '');
      i += 1;
    }
  }
  const evidencePath = positional[0];
  if (!evidencePath) {
    throw new Error('Usage: npx tsx scripts/score-evidence.ts <evidence.json> [--verify-only] [--root <dir>]');
  }
  return { evidencePath: path.resolve(evidencePath), verifyOnly, fixtureRoot };
}

function main(): void {
  const repoRoot = path.resolve(__dirname, '..');
  const { evidencePath, verifyOnly, fixtureRoot } = parseArgs(process.argv.slice(2));
  const result = scoreEvidence({ evidencePath, repoRoot, fixtureRoot, verifyOnly });
  const outDir = path.join(repoRoot, '.test-artifacts', 'decisions');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${result.decisionId}.json`), `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (require.main === module) {
  main();
}
