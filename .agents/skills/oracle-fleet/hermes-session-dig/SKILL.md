---
name: hermes-session-dig
description: Mine Hermes session history from SQLite state.db (~/.hermes-gmgrok/state.db) for session timelines, models used, tool call counts, and session topics across CLI, Discord DM, and subagents.
tags: [hermes, dig, sessions, timeline, state-db, sqlite]
---

# Hermes Session Dig

When requested to view session history, timeline, past work, or dig through Hermes sessions (where `dig.py` returns 0 files because session data lives in SQLite rather than Claude Code `.jsonl` files), query `~/.hermes-gmgrok/state.db`.

## Querying Hermes SQLite DB

Connect to `~/.hermes-gmgrok/state.db` and query the `sessions` table:

```python
import sqlite3
from datetime import datetime

conn = sqlite3.connect('/Users/admin/.hermes-gmgrok/state.db')
c = conn.cursor()
c.execute('''
    SELECT id, source, model, datetime(started_at, 'unixepoch', 'localtime') as st, message_count, tool_call_count, title
    FROM sessions
    ORDER BY started_at ASC
''')
rows = c.fetchall()
```

## Schema Reference for `sessions` table
- `id`: Session ID string (e.g. `20260725_225505_59d7c399`)
- `source`: Platform origin (`cli`, `discord`, `subagent`)
- `model`: Primary model used (`ag/gemini-3.6-flash-high`, `glm-5.2`, `grok-4.5`, etc.)
- `started_at`: Timestamp (epoch seconds)
- `message_count`: Total messages exchanged
- `tool_call_count`: Total tool executions
- `title`: Session topic / title

## Formatting Output
Render the timeline grouped by date or as a chronological table:
- **Date**: `MMM DD, YYYY`
- **Time**: `HH:MM`
- **Session ID**: Short form (`id[:12]`)
- **Src / Model**: Source & model
- **Msgs / Tools**: Message count & tool count
- **Title**: Clean title or fallback focus summary

## Related Skills
- **hermes-subagent** — how to *spawn* a non-interactive Hermes subagent; sessions it creates appear here with `source: subagent`.

## Pitfalls & Lessons
- **Claude Code vs Hermes Dig Mismatch**: Standard `dig.py` scans `.jsonl` files in `~/.claude/projects/`. When running under Hermes Agent, session history is stored in SQLite (`~/.hermes-gmgrok/state.db`). If `dig.py` returns empty or zero sessions, fall back immediately to querying SQLite `state.db`.
- **2025 Genesis vs Session Window Limitation**: Never rely on `dig.py` or SQLite session windows alone to trace the machine's origin. Bo started running AI on OPPO Find N3 Fold (Termux, llama.cpp+qwen2.5-1.5b) in Sept 2025 -> Jetson Orin Nano -> Proxmox AI-Core (April 2026). Always query ARRA Oracle Vault (`IDENTITY_ANCHOR.md`) for full historical lineage.

