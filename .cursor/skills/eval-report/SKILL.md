---
name: eval-report
description: Refreshes eval-report.md — flake rate, heal success, generation-gate pass rate, ask-vs-guess — from CI logs, PR history, and session review. Use when the orchestrator closes a session, after a heal chain, at the end of backlog mode, when the user asks for suite reliability, or when eval-report.md is stale (>14 days). Cursor has no built-in telemetry; this skill defines how to measure each metric manually.
---

# Eval report

- When it is mandatory: a heal PR was opened or a red run triaged, a generation PR was opened, or eval-report.md is missing or older than 14 days. Otherwise note "eval: skipped — no trigger".
- Inputs: gh run list --workflow=playwright.yml --limit 30, gh run view <id> --log, gh pr list --state all, gh pr checks, gh pr diff, and a manual review of recent agent transcripts and PR bodies. Default window N = 30 runs.
- Metrics, each with the number (numerator/denominator), how it was measured, and a one-line interpretation:
  1. Flake rate — tests that passed only on retry / tests in passing runs.
  2. Heal success rate — heal PRs green on first CI with assertions unchanged / all heal PRs; masked regressions (expect removed or weakened) must be 0.
  3. Generation-gate pass rate — ticket-first PRs that are CI green + conforming + mapped to AC / all ticket-first generation PRs.
  4. Ask vs guess — explicit asks vs invented values; qualitative is fine, say how measured.
- Rules: missing data → "insufficient data", never a guess; cleanup 404s are noise, not flakes; end with the top reliability risk and the next action. Report only — no tickets, no test changes.
- Output: eval-report.md at the repo root.

## `eval-report.md` skeleton

```markdown
# Eval report

**Generated:** <ISO date>
**Window:** last N = 30 Playwright workflow runs (or insufficient data)
**Trigger:** <mandatory reason | eval: skipped — no trigger>

## 1. Flake rate

- **Value:** <numerator>/<denominator> (<percent or insufficient data>)
- **How measured:** <sources>
- **Interpretation:** <one line>

## 2. Heal success rate

- **Value:** <numerator>/<denominator>; masked regressions: <count, must be 0>
- **How measured:** <heal PRs, gh pr checks, gh pr diff for tests/>
- **Interpretation:** <one line>

## 3. Generation-gate pass rate

- **Value:** <numerator>/<denominator>
- **How measured:** <ticket-first PRs, CI, constitution/conventions, AC mapping>
- **Interpretation:** <one line>

## 4. Ask vs guess

- **Assessment:** <qualitative>
- **How measured:** <transcripts, PR bodies, chat>
- **Interpretation:** <one line>

## Top reliability risk

<one paragraph>

## Next action

<one concrete step — report only, no filing or code>
```
