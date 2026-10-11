# TUI vs Discord DM Live Session Isolation

**Date**: 2026-08-14

## Context & Live Audit
When Bo via No.1 asked gmgrok to verify live machine state on maclab (without relying on stale focus notes):
1. **TUI Command Line**:
   - `ps -ww -p <pid> -o args` -> `/Users/admin/.hermes-maclab/venv/bin/python3 /Users/admin/.hermes-gmgrok/venv/bin/hermes chat --yolo` (No `--resume`)
   - `HERMES_HOME=/Users/admin/.hermes-gmgrok`
2. **Database Row Isolation (`state.db`)**:
   - TUI session row: `id = "20260813_204640_7ce985"`, `source = "tui"`, `session_key = NULL`
   - Discord DM session row: `id = "20260813_185424_83f562fb"`, `source = "discord"`, `session_key = "agent:main:discord:dm:1518456063224189090"`
3. **Architectural Standard**:
   - "Unification" in Hermes means sharing the same `HERMES_HOME` (skills, memories, configs, ARRA context), **NOT** writing to the same session row in `state.db`.
   - Running `--resume <discord_session_id>` inside TUI while Gateway is active creates twin LLM writers on the same session row -> causes `SQLITE_BUSY`, interleaved response lines, and dropped Discord messages.
   - Display visibility of Discord DMs on tmux is achieved read-only via `discord-display-mirror` plugin, maintaining single-writer safety for Gateway on Discord DM rows.
