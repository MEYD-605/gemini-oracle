# gmlab smooth-fix — 2026-07-26

## What Changed
- **Primary model**: `ag/gemini-3.6-flash-high` → `ag/claude-sonnet-4-6` via 9router Ultra
- **Vision model**: xai-oauth (was broken) → `gemini/gemini-3.1-pro-preview` via 9router
- **retries**: raised to 5
- **Memory limits**: raised
- **Config backup**: `~/.hermes-gmgrok/config.yaml.bak.gmlab-smooth-20260726092626`

## Confirmed Model Line (config.yaml excerpt)
```yaml
model:
  model: ag/claude-sonnet-4-6
  provider: 9router
vision:
  model: gemini/gemini-3.1-pro-preview
  provider: 9router
fallback_model:
  model: glm-5.2
  provider: zai
fallback_providers:
  - model: ag/gemini-3-flash-agent
    provider: 9router
  - model: gemini/gemini-3.1-pro-preview
    provider: 9router
  - model: glm-5.2
    provider: zai
```

## Discord DM Send Failure Ladder (CLI session)
Tried in order, all failed before hermes send:
1. `mcp__discord_reply__reply` → 403 Missing Access (code 50001) — bot lacks DM permission
2. `maw send borde9902 "..."` → exit 2, empty output
3. `maw dm <channel_id>` → no such subcommand
4. `curl http://127.0.0.1:3456/api/send` → `{"error":"empty-target","ok":false}`
5. `curl http://127.0.0.1:3456/api/gateway/send` → 404
6. `HERMES_HOME=~/.hermes-gmgrok hermes send --to discord:1518456063224189090 "..."` → **`sent` (exit 0)** ✓

## Key Channel IDs
| Name | ID |
|------|----|
| Bo DM | 1518456063224189090 |
| #oracle-meeting | 1492084191175774209 |
| #maclab-home | 1522120054643232849 |
| #hermes-master | 1529487372729716927 |
| #maclab-health | 1522120059647037600 |

## System State at ACK
- uptime: 10h56 · load: 4.90 · disk: 498GB free (3% used of 932GB)
- maw inbox #1: No.1 dual-deny on local delivery 100% claim (read + noted, no re-claim)
