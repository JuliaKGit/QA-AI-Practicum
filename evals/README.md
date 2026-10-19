# Agent evals

Each agent has `evals/<agent>/answer-key.json` (you maintain; entries `{ id, input, expected }` with `expected` in `drift` | `bug` | `ambiguous`) and `evals/<agent>/runs/<date>-<n>.json` (one scoring pass per file).
Run the agent on each case `input` without exposing the answer key; write `predictions` with `id`, `predicted`, and `evidence`.
Repeat independent passes (default three) to measure stability.
Score with `npx tsx evals/score.ts <agent>` for per-class precision/recall, accuracy, false positives, and cross-run agreement.
The score-agent skill runs this workflow and appends an **Agent accuracy** section to `eval-report.md`.
