# gmaicore remote GLM-5.2 migration (ai-core, 2026-07-16)

gmaicore lives on **ai-core** (100.81.0.110), NOT maclab. All config edits must be done via SSH.

## Pre-fix state

- Gateway **stopped** since 2026-07-10 by gmlab ("stopped by gmlab on Bo order")
- All systemd services renamed `.stopped-by-gmlab-20260710`
- `DISCORD_BOT_TOKEN` commented out as `#STOPPED_DISCORD_BOT_TOKEN=`
- Model was `cx/gpt-5.4` via `9router` (localhost:20128 — likely dead)
- ZAI_API_KEY was old key (`ccce8b0b...`)

## SSH access

```bash
ssh root@100.81.0.110 'hostname'   # → ai-core
```

Tailscale IP: 100.81.0.110 · Works directly, no special config needed.

## Fix procedure (executed 2026-07-16)

### 1. Backup

```bash
ssh root@100.81.0.110 'cp /root/.hermes-gmaicore/config.yaml /root/.hermes-gmaicore/config.yaml.bak.pre-glm-fix-20260716 && cp /root/.hermes-gmaicore/.env /root/.hermes-gmaicore/.env.bak.pre-glm-fix-20260716'
```

### 2. Model swap via Python script (remote)

Run a Python one-shot over SSH to do all replacements atomically:

```python
# Key replacements in config.yaml:
# - agent.model: cx/gpt-5.4 → glm-5.2
# - agent.provider: 9router → zai
# - model.default: cx/gpt-5.4 → glm-5.2
# - model.provider: 9router → zai
# - model.base_url: → https://api.z.ai/api/coding/paas/v4
# - model.context_length: 500000 (add)
# - fallback_providers: 9router → zai/glm-5.2
# - delegation: cx/gpt-5.4/9router → glm-5.2/zai
# - auxiliary.vision: grok-4.3/xai-oauth → glm-5.2/zai
# - auxiliary.approval: cx/gpt-5.4-mini/9router → glm-5.2/zai
# - image_gen/video_gen: xai → zai
```

**Pitfall:** `sed -i "17s/.../"` needed for `agent.model` line because the Python replace didn't catch the standalone `model:` under `agent:` block (different indentation pattern than `model.default`).

### 3. ZAI_API_KEY update

```bash
ssh root@100.81.0.110 'sed -i "s|ZAI_API_KEY=.*|ZAI_API_KEY=<NEW_KEY>|" /root/.hermes-gmaicore/.env'
```

### 4. Uncomment Discord token

```bash
ssh root@100.81.0.110 'sed -i "s/^#STOPPED_DISCORD_BOT_TOKEN=/DISCORD_BOT_TOKEN=/" /root/.hermes-gmaicore/.env'
```

### 5. Reasoning effort version gotcha

**Hermes v0.18.0 on ai-core does NOT know `reasoning_effort: ultra`.** It warns:
`Unknown reasoning_effort 'ultra', using default (medium)`

Fix: use `high` instead of `ultra` for v0.18.0 nodes. `ultra` requires v0.18.2+.

```bash
ssh root@100.81.0.110 'sed -i "s/reasoning_effort: ultra/reasoning_effort: high/" /root/.hermes-gmaicore/config.yaml'
```

### 6. Start gateway

Cannot use `hermes gateway restart` from inside the gateway. Kill the old PID first, then nohup:

```bash
ssh root@100.81.0.110 'kill -9 <OLD_PID> 2>/dev/null; sleep 2; export HERMES_HOME=/root/.hermes-gmaicore && nohup /root/.hermes-gmaicore/venv/bin/python -m hermes_cli.main gateway run --replace > /tmp/gmaicore-gw.log 2>&1 &'
```

Wait ~10s, then verify:

```bash
ssh root@100.81.0.110 'cat /root/.hermes-gmaicore/gateway_state.json | python3 -m json.tool'
```

Look for: `"gateway_state": "running"` + `"discord": {"state": "connected"}`.

## Post-fix state

- ✅ Gateway running (PID 1783791)
- ✅ Discord connected
- ✅ Model: glm-5.2/zai
- ⚠️ Still Hermes v0.18.0 (1 commit behind v0.18.2) — `uv pip install --upgrade hermes-agent` pending Bo GO
- ⚠️ 9router custom_provider block left in config (harmless, not referenced)
- ⚠️ systemd services still `.stopped-by-gmlab-20260710` — gateway runs via nohup, not systemd

## Fleet model alignment (2026-07-16)

| Agent | Node | Model | Provider | Hermes version |
|-------|------|-------|----------|---------------|
| GmForge (no5) | maclab | glm-5.2 | zai | v0.18.2 |
| gmgrok | maclab | glm-5.2 | zai | v0.18.2 |
| gmaicore | ai-core | glm-5.2 | zai | v0.18.0 |
| no5-tui (cartographer) | maclab | glm-5.2 | zai | v0.18.2 |

All fleet agents now on glm-5.2/zai. xAI/grok-4.5 fully retired from fleet.
