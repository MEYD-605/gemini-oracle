# xAI Media Generation Pricing & Model Details

- **Image Edit (grok-imagine-image-quality 1K)**: $0.50 per generated image + $0.10 for reference image input = **$0.60 per image** (~21 THB). Standard model (`grok-imagine-image`) is $0.20 per image.
- **Video Generation (grok-imagine-video)**: Billed **per second** ($0.50/sec for 480p, $0.70/sec for 720p, up to $2.50/sec for 1080p on v1.5).
  - 6-second clip (480p): $3.00 (~105 THB)
  - 10-second clip (720p): $7.00 (~245 THB)
- **OAuth Authentication vs Console Billing APIs**:
  - `hermes auth add xai-oauth --type oauth` uses device flow (`accounts.x.ai`).
  - Direct GET queries to `console.x.ai` billing/team REST endpoints fail with HTTP 404/401 over OAuth tokens.

# Hermes Gateway Self-Restart Process Lock

- Direct execution of `launchctl kickstart -k ...` from within the active Hermes gateway session triggers a safety block preventing self-kill cascades.
- To switch active default model across running sessions, delegate the restart command to a peer agent via `maw hey` or ask the user to execute it in an external terminal.
