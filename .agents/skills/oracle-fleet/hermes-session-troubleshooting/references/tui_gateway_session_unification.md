# TUI vs Gateway Discord DM Session Unification & Context Bridge Architecture

## Architecture & Root Cause
1. **Namespace Separation**: `build_session_key()` separates session keys by `(platform, chat_id, profile)`. TUI CLI (`source=tui`) and Discord DM (`source=discord:dm:<id>`) use distinct rows in `state.db`.
2. **P0 Sole-Writer Invariant**: SQLite WAL mode allows concurrent readers, but two writers on the same session row (e.g. Gateway + TUI `--resume`) trigger `SQLITE_BUSY`, causing lost messages or crashed TUI sessions.
3. **`group_sessions_per_user` Clarification**: `group_sessions_per_user` governs Gateway message-to-session mapping for inbound webhooks/events. It does NOT merge separate process namespaces (TUI vs Discord Gateway).

## Single-Pipe Architecture Comparison (Codex / Soul-Brews)
In single-pipe architectures like Codex/Soul-Brews (พี่ณัฐ / Codex OMX), UI clients interface via a unified headless event bus / IPC channel rather than dual independent agents writing to a shared local relational DB.

## Recommended Solution: Shared File-Based Context Bridge
To achieve 100% awareness between Discord DM and TUI without violating Sole-Writer DB invariants:

1. **Gateway DM Export**: Use `post_llm_call` hook in Discord Gateway to export recent N messages to `ψ/live/<seat>-discord-context.md`.
2. **TUI Context Import**: Use `pre_llm_call` hook in TUI sessions to read `ψ/live/<seat>-discord-context.md` and inject it into prompt context.
3. **Safety**: Zero risk of DB lock (`SQLITE_BUSY`) or split-brain out-of-order writes.
