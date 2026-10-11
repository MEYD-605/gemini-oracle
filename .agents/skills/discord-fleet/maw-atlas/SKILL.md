---
name: maw-atlas
description: Use when reading Discord channel history via maw-atlas.
category: discord-fleet
tags: [discord, fleet, maw-atlas, history, channels, bun]
---

# maw-atlas — Discord Fleet Channel & History Inspection

Use this skill when reading Discord channel messages, listing guild structures, inspecting threads, or backfilling message history across the Oracle Discord fleet using `maw atlas`, `discord-backfill-cli`, or direct `bun` execution.

## Quick Commands

```bash
# List all guilds, text channels, and voice channels
maw atlas ls

# Read recent messages from a channel (by name or ID)
maw atlas read <channel-id|name> 50

# Standalone backfill for entire Guild via standalone CLI
export DISCORD_BOT_TOKEN="<token>"
bun run /Users/admin/Code/github.com/MEYD-605/discord-backfill-cli/bin/discord-backfill.ts guild --guild="Wormhole Server" --all

# Inspect channel state & watermark
bun run /Users/admin/Code/github.com/MEYD-605/discord-backfill-cli/bin/discord-backfill.ts cursor <channelId>

# Read raw Discord JSON payload
maw atlas read <channel-id> 20 --format json

# Check bot identity across fleet guilds
maw atlas whoami
```

## Workflow & Direct Execution Fallback

1. **Discover Channels & Guilds**:
   Run `maw atlas ls` or use `discord-backfill-cli`:
   ```bash
   bun run /Users/admin/Code/github.com/MEYD-605/discord-backfill-cli/bin/discord-backfill.ts list channels --guild="Wormhole Server"
   ```

2. **Full Guild / Channel Backfill (Snowflake Cursor & Watermark)**:
   When running backfill across an entire Discord server, use `discord-backfill-cli` with `DISCORD_BOT_TOKEN` configured from `.env` (`.claude/channels/discord-*/.env`):
   ```bash
   bun run /Users/admin/Code/github.com/MEYD-605/discord-backfill-cli/bin/discord-backfill.ts guild --guild="<guild-name>" --all
   ```
   Outputs JSON per channel to `~/.discord/backfill/<guild>/<channel>.json` and tracks state in `~/.discord/backfill-state/<channelId>.json`.

3. **Dev-Tier Bun Fallback**:
   If running `maw atlas <cmd>` outputs:
   `plugin atlas exited 0 with no output — maw executes the entry file...`
   Use the standalone `discord-backfill-cli` tool or execute the plugin directly using Bun:
   ```bash
   bun /tmp/maw-atlas/index.ts ls
   bun /tmp/maw-atlas/index.ts read <channel-id> --all
   ```

## Pitfalls & Best Practices
- **Dev-tier TS entry point**: Dev-mode TS plugins without `import.meta.main` need direct `bun index.ts <cmd>` invocation or `discord-backfill-cli`.
- **Token resolution**: Check `.claude/channels/discord-*/.env` for active bot tokens (e.g. Gm grok token in `discord-gmgrok/.env`). Ensure token passes `whoami` check before backfilling.
- **Watermark Persistence**: `discord-backfill-cli` saves `live_newest_id` and `backfill_oldest_id` in `~/.discord/backfill-state/<channelId>.json` for resumable, deduplicated backfill.
