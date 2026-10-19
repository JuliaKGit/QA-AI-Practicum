import fs from 'fs';
import path from 'path';

type TriageClass = 'drift' | 'bug' | 'ambiguous';

const CLASSES: TriageClass[] = ['drift', 'bug', 'ambiguous'];

interface AnswerKeyEntry {
  id: string;
  input: string;
  expected: TriageClass;
}

interface Prediction {
  id: string;
  predicted: TriageClass;
  evidence: string;
}

interface RunFile {
  model: string;
  startedAt: string;
  finishedAt: string;
  predictions: Prediction[];
}

interface ClassMetrics {
  precision: number | null;
  recall: number | null;
  falsePositives: number;
}

interface RunMetrics {
  file: string;
  model: string;
  accuracy: number | null;
  perClass: Record<TriageClass, ClassMetrics>;
}

function isTriageClass(value: unknown): value is TriageClass {
  return typeof value === 'string' && (CLASSES as string[]).includes(value);
}

function parseAnswerKey(raw: unknown): AnswerKeyEntry[] {
  if (!Array.isArray(raw)) {
    throw new Error('answer-key.json must be a JSON array');
  }
  return raw.map((item, index) => {
    if (item === null || typeof item !== 'object') {
      throw new Error(`answer-key entry ${index} must be an object`);
    }
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || row.id.length === 0) {
      throw new Error(`answer-key entry ${index} missing string "id"`);
    }
    if (typeof row.input !== 'string') {
      throw new Error(`answer-key entry ${index} missing string "input"`);
    }
    if (!isTriageClass(row.expected)) {
      throw new Error(`answer-key entry ${index} "expected" must be drift | bug | ambiguous`);
    }
    return { id: row.id, input: row.input, expected: row.expected };
  });
}

function parseRunFile(raw: unknown, fileLabel: string): RunFile {
  if (raw === null || typeof raw !== 'object') {
    throw new Error(`${fileLabel}: run file must be a JSON object`);
  }
  const row = raw as Record<string, unknown>;
  if (typeof row.model !== 'string') {
    throw new Error(`${fileLabel}: missing string "model"`);
  }
  if (typeof row.startedAt !== 'string' || typeof row.finishedAt !== 'string') {
    throw new Error(`${fileLabel}: missing "startedAt" / "finishedAt" strings`);
  }
  if (!Array.isArray(row.predictions)) {
    throw new Error(`${fileLabel}: "predictions" must be an array`);
  }
  const predictions = row.predictions.map((item, index) => {
    if (item === null || typeof item !== 'object') {
      throw new Error(`${fileLabel}: prediction ${index} must be an object`);
    }
    const p = item as Record<string, unknown>;
    if (typeof p.id !== 'string') {
      throw new Error(`${fileLabel}: prediction ${index} missing string "id"`);
    }
    if (!isTriageClass(p.predicted)) {
      throw new Error(`${fileLabel}: prediction ${index} "predicted" must be drift | bug | ambiguous`);
    }
    if (typeof p.evidence !== 'string') {
      throw new Error(`${fileLabel}: prediction ${index} missing string "evidence"`);
    }
    return { id: p.id, predicted: p.predicted, evidence: p.evidence };
  });
  return {
    model: row.model,
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    predictions,
  };
}

function emptyClassMetrics(): Record<TriageClass, ClassMetrics> {
  return {
    drift: { precision: null, recall: null, falsePositives: 0 },
    bug: { precision: null, recall: null, falsePositives: 0 },
    ambiguous: { precision: null, recall: null, falsePositives: 0 },
  };
}

function computeRunMetrics(
  run: RunFile,
  file: string,
  expectedById: Map<string, TriageClass>,
  keyIds: string[],
): RunMetrics {
  const predictedById = new Map<string, TriageClass>();
  for (const p of run.predictions) {
    predictedById.set(p.id, p.predicted);
  }

  let correct = 0;
  const tp: Record<TriageClass, number> = { drift: 0, bug: 0, ambiguous: 0 };
  const fp: Record<TriageClass, number> = { drift: 0, bug: 0, ambiguous: 0 };
  const fn: Record<TriageClass, number> = { drift: 0, bug: 0, ambiguous: 0 };

  for (const id of keyIds) {
    const expected = expectedById.get(id);
    if (expected === undefined) {
      continue;
    }
    const predicted = predictedById.get(id);
    if (predicted === undefined) {
      fn[expected] += 1;
      continue;
    }
    if (predicted === expected) {
      correct += 1;
      tp[expected] += 1;
    } else {
      fp[predicted] += 1;
      fn[expected] += 1;
    }
  }

  const perClass = emptyClassMetrics();
  for (const c of CLASSES) {
    perClass[c].falsePositives = fp[c];
    const denomP = tp[c] + fp[c];
    perClass[c].precision = denomP === 0 ? null : tp[c] / denomP;
    const denomR = tp[c] + fn[c];
    perClass[c].recall = denomR === 0 ? null : tp[c] / denomR;
  }

  const accuracy = keyIds.length === 0 ? null : correct / keyIds.length;

  return { file, model: run.model, accuracy, perClass };
}

