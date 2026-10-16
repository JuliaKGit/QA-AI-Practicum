#!/usr/bin/env python3
"""beforeShellExecution: gate gh pr create on heal/* via score-evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import guard_evidence_lib as lib  # noqa: E402


def main() -> int:
    raw = sys.stdin.read()
    if not raw.strip():
        return lib.emit_allow()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"{name}: invalid JSON — {exc}", file=sys.stderr)
        return lib.emit_allow()

    command = payload.get("command")
    if not isinstance(command, str) or not lib.is_heal_pr_command(command):
        return lib.emit_allow()

    root = lib.repo_root_from_hook()
    branch = lib.current_git_branch(root)
    if not branch.startswith("heal/"):
        return lib.emit_allow()

    try:
        decision = lib.run_scorer(root)
    except (FileNotFoundError, RuntimeError, json.JSONDecodeError) as exc:
        return lib.emit_deny(f"guard-pr-gate: scorer unavailable — {exc}")

    if lib.heal_allowed(decision, root):
        return lib.emit_allow()

    detail = "Need act+drift or escalate with .test-artifacts/approvals/<decisionId>.json"
    return lib.emit_deny(lib.format_deny(decision, "guard-pr-gate", detail))


if __name__ == "__main__":
    sys.exit(main())
