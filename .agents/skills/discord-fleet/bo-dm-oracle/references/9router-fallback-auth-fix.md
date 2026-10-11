# 9Router Token Sync & Peer Fallback Troubleshooting (2026-07-28)

## Context & Learning
When Bo ordered a fleet-wide switch to `cc/claude-sonnet-5` via 9Router:
1. Local model configuration on maclab was updated using `hermes config set model_catalog.default.model cc/claude-sonnet-5`.
2. Peer node `note20` (GmGrub) experienced a fallback authentication failure when Bo tested in Discord DM.

## Error Symptoms & Analysis (from Discord screenshot)
- Primary model (zai / xai) failed with 401 Unauthorized.
- Hermes Gateway attempted fallback to 9Router (`cc/claude-sonnet-5`).
- Fallback output: `⚠️ Provider authentication failed. Check the configured credentials; raw provider details are in the gateway logs.`

## Root Cause
`providers.9router.api_key` on the peer (`note20`) was missing, defaulted, or unauthenticated for remote API access, causing the fallback to fail when attempting to authenticate with 9Router.

## Remediation Protocol via Maw Federation
Send direct commands via `maw hey` to the target peer node:
1. `hermes config set providers.9router.api_key 123456`
2. `hermes config set provider 9router`
3. `hermes config set model_catalog.default.model cc/claude-sonnet-5`
4. Instruct gateway restart (`/restart` in Discord or process restart).
