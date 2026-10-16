#!/usr/bin/env python3
"""preToolUse (Write): deny agent writes under .test-artifacts/approvals/."""

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

    target = lib.write_target_path(payload)
    if not target or not lib.is_approvals_write(target):
        return lib.emit_allow()

    return lib.emit_deny(
        "Blocked by guard-approvals: approval files under .test-artifacts/approvals/ "
        "must be created by a human outside the agent (not via Write)."
    )


if __name__ == "__main__":
    sys.exit(main())
