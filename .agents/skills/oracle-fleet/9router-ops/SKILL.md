---
name: 9router-ops
description: "Fix 9Router proxy token and quota issues on port 20128."
---

# 9Router Operations & Token Recovery

## Architecture
- **9Router** runs on `127.0.0.1:20128` as a Next.js app managed by **pm2** (process name: `9router`).
- Provider connections (Antigravity, Codex, GLM, etc.) are stored in `~/.9router/db/data.sqlite`.
- Fleet Hermes instances (no1, no5, gmgrok) all point their `9router` provider at this same endpoint.
- When the primary model fails (429/401/404), Hermes falls back to the next model in its fallback chain — this is often the **symptom**, not the problem.

## Key Tables in data.sqlite
- `providerConnections` — one row per OAuth/API-key account. Column `data` is a JSON blob with `accessToken`, `refreshToken`, `testStatus`, `errorCode`, `backoffLevel`, `modelLock_*` fields.
- `usageDaily`, `requestDetails` — usage tracking.

## Diagnostic Flow
1. **Check what model is actually running**: `hermes config get model` and `hermes fallback list` (use `HERMES_HOME=~/.hermes-noX` for other profiles).
2. **Test the primary model directly**:
   ```bash
   curl -s -X POST http://127.0.0.1:20128/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{"model":"cc/claude-sonnet-5","stream":false,"messages":[{"role":"user","content":"test"}]}'
   ```
   *Note: Pass `"stream":false` or test via raw curl when inspecting 9Router responses. Note that 9Router appends `data: [DONE]` to the end of non-stream JSON responses, causing standard JSON parsers (`json.load`, `jq`) to fail with `Extra data`. Strip trailing `data: [DONE]` before parsing JSON.*
3. **Check 9Router logs**: `pm2 logs 9router --lines 20 --nostream`
4. **Inspect the connection in DB**: `sqlite3 ~/.9router/db/data.sqlite "SELECT id, provider, authType, name, email, isActive FROM providerConnections;"`
5. **Deep-dive connection data**: Extract the JSON from the `data` column to see `lastError`, `errorCode`, `backoffLevel`, `modelLock_*`.

## Token Recovery: Antigravity (Google OAuth)

### Critical Pitfall: OAuth Client Mismatch
Tokens issued by one Google OAuth client **cannot** be refreshed by another. The 9Router Antigravity provider uses a specific client_id embedded in its source:

```
clientId: 1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com
clientSecret: <REDACTED>
```

Tokens from other sources (e.g., `~/.gemini/oauth_creds.json` from the Gemini CLI / nanobanana extension) use a **different** client_id (e.g., `681255809395-...`) and will return `unauthorized_client` when refreshed with 9Router's client.

