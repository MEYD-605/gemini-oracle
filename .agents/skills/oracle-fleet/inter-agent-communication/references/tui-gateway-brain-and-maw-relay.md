# TUI vs Gateway Split-Brain & Maw-Relay Auto-Relay Technical Notes

## 1. Gateway Daemon vs TUI Pane Process Architecture
In Hermes Agent (as of v0.19.x), a host running multi-seat agent profiles (like MacLab) maintains two distinct process types per seat:
- **Gateway Daemon** (`hermes gateway run`): Background process managed by launchd/systemd that handles messaging platform adapters (Discord, Telegram, etc.).
- **TUI Pane** (`hermes chat --tui`): Interactive CLI session running inside a tmux window.

Both processes read configuration from the same `$HERMES_HOME/config.yaml`. However, they manage distinct conversation session keys:
- Discord DM uses a session key tied to `discord:<user_id>`.
- TUI uses a session key generated for that terminal session (or explicit `--resume <id>`).

## 2. The Split-Brain / SQLite Lock Collision Pitfall
Attempting to "unify" TUI and Discord DM by launching TUI with `--resume <gateway_discord_session_id>` creates a **FATAL SQLite write-lock collision** in `~/.hermes-<seat>/state.db`:
- Both the Gateway daemon and the TUI process hold open file descriptors to `state.db` and try to write to the same session row concurrently.
- As user messages arrive on Discord while the TUI process is active, turn execution races between the two processes.
- One or both turns fail with storage errors, and the user experiences out-of-context replies ("คุยคนละเรื่อง").

**Rule**: Never resume a TUI process on an active Gateway session ID. Keep Gateway DM sessions and TUI terminal sessions on distinct session keys.

## 3. Read-Only Display Mirror Pattern (`discord-display-mirror`)
To show Discord DM messages on a TUI screen without causing Split-Brain:
- Deploy a Gateway Hook (`discord-display-mirror`) registered on `agent:start`.
- The hook intercepts incoming Discord DM events and writes the message text directly to the target tmux pane's display/scrollback in **Read-Only mode**.
- The TUI pane does **NOT** spawn an LLM agent or participate in turn execution — it serves purely as a visual mirror.

## 4. Auto-Relay via `post_llm_call` Plugin Hook
To solve the issue where agents finish thinking in their TUI pane without sending their response back to another seat via `maw hey`:
- Deploy `maw-relay` plugin (`~/.hermes-<seat>/plugins/maw-relay/`).
- The plugin registers a `post_llm_call` hook.
- When an incoming message includes an instruction like `ตอบกลับ maw hey <target>` or `reply via maw hey <target>`, the hook automatically invokes `maw hey <target> "<assistant_response>"` in a subprocess upon turn completion.
- Both the Gateway daemon and TUI pane must be restarted/respawned whenever plugins or `config.yaml` are updated.
