# No.5 canonical identity + Grok repair notes

## Canonical No.5 identity
- **No.5** is the agent name in this lane.
- Canonical repo root: `/Users/admin/Code/github.com/MEYD-605/cartographer-oracle`
- If duplicate clones exist elsewhere (for example under `maw-workspace/`), treat them as mirrors/copies unless the current workdir explicitly points there.
- When the user corrects naming, use the exact canonical form immediately; do not hedge with alternate labels.

## Hermes Grok 4.3 repair pattern
When the user wants “Hermes login grok model grok4.3”:
1. Check live state first: `hermes status --all`
2. Check auth state: `hermes auth list`
3. Verify health: `hermes doctor`
4. Set the active provider to **xAI Grok OAuth** and model to **`grok-4.3`**.
5. Confirm the config uses `base_url: https://api.x.ai/v1`.
6. Re-check status and doctor after the change.

## Important distinction
- `xai-oauth` auth being present does **not** mean the active model/provider is already routed to Grok.
- Trust the live `hermes status --all` provider/model fields over stale assumptions.
- Use the OAuth lane when the target is Grok 4.3; do not treat this as a generic API-key task unless the user explicitly asks for the API-key path.
