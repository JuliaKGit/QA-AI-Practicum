---
name: api-test-design
description: Designs API test cases as a table a human approves, from api/CATALOG.md only (no OpenAPI or other spec), before any test code exists. Rows backed by catalog evidence `executed` get expected status and body rules (characterization); all other rows are `assumed — ask` or `not yet tested` with no expected result. Use when the user asks what to test for an endpoint or an area of the API, asks for test cases, test ideas, a test plan or coverage. Writes api/test-design/<area>.md and stops for approval. Do NOT use to write test code — that is api-contract-tests.
paths: "api/**"
---

# API test design

Catalog-only design. This skill produces an approval table; **api-contract-tests** turns approved rows into Playwright specs.

## Steps

1. Read the endpoints for the area in **api/CATALOG.md** (table and **Not yet tested**). Do not use OpenAPI, Confluence, or chat as expected-result sources.
2. Write **api/test-design/<area>.md**, one table per endpoint:

   ID | type (positive / negative / error) | what we send | expected status |
   expected body (rule, key values) | source (CATALOG.md row or section) | technique

3. **Positive (characterization):** For each catalog table row with evidence **executed**, at least one row that pins the observed success case — status, content type, and response shape fields/types exactly as cataloged. Add one row per documented request option visible in the catalog row (e.g. write body fields listed for POST).
4. **Negative**, with the technique named in its column (no expected status/body unless an **executed** catalog row covers that case):
   - **boundary values:** 0, the smallest valid value, exactly at a limit, one over it;
   - **equivalence classes:** one row per kind of bad input (missing field, empty string, wrong type, negative number);
   - **state:** the step done in the wrong order or done twice.
5. **Errors:** Rows that probe 4xx/5xx or business rules **not** backed by an **executed** catalog row → mark **assumed — ask** or **not yet tested**, cite **CATALOG.md → Not yet tested** or the gap, and leave expected status/body empty. Do not invent status codes or error shapes.
6. **Auth / family (fixtures: `mainApi`, `altApi`, `anonApi`):**
   - **apiAnonymous:** same method and path as the positive case, no token (`anonApi`). Expected results only if catalog evidence **executed** documents that call; otherwise **not yet tested**, no expected result.
   - **apiAlt on mainApi data:** same request another family would use against a resource id created under **mainApi** (`altApi` on main-owned id). Expected results only if catalog evidence **executed** covers it; otherwise **assumed — ask**, no expected result.
7. **Not in catalog:** a row marked **assumed — ask** with the question to resolve, and no expected result.
8. **Stop.** Show the table and wait for the human to answer "approved" or ask for changes. Write no test code.
