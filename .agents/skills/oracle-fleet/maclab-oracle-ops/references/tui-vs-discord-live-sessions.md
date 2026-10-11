# TUI vs Discord DM Live Session Architecture & Inspection (2026-08-14)

## Architecture Rules
1. **Separate Session Rows:** When TUI and Discord Gateway run under the same `HERMES_HOME` (sharing `state.db`), TUI and Gateway MUST write to distinct session rows (`source=tui` vs `source=discord`).
2. **No `--resume` on Live DM Rows:** Never pass `--resume <live_discord_sid>` to a TUI process while Gateway is actively processing turns for that DM (`ended_at IS NULL`). Concurrent turns on the same session row lead to `SQLITE_BUSY` errors, race conditions, and message corruption.
3. **Stale Process Command Line Traps:** `ps aux` command lines reflect the initial invocation flags. If a TUI process was started as `hermes chat --yolo --resume <session_A>`, it will continue to show `--resume <session_A>` in `ps` output even after `<session_A>` transitions to `ended_at IS NOT NULL` (e.g. `end_reason=new_session`) and the TUI creates a new active session `<session_B>`.
4. **Verification via SQLite:** Always verify active sessions by checking `state.db` directly:
   ```sql
   SELECT id, source, session_key, model, started_at, last_activity_at 
   FROM sessions 
   WHERE ended_at IS NULL AND IFNULL(archived,0)=0;
   ```
5. **No Gateway Bounce Necessary:** Discovering separate active sessions between TUI and Discord is expected behavior when `tui_auto_resume_recent: false` and `group_sessions_per_user: false`. Do not restart or kill active Gateway processes when sessions are operating normally on separate rows.
6. **Read-Only Discord DM Glass Pattern (`discord-dm-readonly-tail.sh`):** When the user wants a local tmux display/window to see the live Discord DM conversation in real-time ("เห็นเรื่องเดียวกันพร้อมกัน"), NEVER pass `--resume` to a second TUI process. Instead, launch a read-only tailer (`/Users/admin/ClubS-Workspace/scripts/discord-dm-readonly-tail.sh <seat>`) in a dedicated tmux window (e.g. `discord-glass`). The mirror connects to `state.db` with `mode=ro`, polls `source='discord' AND ended_at IS NULL` sessions, and displays real-time user/assistant turns safely without write locks or LLM execution.
