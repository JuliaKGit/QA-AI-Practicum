# Eval report

**Generated:** 2026-10-13
**Window:** last N = 30 Playwright workflow runs (3 available)
**Trigger:** generation PR for AQPBT-12 (Backlog mode Done)

## 1. Flake rate

- **Value:** insufficient data (0 retries observed / 3 successful `playwright.yml` runs on `main`)
- **How measured:** `gh run list --workflow=playwright.yml --limit 30` — all three completed runs are `success` with no failed-then-retried jobs visible in the list summary
- **Interpretation:** Too few runs and no failure history yet to estimate flake rate.

## 2. Heal success rate

- **Value:** insufficient data (0/0 heal PRs); masked regressions: 0
- **How measured:** `gh pr list` (all states) and heal-title search — no PRs in the repo yet; this Backlog run had no red run and no heal
- **Interpretation:** Heal pipeline not exercised; no assertion-weakening diffs to audit.

## 3. Generation-gate pass rate

- **Value:** insufficient data for historical CI gate (0 prior ticket-first PRs); this session: local green for AQPBT-12 (`npx playwright test tests/aqpbt-12-calendar-export.spec.ts` → 11 passed) pending PR CI
- **How measured:** plan `features/AQPBT-12.feature.md` mapped to AC1–AC6 + E1–E3; spec + POM extensions; no prior `tests/*` PRs in `gh pr list`
- **Interpretation:** First ticket-first generation PR; CI gate pass rate will become measurable after this PR’s checks complete.

## 4. Ask vs guess

- **Assessment:** Low guess risk for AQPBT-12 — UI strings and routes taken from Jira AC and Confluence page 317718530; Family A/B mapped to `APP_USER_*` / `APP_ALT_USER_*` storageState; confirmed-row Google/ICS left out of scope per ticket
- **How measured:** session plan vs ticket/Confluence; live probe by test-writer for Calendar Sync / Cancelled rows; open questions on confirmed-row labels left as ambiguities in the feature file
- **Interpretation:** Values not in ticket/Confluence/live app were not invented for in-scope scenarios.

## Top reliability risk

Shared-env Past Cancelled rows (Family A) are assumed present for AC2/AC3/AC6/E1. If those rows disappear, several assertions fail even though empty-Upcoming and Profile Calendar Sync remain valid. Confirmed Google/ICS happy path is still untested by design.

## Next action

After the AQPBT-12 generation PR lands CI, record whether checks are green and fold that outcome into generation-gate (1/1 or 0/1); optionally seed a disposable Cancelled Past fixture via API if the shared Past list becomes empty.
