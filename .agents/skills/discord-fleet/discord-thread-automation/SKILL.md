---
name: discord-thread-automation
description: Create Discord threads via REST API when requested by user.
category: discord-fleet
tags: [discord, thread, rest-api, curl]
---

# Discord Thread Automation

Use this skill when the user asks to create a thread or talk in a thread ("คุยแบบ thread", "ทำ thread หน่อย", "create thread") in Discord and no high-level thread management tool is loaded.

## Workflow

1. **Extract Channel ID**:
   - Inspect environment variable `HERMES_SESSION_KEY` (e.g. `agent:main:discord:group:1534857216727842858:691531480689541170`).
   - The first numeric ID after `group:` is the parent channel ID (`1534857216727842858`).

2. **Create Public Thread via REST API**:
   ```bash
   curl -s -X POST \
     -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "คุยกับสมโบ", "auto_archive_duration": 1440, "type": 11}' \
     "https://discord.com/api/v10/channels/<channel_id>/threads"
   ```
   *Note: `type: 11` is GUILD_PUBLIC_THREAD (`auto_archive_duration`: 60, 1440, 4320, or 10080).*

3. **Send Initial Message into Thread**:
   - Parse `id` from the creation JSON response (this is the `<thread_id>`).
   - Send welcome/ack message directly into the thread:
   ```bash
   curl -s -X POST \
     -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"content": "รับทราบครับ! สร้าง Thread เรียบร้อยแล้วครับ มาคุยต่อใน Thread นี้ได้เลย 🚀"}' \
     "https://discord.com/api/v10/channels/<thread_id>/messages"
   ```

## Pitfalls & Lessons
- `mcp_discord_reply_reply` or direct gateway outputs post to the parent channel unless explicit REST API call targets the `<thread_id>`.
- Always verify `$DISCORD_BOT_TOKEN` is present in the shell environment.

## Auto-Thread Configuration (Hermes Gateway)
Hermes can automatically create threads on `@mention` across Discord channels via `config.yaml`:
```yaml
discord:
  auto_thread: true               # Auto-create thread on @mention to reduce global notification noise
  free_response_channels:          # Channel IDs where bot responds inline in channel without creating a thread
  - '1523647051961860136'
  - '1529487372729716927'
```
- **Rationale**: Auto-threading on tag keeps main channels quiet (avoids notifying all channel members per reply).
- **Free Response Channels**: Use `free_response_channels` for specific channels dedicated to general public/open responses.
