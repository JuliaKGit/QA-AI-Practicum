#!/usr/bin/env python3
"""beforeMCPExecution: gate Atlassian createJiraIssue when issueType is Bug."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import guard_evidence_lib as lib  # noqa: E402

AQPBT_BUG_ISSUE_TYPE = "Bug"


def main() -> int:
    raw = sys.stdin.read()
    if not raw.strip():
        return lib.emit_allow()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"{name}: invalid JSON — {exc}", file=sys.stderr)
        return lib.emit_allow()

    issue_type = lib.parse_create_jira_issue_type(payload)
    if issue_type != AQPBT_BUG_ISSUE_TYPE:
        return lib.emit_allow()

    root = lib.repo_root_from_hook()
    try:
        decision = lib.run_scorer(root)
    except (FileNotFoundError, RuntimeError, json.JSONDecodeError) as exc:
        return lib.emit_deny(f"guard-jira-bug-gate: scorer unavailable — {exc}")

    if lib.bug_create_allowed(decision, root):
        return lib.emit_allow()

    detail = "Need act+bug or escalate with .test-artifacts/approvals/<decisionId>.json"
    return lib.emit_deny(lib.format_deny(decision, "guard-jira-bug-gate", detail))


if __name__ == "__main__":
    sys.exit(main())
