#!/usr/bin/python3
"""Resolve the CURRENT Hermes session for handoff headers.

Replaces the dead Claude Code `~/.claude/projects/*.jsonl` lookup — gmgrok has
run on Hermes since the grok-CLI retirement, so session state lives in
$HERMES_HOME/state.db, not in a jsonl transcript directory.

Usage:  /usr/bin/python3 session-id.py [--cwd /path/to/repo]
Output: SESSION: <8-char id> | <title> | msgs=<N> | ctx=<pct>%
Exit 0 always — a failed lookup prints nothing so /forward can skip silently.
"""
import sqlite3, os, sys, json

home = os.environ.get("HERMES_HOME") or os.path.expanduser("~/.hermes-gmgrok")
db = os.path.join(home, "state.db")
cwd = None
if "--cwd" in sys.argv:
    try:
        cwd = sys.argv[sys.argv.index("--cwd") + 1]
    except IndexError:
        pass

if not os.path.exists(db):
    sys.exit(0)

try:
    con = sqlite3.connect("file:%s?mode=ro" % db, uri=True)
    # Newest non-archived session, preferring one rooted at this repo.
    row = None
    if cwd:
        row = con.execute(
            "SELECT id,title,message_count,input_tokens,model FROM sessions "
            "WHERE archived=0 AND cwd=? ORDER BY started_at DESC LIMIT 1", (cwd,)
        ).fetchone()
    if not row:
        row = con.execute(
            "SELECT id,title,message_count,input_tokens,model FROM sessions "
            "WHERE archived=0 ORDER BY started_at DESC LIMIT 1"
        ).fetchone()
    if not row:
        sys.exit(0)

    sid, title, msgs, intok, model = row
    parts = ["SESSION: %s" % sid[-8:]]
    if title:
        parts.append(title[:48])
    parts.append("msgs=%s" % (msgs or 0))
    if model:
        parts.append(str(model))
    print(" | ".join(parts))
except Exception:
    pass
