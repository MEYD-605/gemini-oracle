# OpenRouter Tencent HY3 Model Routing in 9router & Hermes & Claude CLI

## Overview
Tencent HunYuan 3 (HY3) models (`tencent/hy3`, `tencent/hy3-preview`, `tencent/hunyuan-a13b-instruct`) are available via OpenRouter API.

## Model Specs & Pricing
- **`tencent/hy3-preview`**: ~$0.063 / 1M prompt tokens, ~$0.21 / 1M completion tokens.
- **`tencent/hy3`**: ~$0.132 / 1M prompt tokens, ~$0.528 / 1M completion tokens.
- **Strengths**: Chinese/Asian context, MoE architecture (295B MoE / 21B Active), Function calling/tool use, Multimodal (Text, Image, Video, 3D).

## Wiring into 9router (`~/.9router/db/data.sqlite`)
When adding an OpenRouter API key to 9router on host (`black` or `maclab`):

1. **Insert providerConnection into SQLite DB**:
   ```python
   import sqlite3, uuid, json
   conn = sqlite3.connect('/home/meyd/.9router/db/data.sqlite')
   cursor = conn.cursor()
   conn_id = str(uuid.uuid4())
   data = json.dumps({'apiKey': 'sk-or-v1-...'})
   now = '2026-08-06T16:00:00.000Z'
   cursor.execute(
       "INSERT INTO providerConnections (id, provider, authType, name, priority, isActive, data, createdAt, updatedAt) "
       "VALUES (?, 'openrouter', 'api_key', 'openrouter-hy3', 1, 1, ?, ?, ?)",
       (conn_id, data, now, now)
   )
   conn.commit()
   ```

2. **Restart 9router**:
   ```bash
   pkill -u meyd -f '9router'
   nohup 9router --tray > ~/.9router/logs/service.log 2>&1 &
   ```

3. **Call model via 9router**:
   - Model ID: `openrouter/tencent/hy3` or `openrouter/tencent/hy3-preview`
   - Endpoint: `http://127.0.0.1:20128/v1/chat/completions`

## Connecting Claude Code CLI to 9router (`ANTHROPIC_BASE_URL`)
Claude Code CLI can use 9router by redirecting Anthropic API calls:
```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:20128/v1"
export ANTHROPIC_API_KEY="sk-dummy"
export ANTHROPIC_MODEL="openrouter/tencent/hy3"
```
Or via `settings.json` in `CLAUDE_CONFIG_DIR`:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:20128/v1",
    "ANTHROPIC_API_KEY": "sk-dummy",
    "ANTHROPIC_MODEL": "openrouter/tencent/hy3"
  }
}
```

## SomBo Discord Architecture (Claude CLI Native)
SomBo (`88-sombo`) runs on Claude Code CLI with native Discord channel plugin (`--channels plugin:discord@claude-plugins-official`).
- State dir: `/home/meyd/agents/sombo/.claude/channels/discord-sombo/`
- Permission map: `access.json`
- **Correction / Pitfall:** Do NOT convert SomBo to a Hermes Agent profile when asked to configure Claude CLI. Respect the agent's engine architecture.

## ARRA Oracle Document Count vs Cloudflare Vectorize Lock (CF Lock)
- **Master DB (`oracle-master.db`)**: Holds ~24,355+ documents (`learning`, `principle`, `retro`) with active local SQLite FTS5 indexing and continuous document additions.
- **Cloudflare Vectorize Count (0 / Locked)**: `cf-bulk.lock.json` is set to `locked: true` per standing order to prevent over-quota billing spikes ($70/month overage from bulk re-embedding 1024-dim vectors). Vector reads/writes remain disabled on Cloudflare while local master DB and FTS5 continue operating normally.
