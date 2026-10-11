# Discord "No home channel set" — does it matter? (verified 2026-07-29)

## Why this exists

Bo saw the repeating Hermes system message on gmgrok's Discord ("No home
channel is set for Discord ... Type /sethome ...") and asked what it means
and whether it has any real effect. No.5 has the exact same unset state.
Rather than guessing from the message text alone, verify against the actual
source behavior.

## How to verify what an unset Hermes feature actually does

Don't answer from the warning text alone — grep the `hermes-agent` source
tree for where the setting is actually *read*, not just where the warning is
shown:

```bash
grep -rn "get_home_channel\|home_channel" \
  /Users/admin/Code/github.com/NousResearch/hermes-agent --include=*.py
```

This turned up the real call sites: `cron/scheduler.py`,
`tools/send_message_tool.py`, `gateway/session.py`. Read those, not just the
CLI help text or the warning banner.

## What `home_channel` actually gates

`home_channel` is a **fallback destination**, used only in two cases:

1. A cron job that does **not** specify an explicit `deliver` target and
   needs to figure out where to send output on a platform.
2. The agent calling `send_message` proactively (not as a reply) without an
   explicit destination.

If neither applies — e.g. the only cron job has `"deliver": "origin"` set
explicitly (check via `cronjob(action='list')`), and the agent never fires
unsolicited `send_message` — then **not setting home_channel has zero
practical effect**. It's a one-time informational nag, not a broken feature.

## Answering "will this affect anything" style questions

1. Read the source to find the real gating logic (not doc prose).
2. Check the account's actual cron jobs / send_message usage for whether the
   gated path is even exercised.
3. Give a direct yes/no on impact, then explain briefly why — don't just
   describe what the setting theoretically does.

## Setting home_channel when Bo says "ตั้งให้เรียบร้อยไปเลย" (2026-07-29)

There is **no CLI subcommand** to set this from outside a live chat — the
only user-facing entry point is typing `/sethome` *inside* the target Discord
chat itself (handled by `_handle_set_home_command` in
`gateway/slash_commands.py`). If Bo wants it set programmatically from a
terminal/agent session instead of typing the slash command, call the
underlying persistence function directly:

```bash
cd /Users/admin/Code/github.com/NousResearch/hermes-agent
source /Users/admin/.hermes-no5/venv/bin/activate
HERMES_HOME=/Users/admin/.hermes-no5 python3 -c "
from gateway.config import HomeChannel, persist_home_channel, Platform
home = HomeChannel(
    platform=Platform.DISCORD,
    chat_id='<chat_id>',
    name='<display_name>',
    thread_id=None,       # set if the target is a thread
    user_id='<discord_user_id>',
    scope_id=None,
)
persist_home_channel(home, enabled_if_new=True)
"
```

This writes `platforms.discord.home_channel` straight into `config.yaml`
(confirm with `grep -n -A8 '^platforms:' config.yaml`). Pull `chat_id` /
`user_id` from the live session env (`HERMES_SESSION_CHAT_ID`,
`echo $HERMES_SESSION_KEY`) or from `channel_directory.json` — don't guess
IDs.

**Pitfall — this does NOT take effect until the gateway restarts.**
`get_home_channel()` reads from an in-memory config object loaded at gateway
start, not the file on every call. Writing to `config.yaml` is necessary but
not sufficient; nothing changes for the *running* gateway until it reloads.
And a gateway cannot restart itself from inside its own process (see the
"Gateway restart จาก DM" pitfall above) — this has to be done from a
separate shell, or deferred to the next natural restart (update, reboot,
crash-recovery) if Bo doesn't want to interrupt the current chat right now.