### Recovery Procedure
1. Extract the **original** refreshToken from the 9Router DB (not from another machine's OAuth file).
2. Manually refresh it using 9Router's embedded client:
   ```bash
   curl -s -X POST https://oauth2.googleapis.com/token \
     -d "client_id=1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com" \
     -d "client_secret=<REDACTED>" \
     -d "refresh_token=<ORIGINAL_REFRESH_TOKEN>" \
     -d "grant_type=refresh_token"
   ```
3. If successful, update the DB with the fresh access token (see `references/token-recovery.py` for a ready-to-run script).
4. Restart 9Router to reload: `pm2 restart 9router && sleep 8`
5. Verify: `curl -s -X POST http://127.0.0.1:20128/v1/chat/completions ...`

### Finding the Right Client ID
If the client_id changes in a future 9Router version, extract it from source:
```bash
grep -roh "[0-9]\{10\}-[a-z0-9]\{20,\}\.apps\.googleusercontent\.com" /usr/local/lib/node_modules/9router/ | sort -u
```
And the client secret:
```bash
grep -roh "GOCSPX-[a-zA-Z0-9_-]*" /usr/local/lib/node_modules/9router/ | sort -u
```
Or read the Antigravity provider config directly from the `9660.js` chunk.

## Error Code Interpretation
| Code | Meaning | Fix |
|------|---------|-----|
| **401** | Access token expired or refresh failed | Refresh token via OAuth endpoint, update DB, restart 9router |
| **404** | Model not found on backend (NOT a token issue) | Model removed/unavailable on Antigravity side; try a different model |
| **429** | Rate limit / quota exhausted | Wait for reset, or switch to a different provider/account |
| **`modelLock_*`** not null | 9Router has temporarily locked this model for this account | Clear the lock in DB + restart |

## Fleet SSH Access
- **pimpims-imac**: `sshpass -p "123121" ssh -o StrictHostKeyChecking=no pimpim@100.70.182.22`
- **uses-imac**: `100.83.15.49` (SSH key issues; use pimpims-imac first)
- Use `tailscale status` to find all fleet machines and their IPs.

## Provider & Model Quirks
- **GLM 5.3 (`glm/glm-5.3`)**:
  - Always includes thinking tokens; attempting to disable thinking via request params throws error `1210`.
  - When testing `glm/glm-5.3` via curl/completion requests, ensure `max_tokens` is at least 256+. If `max_tokens` is too low (e.g. 50), thinking tokens will consume the entire limit, resulting in empty output (`content: ""`).
  - **Provider Prefix Requirement**: Model names passed to 9Router must include provider namespace prefixes (e.g. `glm/glm-5.3`, `ag/gemini-3.7-flash-high`). Passing a bare model name like `glm-5.3` without prefix causes 9Router to route the call to the default `openai` provider, failing with `No active credentials for provider: openai`.
  - **9Router JSON Parsing Quirk**: 9Router appends `data: [DONE]` to non-stream JSON completion payloads. Strip trailing `data: [DONE]` before parsing JSON with standard tools (`json.loads`, `jq`) to avoid `Extra data` errors.
  - **Hermes Profile Context & Gateway Bounce Alignment**: When updating models (e.g. to `glm/glm-5.3` and 1M context) on a Hermes seat (`HERMES_HOME=~/.hermes-noX`), run `export HERMES_HOME=~/.hermes-noX && hermes config set model.default glm/glm-5.3 && hermes config set model.context_length 1000000`. If the seat runs as a launchd gateway daemon (`ai.hermes.gateway-noX.plist`), kill the running gateway PID; launchd will automatically respawn the gateway process loading the updated `config.yaml`. Verify response with a max_tokens >= 300 probe via 9Router.

## Pricing & Cost Calibration (List Price vs Subscription)
- **Default Behavior**: 9Router tracks cost (`usageDaily`, `usageHistory`) using built-in token list-price rates. For accounts using flat-rate monthly subscriptions (e.g. Antigravity, Claude, Grok, Gemini CLI), 9Router incorrectly inflates cost with list-price rates ($200+/day fake metrics).
- **Pricing Tables Location**: Pricing rules reside in Next.js server chunks, e.g. `/usr/local/lib/node_modules/9router/app/.next-cli-build/server/chunks/6763.js`.
- **Zeroing Subscription Provider Costs**:
  1. Run `python3 scripts/zero_subscription_costs.py` (or patch `6763.js` using Python regex) to set `input:0,output:0,cached:0,reasoning:0,cache_creation:0` for flat-rate subscription models (`claude-*`, `gemini-*`, `gpt-*`, `ag-*`, `gcli-*`).
  2. Keep actual token pricing for pay-as-you-go providers (`glm/*`, `openrouter/*`).
  3. Restart 9Router daemon (`kill -TERM <pid>` for `ai.hermes.9router` launchd auto-respawn, or `pm2 restart 9router`).
  4. Verify with test completion requests: `ag/` requests should yield $0 cost delta in `usageDaily`, while `glm/` requests calculate true token costs.
- **Auto-Discovery (v0.5.50+)**:
  - 9Router v0.5.50+ automatically discovers models per provider (73+ models via `/v1/models`). Manual model list additions are no longer required when upstream providers introduce new models.

## Pitfalls
- **Session Sticky Model vs Global Config**: Hermes Discord Gateway binds the model at conversation creation in `state.db` (`sessions.model`). Modifying `config.yaml` to a new default model (such as `cc/claude-fable-5`) affects *new* sessions; ongoing DM sessions continue on their initial model until explicitly reset via `/reset` or `/new`.
- **9Router Local API Key Validation**: The key in `providers.9router.api_key` must match an active key in `~/.9router/db/data.sqlite` (`apiKeys` table). If 9Router returns `invalid_api_key`, query active keys from SQLite and test via curl before updating `config.yaml`. See `references/9router-client-key-and-sticky-session.md`.
- **NEVER copy refresh tokens from another machine's `~/.gemini/oauth_creds.json` into 9Router** — they were issued by a different OAuth client and will cause persistent 401s. Always use the token already in 9Router's DB, or do a fresh OAuth login through 9Router's dashboard.- **Always backup the original refreshToken** before modifying the DB. `data.sqlite.bak-*` files exist but may be stale.
- **pm2 restart takes 5-8 seconds** before the port is listening again. Don't test immediately.
- **Better-sqlite3 native binding** is broken on this MacLab (`EACCES` / binding not found). 9Router falls back to `node:sqlite` or `sql.js` — this is non-fatal, ignore the error logs.
