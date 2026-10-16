---
name: self-heal
description: Repairs drifted Playwright locators after a UI change — patch the POM, re-run unchanged assertions, open a PR. Use when the build is red because a locator broke, fix the drifted selector, the test broke after a UI change, or heal the suite. Use ONLY after triage classifies the red run as a test issue (drift/locator drift); NEVER for a real app bug — route those to bug-reporter instead.
---

# Self-heal (locator drift)

- Prerequisite: `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json` returns `decision: act` with `side: drift`, or `decision: escalate` with human `.test-artifacts/approvals/<decisionId>.json`. Otherwise stop (hooks enforce).
- Steps:
  1. From the error and trace, find the failing test, the assertion line (read-only), the POM property that supplied the locator, and the old locator exactly as written.
  2. Re-discover the element with browser_navigate + browser_snapshot against APP_URL: same role, current accessible name. Never guess from screenshots.
  3. Patch only that locator in the POM (minimal diff; keep role-based; never CSS or XPath; never broaden it to make it pass). One locator per run.
  4. Re-run the failing spec and prove it green with zero changes under tests/.
  5. Open a PR on branch heal/<short-description> with the run id, the triage classification, the old → new locator diff, the re-run result, and the line "assertions unchanged". Do not merge.
- Stop and escalate if green needs an assertion change, if the same locator error persists after re-discovery, or if a new failure looks like a product regression.

## Report template (PR body)

```markdown
## Self-heal: locator drift

**CI run:** <run id or local re-run command>
**Triage:** test issue (drift)
**Failing test:** <spec path + test title>
**POM:** <file> — `<property>`

### Locator change
- **Before:** `<exact old locator expression>`
- **After:** `<exact new locator expression>`
- **Evidence:** Playwright snapshot / trace at <path>

### Verification
- Re-run: `npx playwright test <spec>`
- Result: pass
- **assertions unchanged**

### Scope
- Files touched: pages/ only (one locator)
```

## Do / Don't

| Do | Don't |
|----|--------|
| Run **ci-failure-triage** first; heal only when classification is drift | Heal when triage says real app bug or ambiguous — use **jira-bug-reporter** |
| Change one POM locator per heal PR | Edit specs, assertions, or multiple unrelated locators in one heal |
| Re-discover via **browser_snapshot** (role + accessible name) | Use CSS, XPath, or screenshot guessing |
| Re-run the same spec; keep `tests/` byte-identical | Weaken, delete, or comment out `expect()` to go green |
| Branch `heal/<short-description>`; PR with evidence; no merge | Merge your own heal PR or file Jira bugs for drift |
