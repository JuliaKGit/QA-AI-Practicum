# Eval report

<<<<<<< HEAD
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
=======
**Generated:** 2026-10-16  
**Window:** last N = 30 Playwright workflow runs requested; **6** runs available (below minimum for rate metrics)  
**Trigger:** user-requested refresh via eval-report skill (README + report update)

## 1. Flake rate

- **Value:** insufficient data
- **How measured:** `gh run list --workflow=playwright.yml --limit 30` → 6 runs, all `success`; no Playwright retry-only-failure signal extracted from logs; window ≪ 30
- **Interpretation:** Cannot estimate flakes without more runs and explicit retry/failure parsing.

## 2. Heal success rate

- **Value:** insufficient data; masked regressions: **0** (no heal PRs to inspect)
- **How measured:** `gh pr list --state all` — no branches/PRs matching `heal/*`; no triage-heal chain in window
- **Interpretation:** Heal path not exercised in CI history yet.

## 3. Generation-gate pass rate

- **Value:** insufficient data for a stable rate (1 ticket-first PR observed; denominator too small for N = 30 standard)
- **How measured:** PR [#1](https://github.com/JuliaKGit/QA-AI-Practicum/pull/1) (AQPBT-7): Playwright **pull_request** check **success**; plan `features/AQPBT-7.feature.md` maps to Jira AC1–6 + edges; merged with `tests-generated` on AQPBT-7
- **Interpretation:** First generation PR met gate on available evidence; sample size does not support a percentage claim.

## 4. Ask vs guess

- **Assessment:** insufficient data for a quantitative score; qualitative review of PR #1 and AQPBT-7 plan shows env-backed Family A email and ticket literal `nobody@example.com`, with ambiguities documented in the feature file
- **How measured:** PR body, `features/AQPBT-7.feature.md` ambiguities block; no broad transcript sample in window
- **Interpretation:** No systematic ask-vs-guess audit yet; early ticket work avoided invented UI strings.

## Top reliability risk

The suite depends on a single shared BuddyTime test environment and stored auth; with only six green CI runs, stability under load, parallelism, and flake behavior are unknown.

## Next action

Accumulate ≥30 Playwright workflow runs, then re-run this skill; on the next red run, route through triage before any heal or bug draft.
>>>>>>> 7aca762 (Add evidence scorer, Cursor gates, README, and eval report.)
