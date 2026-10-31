# Children API — test design

Source: **api/CATALOG.md** only (2026-10-16 capture). No dedicated `GET /api/v1/children`; created children appear under `GET /api/v1/me` → `family.children` (separate endpoint design).

Approve or request changes before **api-contract-tests** implements specs.

---

## POST `/api/v1/children`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
|----|------|--------------|-----------------|----------------------------------|--------|-----------|
| CH-POST-01 | positive | `mainApi` + Bearer; JSON body with catalog fields: `firstName`, `birthYear`, `birthMonth`, `gender`, `interests` (array, may be empty) | 201 | `Content-Type` includes `application/json`; object with `id` (string), `firstName` (string), `birthYear` (number), `birthMonth` (number), `age` (number), `gender` (string), `interests` (array), `avatarKey` (string \| null); echo or consistent `firstName` / birth fields vs request | CATALOG.md table row POST `/api/v1/children` (`executed`) | characterization |
| CH-POST-02 | positive | Same as CH-POST-01; `interests` non-empty array of strings | 201 | Same shape as CH-POST-01; `interests` array present | CATALOG.md request body lists `interests` (array) (`executed`) | characterization |
| CH-POST-03 | negative | Valid-looking body but omit `firstName` | — | — | CATALOG.md → Not yet tested (error shapes) | equivalence classes |
| CH-POST-04 | negative | Omit `birthYear` | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-05 | negative | Omit `birthMonth` | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-06 | negative | Omit `gender` | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-07 | negative | `firstName` empty string | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-08 | negative | `birthYear` wrong type (string) | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-09 | negative | `birthMonth` 0 | — | — | CATALOG.md → Not yet tested | boundary values |
| CH-POST-10 | negative | `birthMonth` 12 (if valid max unknown) | — | — | assumed — ask: valid `birthMonth` range? | boundary values |
| CH-POST-11 | negative | `birthMonth` 13 | — | — | assumed — ask: valid `birthMonth` range? | boundary values |
| CH-POST-12 | negative | `birthYear` future year | — | — | assumed — ask: max/min birth year? | boundary values |
| CH-POST-13 | error | Malformed JSON body | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-POST-14 | error | `mainApi` duplicate POST with identical payload twice (two children) | — | — | assumed — ask: duplicates allowed? | state |
| CH-POST-15 | error | `anonApi`; same JSON body as CH-POST-01, no `Authorization` | — | — | CATALOG.md → Not yet tested (401 noted for GET only, not POST) | apiAnonymous |
| CH-POST-16 | error | `altApi`; same JSON body as CH-POST-01 | — | — | assumed — ask: does alt family share same create rules / isolation? | apiAlt on mainApi data |

---

## DELETE `/api/v1/children/{id}`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
|----|------|--------------|-----------------|----------------------------------|--------|-----------|
| CH-DEL-01 | positive | `mainApi` + Bearer; `id` from CH-POST-01 create response | 204 | empty body | CATALOG.md table row DELETE `/api/v1/children/{id}` (`executed`) | characterization |
| CH-DEL-02 | negative | `mainApi`; path id syntactically valid but not owned / never created (e.g. random UUID) | — | — | CATALOG.md → Not yet tested | equivalence classes |
| CH-DEL-03 | error | `mainApi`; DELETE same `id` as CH-DEL-01 again after successful delete | — | — | CATALOG.md → Not yet tested | state |
| CH-DEL-04 | error | `anonApi`; DELETE with valid main-owned `id`, no token | — | — | CATALOG.md → Not yet tested | apiAnonymous |
| CH-DEL-05 | error | `altApi`; DELETE `id` created by `mainApi` (CH-POST-01), alt token present | — | — | assumed — ask: cross-family delete allowed (403/404)? | apiAlt on mainApi data |

---

## Cross-endpoint (catalog-backed flow)

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
|----|------|--------------|-----------------|----------------------------------|--------|-----------|
| CH-FLOW-01 | positive | After CH-POST-01, `mainApi` `GET /api/v1/me`; then CH-DEL-01 cleanup | 200 on GET; 204 on DELETE | GET: `family.children` array includes created `id`; DELETE empty | CATALOG.md narrative + POST/DELETE rows (`executed`); GET `/api/v1/me` row | state |

---

**Approval:** reply `approved` or list row IDs to change.
