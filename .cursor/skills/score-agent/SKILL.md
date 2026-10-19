---
name: score-agent
description: Scores an agent against an answer key and appends the result to eval-report.md. Use when the user asks how accurate an agent is, wants to score triage, self-heal, or test generation, or after cases are added to an evals/*/answer-key.json.
---

# Score agent

Measure classification accuracy for an agent (e.g. triage) against `evals/<agent>/answer-key.json`. The agent under test must never read `answer-key.json` during a run.

## Workflow

1. **Cases** — Human maintains `evals/<agent>/answer-key.json`: `{ "id", "input", "expected" }` with `expected` ∈ `drift` | `bug` | `ambiguous`. Do not edit the answer key as the agent.
2. **One scoring pass** — For each case, run the agent on `input` only (no answer key). Collect `predicted` and a short `evidence` string. Write one run file:

   `evals/<agent>/runs/<YYYY-MM-DD>-<n>.json`

   ```json
   {
     "model": "<model slug>",
     "startedAt": "<ISO-8601>",
     "finishedAt": "<ISO-8601>",
     "predictions": [{ "id": "<case id>", "predicted": "drift|bug|ambiguous", "evidence": "..." }]
   }
   ```

   Include every case id from the answer key in each run file.

3. **Repeat** — Default **N = 3** independent passes (new run file each time) to observe stability.
4. **Score** — From repo root:

   ```bash
   npx tsx evals/score.ts <agent>
   ```

   Captures per-class precision and recall, overall accuracy, false positives per class, and cross-run agreement (share of cases where all runs predicted the same class). Exit code 2 if any run references an id not in the key.

5. **Report** — Append a dated section to `eval-report.md`:

   ```markdown
   ## Agent accuracy — <agent> (<ISO date>)

   - **Runs:** <N> files under `evals/<agent>/runs/`
   - **Cases:** <count> in answer key
   - **How measured:** Agent executed per case without answer key; scored with `npx tsx evals/score.ts <agent>`
   - **Overall accuracy:** <per run or range>
   - **Per class:** drift / bug / ambiguous — precision, recall, false positives (from scorer output)
   - **Cross-run agreement:** <percent>
   - **Interpretation:** <one line>
   ```

## Rules

- Never load or cite `answer-key.json` in the agent session that produces predictions.
- Do not modify `answer-key.json`; only the human adds or changes cases.
- Use the same `<agent>` folder name as the scorer argument (e.g. `triage`).