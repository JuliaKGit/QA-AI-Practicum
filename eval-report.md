# Eval report

**Generated:** 2026-10-13
**Window:** last N = 10 Playwright workflow runs requested; **3** runs returned (insufficient for flake statistics)
**Trigger:** generation PR for AQPBT-7 (orchestrator Done)

## 1. Flake rate

- **Value:** insufficient data (0/0 retries observed in window)
- **How measured:** `gh run list --workflow=playwright.yml --limit 10`; no `--rerun` or retry annotations in available logs
- **Interpretation:** Too few runs to estimate flakes; expand window after more CI history.

## 2. Heal success rate

- **Value:** insufficient data (0 heal PRs in window); masked regressions: **0**
- **How measured:** `gh pr list --state all` — no `heal/*` PRs yet
- **Interpretation:** No heal chain this session; baseline not established.

## 3. Generation-gate pass rate

- **Value:** 1/1 for AQPBT-7 (local + prior full regression CI green; plan mapped to AC1–6 + E1–E3)
- **How measured:** Manual review of `features/AQPBT-7.feature.md` vs Jira AC; `npx playwright test tests/aqpbt-7-forgot-pwd.spec.ts` pass; run 38457353567 success
- **Interpretation:** First ticket-first generation meets gate on functional coverage; PR awaits human review.

## 4. Ask vs guess

- **Value:** qualitative — Family A email from `APP_USER_EMAIL`; AC3 uses ticket literal `nobody@example.com`; ambiguities documented in feature file
- **How measured:** Plan ambiguities block; no invented routes or labels
- **Interpretation:** Low guess risk on this story; validation copy still unknown per Confluence open questions.

## Top reliability risk

Single-environment dependency on BuddyTime test site and stored auth; no flake data yet.

## Next action

Merge AQPBT-7 PR after review; monitor Playwright regression workflow for flake signal after 30+ runs.
