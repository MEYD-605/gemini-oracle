# Hermes no5 — models & credentials (maclab)

**Profile:** `export HERMES_HOME=~/.hermes-no5`

## Prove (no secret values in chat)

```bash
export HERMES_HOME=~/.hermes-no5
hermes auth list
hermes auth status zai
hermes config show 2>&1 | rg -i 'Model:|zai|xAI|OpenRouter'
hermes doctor 2>&1 | rg -i 'OpenRouter|xAI|zai'
```

## Providers on No.5 DM

| Lane | Provider | Typical model |
|------|----------|----------------|
| xAI | **xai-oauth** | `grok-composer-2.5-fast` |
| **GLM 5 Turbo (Z.AI)** | **`zai`** | **`glm-5-turbo`** |
| GLM via OpenRouter | **openrouter** | `z-ai/glm-5-turbo` (optional) |

Aliases: `zhipu`, `z-ai`, `glm` → **`zai`**. Env: `GLM_API_KEY`, `ZAI_API_KEY`, `Z_AI_API_KEY`.

## Context budget check (Copilot / Codex lane)

Do not guess context from the model name. For this profile, the local cache has been verified with:

```bash
export HERMES_HOME=~/.hermes-no5
cat "$HERMES_HOME/context_length_cache.yaml"
```

Current verified entry used in the conversation:

- `gpt-5.4-mini` → **272,000 tokens**

Re-check the cache after provider/model refresh; this is a cached value, not a guarantee of future vendor limits.

## Switch to GLM 5 Turbo (Z.AI)

Bo **「ทำเลย」** / Z.AI key → configure; one line rotate if key was in Discord.

```bash
export HERMES_HOME=~/.hermes-no5
hermes auth add zai --type api-key --label bo-glm
hermes config set model.default glm-5-turbo
hermes config set model.provider zai
cp "$HOME/.hermes-no5/config.yaml" "$HOME/.hermes-no5-tui/config.yaml" 2>/dev/null || true
launchctl kickstart -k "user/$(id -u)/ai.hermes.gateway"   # outside DM only
```

## OpenRouter (optional)

```bash
hermes auth add openrouter --type api-key
hermes model   # z-ai/glm-5-turbo
```

DM session until **`/new`**; model after gateway restart.
