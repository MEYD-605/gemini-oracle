# 9Router Configuration & Troubleshooting Reference

## Remote 9Router Auth (HTTP 401: API key required)
When connecting to a 9Router instance over Tailscale/LAN (e.g., Note20 or MacLab -> `http://100.81.0.110:20128`), remote requests require `api_key` authentication.

### Correct `config.yaml` Setup for Hermes Agent:
```yaml
model:
  provider: 9router
  default: ag/gemini-3.6-flash-high
  base_url: http://100.81.0.110:20128/v1
  api_key: "<REDACTED>"

providers:
  9router:
    name: 9router
    base_url: http://100.81.0.110:20128/v1
    api_key: "<REDACTED>"

custom_providers:
  - name: 9router
    base_url: http://100.81.0.110:20128/v1
    api_key: "<REDACTED>"
    api_mode: openai
    default_model: ag/gemini-3.6-flash-high

fallback_providers:
  - provider: 9router
    model: ag/gemini-3.6-flash-high
    api_key: "<REDACTED>"
```

## Hermes `custom_providers` YAML Syntax Standard
- **List Spec Requirement**: `custom_providers` in `config.yaml` MUST be a YAML list (items prefixed with `- name: <provider>`).
- If formatted as a key-value dictionary, `hermes doctor` will fail with:
  `[ERROR] custom_providers is a dict — it must be a YAML list (items prefixed with '-')`

## Model Routing & Quotas
- **Gemini 3.1 Pro via 9Router**: Call via `ag/gemini-3.1-pro-preview` (Antigravity route). Standard Google API keys return 404 for Gemini 3.x if on Code Assist standard-tier.
- **Claude Sonnet 5**: Call via `cc/claude-sonnet-5` on `ai-core` 9Router gateway.
