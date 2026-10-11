# Discord DM Display Mirroring Pattern

## Problem
Users want incoming Discord DM messages to be visible on tmux TUI panes in real-time so that everything appears as "one unified conversation flow", but running a TUI agent process with `hermes chat --tui --resume <discord_session_id>` at the same time as an active Hermes Gateway causes a severe **Split-Brain Race Condition** (two agent processes reading/writing the same SQLite session DB concurrently and generating interleaved responses).

## Solution
Use a **Display-Only Gateway Hook Plugin** (`discord-display-mirror`).

### Architecture
- **Single Execution Agent (Gateway)**: The Hermes Gateway process owns LLM turn execution and sends replies to Discord.
- **Read-Only Display Mirror Hook**: A Hermes plugin (`discord-display-mirror`) registers a `pre_llm_call` hook.
- When an incoming user message arrives on `platform == "discord"`, the hook intercepts the text and renders it on the active tmux TUI pane using `tmux display-message` without launching a duplicate LLM turn.

### Installation
Location across seats: `~/.hermes-*/plugins/discord-display-mirror/`

`plugin.yaml`:
```yaml
name: discord-display-mirror
description: Mirror incoming Discord DM messages onto active tmux TUI panes for display visibility without double-handling LLM turns.
```

`__init__.py`:
```python
import logging
import os
import subprocess

logger = logging.getLogger("hooks.discord-display-mirror")

def mirror_discord_message(session_id: str, user_message: str, platform: str = "", **kwargs):
    if platform != "discord":
        return
    if not user_message or not user_message.strip():
        return

    display_text = user_message.strip()
    if len(display_text) > 300:
        display_text = display_text[:300] + "..."

    tmux_pane = os.environ.get("TMUX_PANE")
    if tmux_pane:
        try:
            subprocess.run(
                ["tmux", "display-message", "-t", tmux_pane, f"💬 Discord DM: {display_text}"],
                capture_output=True,
                timeout=5,
            )
        except Exception as e:
            logger.debug("Failed to mirror to tmux pane: %s", e)

def register(ctx):
    ctx.register_hook("pre_llm_call", mirror_discord_message)
```

### Config Enable
Add `discord-display-mirror` to `plugins.enabled` in `config.yaml`:
```yaml
plugins:
  enabled:
    - discord-display-mirror
```
