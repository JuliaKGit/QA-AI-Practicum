---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error and trace, cross-reference the spec, POM, and app source in the repo, classify real app bug vs test issue, and post a structured diagnosis to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI failure triage

1. Pull the failed run's logs and the playwright-report artifact (GitHub MCP, or gh run view <id> --log and gh run download <id>). For a local red run, use the local report and test-results/.
2. Read the error: failing test, expected vs received, trace path. Inspect the trace from the command line with npx playwright trace. Quote the aria snapshot from the error context when Playwright includes one.
3. Cross-reference the spec, the page object, the story's acceptance criteria, and the Confluence page. BuddyTime's source isn't in this repo; compare against the documented behavior instead.
4. Build an **evidence file** (no `score`, `confidence`, or `weight`): save `.test-artifacts/evidence/<run-id>-<slug>.json`, copy to `.test-artifacts/evidence/current.json` with cited `artifact`, `line`, `excerpt` items per `config/evidence-rubric.json`.
5. Run `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`. Report `decision`, `side`, `score`, `rule`, `allowedActions`, `missing`, `contradictions` only.
6. Post PR comment with root cause, lines, run id, and scorer JSON.

| Signal | Scorer | Route |
|--------|--------|-------|
| Re-run passes | inconclusive (rule 3) | Stop — not drift |
| act + drift | self-heal | hooks enforce |
| act + bug | bug-reporter | hooks enforce |

Rules: never merge; never score fields in evidence; bug only when scorer allows.
