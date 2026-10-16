import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shared = path.join(__dirname, '_shared');

const R1 = {
  id: 'R1',
  kind: 'failure',
  artifact: 'tests/target.spec.ts',
  line: 8,
  excerpt: 'expect(locator).toBeVisible() failed',
};
const R2 = {
  id: 'R2',
  kind: 'test_location',
  artifact: 'tests/target.spec.ts',
  line: 4,
  excerpt: 'test_location anchor for evidence',
};
const R3 = {
  id: 'R3',
  kind: 'pom_location',
  artifact: 'pages/widget.page.ts',
  line: 2,
  excerpt: "getByRole('button', { name: 'Send reset link' })",
};
const R4 = { id: 'R4', kind: 'rerun', artifact: 'tests/target.spec.ts' };
const D1 = {
  id: 'D1',
  kind: 'snapshot_mismatch',
  artifact: 'pages/widget.page.ts',
  line: 3,
  excerpt: 'snapshot mismatch on reset heading text drift',
};
const D2 = {
  id: 'D2',
  kind: 'pom_changed',
  artifact: 'pages/widget.page.ts',
  line: 4,
  excerpt: 'pom drift: sendResetLink renamed to submitReset',
};
const D3 = {
  id: 'D3',
  kind: 'locator_error',
  artifact: 'tests/target.spec.ts',
  line: 9,
  excerpt: 'strict mode violation: locator resolved',
};
const D4 = {
  id: 'D4',
  kind: 'probe_unique',
  artifact: 'pages/widget.page.ts',
  line: 5,
  excerpt: 'probe unique token xyz789 for drift oracle',
};
const B1 = {
  id: 'B1',
  kind: 'ac_contradiction',
  artifact: 'features/story.feature.md',
  line: 2,
  excerpt: 'AC requires confirmation text missing',
};
const B2 = {
  id: 'B2',
  kind: 'server_error',
  artifact: 'tests/server.log',
  line: 1,
  excerpt: '500 Internal Server Error on POST',
};
const B3 = {
  id: 'B3',
  kind: 'control_present',
  artifact: 'tests/target.spec.ts',
  line: 10,
  excerpt: 'button Log in still visible on error',
};
const N = {
  id: 'N',
  kind: 'oracle_neutral',
  artifact: 'features/neutral.md',
  line: 1,
  excerpt: 'neutral note for triage only',
};

const testMeta = { file: 'tests/target.spec.ts', title: 'fixture case' };

function copyShared(caseDir) {
  for (const rel of ['tests', 'pages', 'features']) {
    const src = path.join(shared, rel);
    const dest = path.join(caseDir, rel);
    fs.cpSync(src, dest, { recursive: true });
  }
}

function decisionId(evidence) {
  const bytes = Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  return crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
}

function failedReport(errorLine) {
  return {
    suites: [
      {
        specs: [
          {
            tests: [
              {
                results: [
                  {
                    status: 'failed',
                    errors: [{ message: `${errorLine}\n    at fixture` }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function passedReport() {
  return {
    suites: [
      {
        specs: [
          {
            tests: [
              {
                results: [{ status: 'passed' }],
              },
            ],
          },
        ],
      },
    ],
  };
}

function writeCase(name, evidence, rerun) {
  const caseDir = path.join(__dirname, name);
  fs.rmSync(caseDir, { recursive: true, force: true });
  fs.mkdirSync(caseDir, { recursive: true });
  copyShared(caseDir);
  fs.writeFileSync(path.join(caseDir, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  const id = decisionId(evidence);
  const rerunDir = path.join(caseDir, '.test-artifacts', 'reruns');
  fs.mkdirSync(rerunDir, { recursive: true });
  fs.writeFileSync(path.join(rerunDir, `${id}.json`), `${JSON.stringify(rerun, null, 2)}\n`);
  return id;
}

const cases = [
  {
    name: 'min-act-drift',
    evidence: { test: testMeta, items: [R1, R2, R3, R4, D1, D2] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'min-act-bug',
    evidence: { test: testMeta, items: [R1, R2, R4, B1, B3] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'min-escalate',
    evidence: { test: testMeta, items: [R1, R2, R3, R4, D1] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'missing-required',
    evidence: { test: testMeta, items: [R1, R2, R3, D1, D4] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'contradiction',
    evidence: { test: testMeta, items: [R1, R2, R3, R4, D1, B2] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'neutral-oracle',
    evidence: { test: testMeta, items: [R1, R2, R3, R4, N, D2, D3] },
    rerun: failedReport(R1.excerpt),
  },
  {
    name: 'flaky',
    evidence: {
      test: { file: 'tests/target.spec.ts', title: 'flaky fixture case' },
      items: [R1, R2, R3, R4, D1],
    },
    rerun: passedReport(),
  },
  {
    name: 'model-score',
    evidence: { test: testMeta, confidence: 0.9, items: [R1, R2, R3, R4, D1, D2] },
    rerun: failedReport(R1.excerpt),
  },
];

for (const entry of cases) {
  const id = writeCase(entry.name, entry.evidence, entry.rerun);
  console.log(`${entry.name}: ${id}`);
}
