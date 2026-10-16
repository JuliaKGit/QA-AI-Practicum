import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { scoreEvidence } from './score-evidence';

const repoRoot = path.resolve(__dirname, '..');
const fixturesRoot = path.join(__dirname, 'evidence-fixtures');

function runCase(caseName: string): ReturnType<typeof scoreEvidence> {
  const caseDir = path.join(fixturesRoot, caseName);
  const evidencePath = path.join(caseDir, 'evidence.json');
  return scoreEvidence({
    evidencePath,
    repoRoot,
    fixtureRoot: caseDir,
    verifyOnly: true,
  });
}

describe('score-evidence fixtures', () => {
  it('min-act-drift: R1–R4, D1 + D2 → drift 60, act (rule 6)', () => {
    const result = runCase('min-act-drift');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 'rule 6');
  });

  it('min-act-bug: R1, R2, R4, B1 + B3 → bug 60, act (rule 6)', () => {
    const result = runCase('min-act-bug');
    assert.equal(result.decision, 'act');
    assert.equal(result.side, 'bug');
    assert.equal(result.score, 60);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 'rule 6');
  });

  it('min-escalate: R1–R4, D1 → drift 40, escalate (rule 7)', () => {
    const result = runCase('min-escalate');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 40);
    assert.equal(result.oracle, true);
    assert.equal(result.rule, 'rule 7');
  });

  it('missing-required: no R4, D1 + D4 → inconclusive (rule 2)', () => {
    const result = runCase('missing-required');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule 2');
    assert.ok(result.missing.includes('R4'));
  });

  it('contradiction: R1–R4, D1 + B2 → inconclusive (rule 4)', () => {
    const result = runCase('contradiction');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule 4');
    assert.ok(result.contradictions.length >= 2);
  });

  it('neutral-oracle: R1–R4, N + D2 + D3 → drift 35, no oracle, escalate (rule 7)', () => {
    const result = runCase('neutral-oracle');
    assert.equal(result.decision, 'escalate');
    assert.equal(result.side, 'drift');
    assert.equal(result.score, 35);
    assert.equal(result.oracle, false);
    assert.equal(result.rule, 'rule 7');
  });

  it('flaky: the saved re-run passed → inconclusive (rule 3)', () => {
    const result = runCase('flaky');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule 3');
  });

  it('model-score: the evidence has "confidence": 0.9 → inconclusive (rule 1)', () => {
    const result = runCase('model-score');
    assert.equal(result.decision, 'inconclusive');
    assert.equal(result.rule, 'rule 1');
  });
});

describe('score-evidence decision artifact', () => {
  it('writes decision JSON under .test-artifacts/decisions', () => {
    const caseDir = path.join(fixturesRoot, 'min-act-drift');
    const evidencePath = path.join(caseDir, 'evidence.json');
    const evidenceBytes = fs.readFileSync(evidencePath);
    const result = scoreEvidence({
      evidencePath,
      repoRoot,
      fixtureRoot: caseDir,
      verifyOnly: true,
    });
    const outPath = path.join(repoRoot, '.test-artifacts', 'decisions', `${result.decisionId}.json`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
    assert.ok(fs.existsSync(outPath));
    assert.equal(result.decisionId.length, 12);
    assert.equal(
      result.decisionId,
      crypto.createHash('sha256').update(evidenceBytes).digest('hex').slice(0, 12),
    );
  });
});
