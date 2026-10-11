# Model / context budget notes (maclab No.5)

Session learnings for quick verification when Bo asks about model choice, context size, or “which GPT/Codex model is actually enough”.

## Verify current Hermes model

```bash
export HERMES_HOME=~/.hermes-no5
hermes config show 2>&1 | grep -Ei 'Model:|provider|default|copilot|openai-codex'
hermes auth list 2>&1 | grep -Ei 'openai|codex|oauth|device'
```

## Inspect model context cache

Hermes caches model context lengths locally. Useful files:

- `~/.hermes-no5/context_length_cache.yaml`
- `~/.hermes-no5/provider_models_cache.json`
- `~/.hermes-no5/models_dev_cache.json`

### Session observation

- `gpt-5.4-mini@https://chatgpt.com/backend-api/codex` was cached at **272000** tokens in this session.
- Therefore it is **not** a 500k-context model.

## Practical rule

When Bo asks for “cheap but still good” and needs very large context:

1. Check the cache first.
2. Prefer the cheapest model that still clears the requested token budget.
3. If the chosen model is below the needed ceiling, say so plainly and offer the next tier up.

## Copilot model list observed

`provider_models_cache.json` showed these Copilot choices in this session:

- `gpt-5.4`
- `gpt-5.4-mini`
- `gpt-5-mini`
- `gpt-5.3-codex`
- `gpt-5.2-codex`
- `gpt-4.1`
- `gpt-4o`
- `gpt-4o-mini`
- `claude-sonnet-4.6`
- `claude-sonnet-4`
- `claude-sonnet-4.5`
- `claude-haiku-4.5`
- `gemini-3.1-pro-preview`
- `gemini-3-pro-preview`
- `gemini-3-flash-preview`
- `gemini-2.5-pro`

## Note

Context sizes and model availability can change, so treat this file as a verified snapshot plus workflow guidance, not a permanent truth source.