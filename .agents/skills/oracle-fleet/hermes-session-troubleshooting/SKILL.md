---
name: hermes-session-troubleshooting
description: "Use when agent hallucinations, session errors, or TUI/Gateway session split-brain context issues occur."
tags: [hermes, session, troubleshooting, context-bloat, slash-commands]
---

# Hermes Session Troubleshooting

Guidelines and diagnostic procedures for handling agent session instability, hallucination/repetition, and gateway command execution.

## 1. Context Bloat & Session Instability
When an agent (e.g., No.5 `gmforge`, No.4 `mimo`) starts hallucinating, repeating executed steps, taking excessive time to respond, or acting confused:

### Diagnostic Steps
1. **Check Tool Call Volume vs Message Count**:
   - Context bloat isn't solely driven by wall-clock time or message count. A brief ~20-minute conversation can suffer severe bloat if there is a **Tool Call Storm** (e.g., 100+ tool calls yielding 150KB+ of stdout/JSON output).
   - Massive tool output drowns out prompt history, leading to **Attention Dilution** where the model loses track of completed actions vs pending tasks and enters a panic/recursive search loop.
   ```python
   import sqlite3
   conn = sqlite3.connect('/Users/admin/.hermes-<profile>/state.db')
   c = conn.cursor()
   c.execute("SELECT count(*), sum(tool_call_count) FROM sessions WHERE id = '...'")
   print('Message & Tool Call count:', c.fetchone())
   ```
2. **Evaluate Threshold**:
   - Sessions with >100 tool calls or >150 messages suffer severe **Context Bloat**.
   - Mid-session model switches or broad open-ended prompts amplify attention dilution across mismatched system defaults.

### Verification & Resolution
- **Verify Execution First**: Check git logs or target output files to confirm if the work was actually completed on disk/repo despite the agent's rambling.
- **Tune Anti-Bloat Compression**: Adjust `~/.hermes-<profile>/config.yaml` to prune aggressive tool outputs early:
  ```yaml
  compression:
    enabled: true
    threshold: 0.25
    proactive_prune_tokens: 32000
    protect_last_n: 15
    idle_compact_after_seconds: 900
  ```
- **Fresh Session Reset**: Advise issuing `/new` in the chat to flush context and start a clean session under the current configured model.

## 2. Slash Commands vs Direct Input
- Hermes Gateway processes built-in core slash commands (`/new`, `/clear`, `/model`, `/status`).
- Custom or non-core slash subcommands sent directly as chat text without gateway registration will return `Unknown command`.
- **Solution**: Execute the underlying skill/script directly via CLI/tools or configure gateway prompt handlers when appropriate.

## 3. Gateway vs TUI Session Isolation & Unification
When users ask why TUI/CLI sessions and Discord Gateway DMs do not share memory 100% or why `group_sessions_per_user: false` didn't merge them:

- **Root Cause**: `build_session_key()` separates session namespaces by platform (`tui` vs `discord:dm:<id>`). SQLite WAL mode enforces a P0 Sole-Writer rule per session row; multiple processes writing to the same row cause `SQLITE_BUSY`.
- **`group_sessions_per_user`**: Controls message grouping per platform in Gateway, NOT cross-process DB merging between TUI and Gateway daemon.
- **Recommended Solution (Shared Context Bridge Pattern)**: Use out-of-band file-based context exchange (`ψ/live/<seat>-discord-context.md`) hooked via `post_llm_call` (Gateway export) and `pre_llm_call` (TUI import) instead of single-session DB sharing.

## 4. Subagent Completion Reporting Pitfalls
- **Human Reporting Obligation**: Subagent verification must never happen in a vacuum ("ไม่บอกคนรับแล้วกูจะรู้"). When subagents complete work and live verification finishes, the orchestrator MUST immediately output a clean, explicit status report to the user in chat/DM detailing what was tested and verified live.

## 5. Related References & Case Studies
- [`references/root_cause_attention_dilution.md`](references/root_cause_attention_dilution.md): Detailed root cause case study of tool storms (100+ calls), attention dilution, and anti-bloat tuning configs.
- [`references/tui_gateway_session_unification.md`](references/tui_gateway_session_unification.md): Architecture breakdown of TUI vs Discord Gateway session isolation, P0 Sole-Writer invariants, `group_sessions_per_user`, and the Shared Context Bridge pattern.


