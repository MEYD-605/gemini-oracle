#!/usr/bin/env python3
"""agy-goal-stop.py — adapter: agy `Stop` hook -> fleet /goal engine (sombo-oracle scripts/goal.py hook-stop).

Why: goal.py was written for Claude Code's Stop hook (stdin {"cwd"}, stdout {"decision":"block"}).
agy's Stop hook contract (agy-customizations/docs/hooks.md §6) sends workspacePaths and blocks a stop with
{"decision":"continue","reason":...}. This wrapper translates both ways and never edits goal.py.
Fails open: any error -> print nothing -> the agent may stop (a broken hook must not trap the seat).
No.6 2026-10-22.
"""
import json
import os
import subprocess
import sys

GOAL_PY = os.environ.get("GOAL_PY", "/Users/admin/.claude/hooks/goal.py")


def start(data: dict, cwd: str) -> None:
    """SessionStart: re-inject the ACTIVE goal after /clear or a seat restart (goal.py hook-start prints plain text)."""
    r = subprocess.run([sys.executable, GOAL_PY, "hook-start"], input=json.dumps({"cwd": cwd}),
                       capture_output=True, text=True, timeout=20, env={**os.environ, "CLAUDE_PROJECT_DIR": cwd})
    if r.returncode == 0 and r.stdout.strip():
        print(json.dumps({"injectSteps": [{"systemMessage": {"systemMessage": r.stdout.strip()}}]}))


def main() -> None:
    try:
        data = json.loads(sys.stdin.read() or "{}")
    except ValueError:
        return
    paths = data.get("workspacePaths") or []
    cwd = data.get("cwd") or (paths[0] if paths else os.getcwd())
    if sys.argv[1:2] == ["start"]:
        return start(data, cwd)
    # Only a normal turn end may be held; errors/cancels/budget stops must pass through.
    if data.get("terminationReason") not in (None, "", "NO_TOOL_CALL"):
        return
    r = subprocess.run(
        [sys.executable, GOAL_PY, "hook-stop"],
        input=json.dumps({"cwd": cwd}),
        capture_output=True,
        text=True,
        timeout=110,
        env={**os.environ, "CLAUDE_PROJECT_DIR": cwd},
    )
    out = r.stdout.strip()
    if r.returncode != 0 or not out:
        return
    try:
        msg = json.loads(out)
    except ValueError:
        return
    if msg.get("decision") == "block":
        print(json.dumps({"decision": "continue", "reason": msg.get("reason", "")}))
    elif msg.get("systemMessage"):
        print(json.dumps({"injectSteps": [{"systemMessage": {"systemMessage": msg["systemMessage"]}}]}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
