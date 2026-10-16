"""Shared evidence scorer gate: runs score-evidence.ts on current.json only."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

EVIDENCE_CURRENT = Path(".test-artifacts/evidence/current.json")
APPROVALS_DIR = Path(".test-artifacts/approvals")


def repo_root_from_hook() -> Path:
    return Path(__file__).resolve().parents[2]


def run_scorer(root: Path) -> dict[str, Any]:
    evidence_path = root / EVIDENCE_CURRENT
    if not evidence_path.is_file():
        raise FileNotFoundError(f"missing {EVIDENCE_CURRENT.as_posix()}")
    cmd = [
        "npx",
        "tsx",
        "scripts/score-evidence.ts",
        "--verify-only",
        EVIDENCE_CURRENT.as_posix(),
    ]
    proc = subprocess.run(
        cmd,
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
        shell=os.name == "nt",
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"score-evidence failed ({proc.returncode}): {proc.stderr.strip() or proc.stdout.strip()}"
        )
    line = proc.stdout.strip().splitlines()[-1]
    return json.loads(line)


def current_git_branch(root: Path) -> str:
    proc = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
        shell=os.name == "nt",
    )
    if proc.returncode != 0:
        return ""
    return proc.stdout.strip()


def has_human_approval(root: Path, decision_id: str) -> bool:
    approval_path = root / APPROVALS_DIR / f"{decision_id}.json"
    if not approval_path.is_file():
        return False
    try:
        data = json.loads(approval_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    return data.get("decisionId") == decision_id


def heal_allowed(decision: dict[str, Any], root: Path) -> bool:
    if decision.get("decision") == "act" and decision.get("side") == "drift":
        return True
    if decision.get("decision") == "escalate":
        return has_human_approval(root, decision.get("decisionId", ""))
    return False


def bug_create_allowed(decision: dict[str, Any], root: Path) -> bool:
    if decision.get("decision") == "act" and decision.get("side") == "bug":
        return True
    if decision.get("decision") == "escalate":
        return has_human_approval(root, decision.get("decisionId", ""))
    return False


def format_deny(decision: dict[str, Any], gate: str, detail: str) -> str:
    missing = decision.get("missing") or []
    contradictions = decision.get("contradictions") or []
    parts = [
        f"Blocked by {gate}.",
        f"decisionId={decision.get('decisionId')}",
        f"decision={decision.get('decision')}",
        f"side={decision.get('side')}",
        f"score={decision.get('score')}",
        f"rule={decision.get('rule')}",
        detail,
    ]
    if missing:
        parts.append(f"missing={','.join(missing)}")
    if contradictions:
        parts.append(f"contradictions={','.join(contradictions)}")
    return " ".join(parts)


def emit_deny(message: str) -> int:
    payload = {
        "permission": "deny",
        "user_message": message,
        "agent_message": message,
    }
    sys.stdout.write(json.dumps(payload) + "\n")
    print(message, file=sys.stderr)
    return 2


def emit_allow() -> int:
    sys.stdout.write(json.dumps({"permission": "allow"}) + "\n")
    return 0


def write_target_path(payload: dict[str, Any]) -> str | None:
    file_path = payload.get("file_path")
    if isinstance(file_path, str) and file_path:
        return file_path
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, dict):
        for key in ("path", "file_path", "target_file", "filePath"):
            value = tool_input.get(key)
            if isinstance(value, str) and value:
                return value
    return None


def normalized_repo_path(file_path: str) -> str:
    return file_path.replace("\\", "/")


def is_pages_write(file_path: str) -> bool:
    normalized = normalized_repo_path(file_path)
    return normalized.startswith("pages/") or "/pages/" in normalized


def is_approvals_write(file_path: str) -> bool:
    normalized = normalized_repo_path(file_path)
    return normalized.startswith(".test-artifacts/approvals/") or "/.test-artifacts/approvals/" in normalized


def is_heal_pr_command(command: str) -> bool:
    stripped = command.strip()
    if "gh pr create" not in stripped:
        return False
    return True


def parse_create_jira_issue_type(payload: dict[str, Any]) -> str | None:
    if payload.get("tool_name") != "createJiraIssue":
        return None
    raw = payload.get("tool_input")
    params: dict[str, Any] | None = None
    if isinstance(raw, str):
        try:
            params = json.loads(raw)
        except json.JSONDecodeError:
            return None
    elif isinstance(raw, dict):
        params = raw
    if not params:
        return None
    issue_type = params.get("issueType")
    if isinstance(issue_type, str):
        return issue_type
    return None
