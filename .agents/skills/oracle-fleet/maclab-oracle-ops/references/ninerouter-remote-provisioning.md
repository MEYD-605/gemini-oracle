# Remote 9router Provisioning & Troubleshooting Recipe

## Overview
When converting or migrating agents on remote Linux machines (e.g. `black.alchemycat.org`) to use 9router, follow this deterministic setup and verification process.

## Step-by-Step Provisioning

### 1. Node.js Environment Setup (fnm)
On systems with managed system Python/Node or unprivileged users (`meyd`):
```bash
# Install fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir /home/meyd/.fnm

# Load fnm & install Node 20
eval "$(/home/meyd/.fnm/fnm env --shell bash)"
fnm install 20
fnm default 20
```

### 2. Install 9router Package
```bash
eval "$(/home/meyd/.fnm/fnm env --shell bash)"
npm install -g 9router
```

### 3. Sync Database, Tokens & Keys from MacLab
From MacLab (source of truth for 9router auth/models):
```bash
rsync -avz -e "ssh -o 'ProxyCommand=/usr/local/bin/cloudflared access ssh --hostname %h'" \
  ~/.9router/ meyd@black.alchemycat.org:/home/meyd/.9router/
```

### 4. Daemonize 9router Server
On the target machine:
```bash
eval "$(/home/meyd/.fnm/fnm env --shell bash)"
nohup 9router -n -l -p 20128 -H 0.0.0.0 --skip-update > /home/meyd/.9router/logs/9router.log 2>&1 &
```

### 5. Verification
```bash
curl -s http://127.0.0.1:20128/v1/models | grep -i gemini-3.6-flash-high
```

## Agent Configuration (config.yaml)
In the target agent's `HERMES_HOME/config.yaml`:
```yaml
model:
  default: ag/gemini-3.6-flash-high
  provider: 9router
```

⚠️ **CRITICAL MODEL NAMING RULE:**
Always use exact provider-prefixed model names (e.g. `ag/gemini-3.6-flash-high`, `ag/claude-sonnet-4-6`, `glm/glm-5.2`). Un-prefixed model names (e.g. `gemini-3.6-flash-high`) trigger 404 NOT_FOUND errors in 9router, causing fallback account locks and gateway hanging.

## Discord Channel Configuration (free_response_channels)

To enable free-form responses without requiring `@mention` tags in specific Discord channels, update `HERMES_HOME/config.yaml`:
```yaml
discord:
  require_mention: false
  free_response_channels:
    - '1523647051961860136'
    - '1529487372729716927'
```
Restart the Hermes gateway after editing `config.yaml` to apply channel rules.

## Troubleshooting Pitfalls

1. **APIConnectionError / Connection Refused on Port 20128:**
   - Cause: Agent configured with `provider: 9router` before 9router service was running on port 20128.
   - Fix: Ensure 9router process is running (`ps aux | grep 9router`) and responds on `http://127.0.0.1:20128/v1/models`.

2. **Discord Bot Token Mismatch:**
   - Discord invalidates tokens pasted directly into Discord DMs/channels within seconds.
   - Always copy tokens from raw `.env` files on source hosts (e.g. `/root/.claude/channels/discord-no10/.env`).
   - If gateway fails with `HTTPException: 401 Unauthorized` or `LoginFailure: Improper token has been passed`, update `.env` in `HERMES_HOME` with the clean active token and restart gateway.
