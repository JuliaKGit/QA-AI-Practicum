# QA AI Practicum — BuddyTime Playwright

**BuddyTime** is a co-parent scheduling app for playdates; this repo automates tests against the shared **test** deployment (`APP_URL` in `.env`).

Stories and feature specs live in **[Jira project AQPBT](https://legionqaschool.atlassian.net/jira/software/projects/AQPBT)** and **[Confluence space AQPBT](https://legionqaschool.atlassian.net/wiki/spaces/AQPBT)** (each story links its feature page). Gherkin plans generated from tickets are saved under `features/<KEY>.feature.md`.

## Prerequisites

- **Node.js 20+**
- **Git**

## Install

```bash
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the template and fill in values (never commit `.env`):

```bash
cp .env.example .env
```

| Section in `.env.example` | Needed for | Variables |
|---------------------------|------------|-----------|
| **Run tests** | Local and CI Playwright runs | `APP_URL`, `APP_USER_EMAIL`, `APP_USER_PASSWORD`, `APP_ALT_USER_EMAIL`, `APP_ALT_USER_PASSWORD` |
| **Agent / CI setup** | GitHub Actions **Test generation** workflow only (headless Cursor agent + Jira) | `CURSOR_API_KEY`, `ATLASSIAN_*`, `JIRA_PROJECT_KEY`, `CONFLUENCE_SPACE_KEY` (mirrored as repo secrets in CI) |

**Two family accounts:** `APP_USER_*` is **Family A** — the primary account used in `auth.setup` and most flows. `APP_ALT_*` is **Family B** — a second parent/family for two-parent scenarios; tests that need it **skip** when those variables are unset so a single-account setup still runs the rest of the suite.

## Run tests

| Goal | Command |
|------|---------|
| Full suite (setup + all specs) | `npm test` or `npx playwright test` |
| App specs only (after setup) | `npx playwright test --project=app` |
| Tag slices | `npm run test:smoke`, `test:sanity`, `test:regression`, `test:api`, `test:e2e`, `test:destructive` |
| One file | `npx playwright test tests/aqpbt-7-forgot-pwd.spec.ts` |
| HTML report (after a run) | `npx playwright show-report` |

Auth: the `setup` project logs in once per family and writes `playwright/.auth/` (git-ignored). The `app` project depends on `setup` and reuses that storage state.

## CI (Playwright workflow)

| Trigger | Job | What runs |
|---------|-----|-----------|
| `push` | regression | Full suite — `npx playwright test` |
| `pull_request` | smoke | `npm run test:smoke` |
| `workflow_dispatch` | regression | Full suite — `npx playwright test` |

Secrets: `APP_*` (five variables). Reports upload as workflow artifacts (`playwright-report-smoke` or `playwright-report-regression`).

A separate **Test generation** workflow (schedule + manual dispatch) runs the QA orchestrator agent against the Jira backlog; it uses additional secrets documented in `.github/workflows/test-generation.yml`.

## Agent tooling (Cursor)

| Part | Role |
|------|------|
| `.cursor/rules/constitution.mdc` | Non-negotiable Playwright rules (locators, tags, auth, no weakened asserts). |
| `.cursor/rules/playwright-conventions.mdc` | How to write specs, POMs, fixtures, and tags in this repo. |
| `.cursor/rules/qa-orchestrator.mdc` | Routes ticket/backlog/CI work to skills and subagents through Done. |
| `.cursor/skills/jira-ticket-analyzer` | Jira + Confluence AC → Gherkin in `features/`. |
| `.cursor/skills/explore-and-generate` | Ticket-less UI exploration → Gherkin coverage gaps. |
| `.cursor/skills/pom-conventions` | Page object patterns; no inline locators in specs. |
| `.cursor/skills/api-cleanup` | Track and tear down records created during tests. |
| `.cursor/skills/ci-failure-triage` | Red CI: logs, trace, bug vs drift classification. |
| `.cursor/skills/self-heal` | Locator drift fixes in POMs after triage says test issue. |
| `.cursor/skills/jira-bug-reporter` | Structured Jira bug draft from a confirmed failure. |
| `.cursor/skills/exploratory-charter` | Time-boxed exploratory session template. |
| `.cursor/skills/eval-report` | Refresh `eval-report.md` reliability metrics. |
| `.cursor/skills/test-data-reset` | Manual cleanup of tracked test data via API. |
| `.cursor/agents/test-writer` | Implements Playwright specs from an on-disk plan. |
| `.cursor/agents/triage` | Classifies a failed build (readonly). |
| `.cursor/agents/bug-reporter` | Files bugs after triage confirms app defect (readonly). |
| `.cursor/hooks/guard-test-assertions` | Blocks edits that remove or weaken `expect()` in tests. |
| `.cursor/hooks/guard-constitution` | Blocks edits that violate constitution (XPath, `waitForTimeout`, tags on `describe`, etc.). |

## MCP setup (IDE)

Enable **Atlassian** and **GitHub** MCP in **Cursor Settings → MCP** and sign in there. Use MCP for Jira, Confluence, and PR/CI lookups while authoring or orchestrating — **do not** put MCP tokens in `.env` for IDE use. Playwright credentials stay in `.env` (`APP_*` only for day-to-day test runs). Optional: GitHub MCP in `.cursor/mcp.json` reads `GITHUB_PAT` from your **environment** (shell or Cursor env), not from the committed `.env` file.

## Typical flow

Pick a Jira story in **In QA**, analyze AC and its Confluence page into `features/<KEY>.feature.md`, and delegate implementation to **test-writer** against that plan. Run the new spec locally (or let CI run on PR), triage any red run before healing or bugging, then open a PR linked to the story and add the `tests-generated` label when the spec is green and merged.