function computeAgreement(runs: RunFile[], keyIds: string[]): number | null {
  if (keyIds.length === 0 || runs.length === 0) {
    return null;
  }

  let agreeCount = 0;
  for (const id of keyIds) {
    const labels: TriageClass[] = [];
    let complete = true;
    for (const run of runs) {
      const pred = run.predictions.find((p) => p.id === id);
      if (pred === undefined) {
        complete = false;
        break;
      }
      labels.push(pred.predicted);
    }
    if (!complete) {
      continue;
    }
    const first = labels[0];
    if (labels.every((l) => l === first)) {
      agreeCount += 1;
    }
  }

  return agreeCount / keyIds.length;
}


function readJsonFile(filePath: string): unknown {
  let text = fs.readFileSync(filePath, 'utf8');
  if (text.length > 0 && text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return JSON.parse(text) as unknown;
}
function formatRate(value: number | null): string {
  if (value === null) {
    return 'n/a';
  }
  return `${(value * 100).toFixed(1)}%`;
}

function main(): void {
  const agent = process.argv[2];
  if (!agent || agent.startsWith('-')) {
    console.error('Usage: npx tsx evals/score.ts <agent>');
    process.exit(1);
  }

  const repoRoot = path.resolve(__dirname, '..');
  const agentDir = path.join(repoRoot, 'evals', agent);
  const keyPath = path.join(agentDir, 'answer-key.json');
  const runsDir = path.join(agentDir, 'runs');

  if (!fs.existsSync(keyPath)) {
    console.error(`Missing answer key: ${keyPath}`);
    process.exit(1);
  }

  const key = parseAnswerKey(readJsonFile(keyPath));
  const expectedById = new Map<string, TriageClass>();
  const keyIdSet = new Set<string>();
  for (const entry of key) {
    expectedById.set(entry.id, entry.expected);
    keyIdSet.add(entry.id);
  }
  const keyIds = key.map((e) => e.id);

  if (!fs.existsSync(runsDir)) {
    console.log(`Agent: ${agent}`);
    console.log(`Cases in answer key: ${keyIds.length}`);
    console.log('Runs: 0 (no runs/ directory)');
    console.log('Cross-run agreement: n/a');
    process.exit(0);
  }

  const runFiles = fs
    .readdirSync(runsDir)
    .filter((name) => name.endsWith('.json'))
    .sort();

  const runs: RunFile[] = [];
  for (const name of runFiles) {
    const fullPath = path.join(runsDir, name);
    const run = parseRunFile(readJsonFile(fullPath), name);
    for (const p of run.predictions) {
      if (!keyIdSet.has(p.id)) {
        console.error(`Run ${name} references unknown id "${p.id}" (not in answer key)`);
        process.exit(2);
      }
    }
    runs.push(run);
  }

  console.log(`Agent: ${agent}`);
  console.log(`Cases in answer key: ${keyIds.length}`);
  console.log(`Runs scored: ${runs.length}`);
  console.log('');

  for (let i = 0; i < runFiles.length; i++) {
    const name = runFiles[i];
    const run = runs[i];
    const metrics = computeRunMetrics(run, name, expectedById, keyIds);
    console.log(`--- ${name} (model: ${metrics.model}) ---`);
    console.log(`Overall accuracy: ${formatRate(metrics.accuracy)}`);
    for (const c of CLASSES) {
      const m = metrics.perClass[c];
      console.log(
        `  ${c}: precision ${formatRate(m.precision)}, recall ${formatRate(m.recall)}, false positives ${m.falsePositives}`,
      );
    }
    console.log('');
  }

  const agreement = computeAgreement(runs, keyIds);
  console.log(`Cross-run agreement (same predicted class on every run): ${formatRate(agreement)}`);
}

main();