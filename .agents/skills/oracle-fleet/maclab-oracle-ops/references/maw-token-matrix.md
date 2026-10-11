# maw-rs Token Commands vs Authentication Tokens

## 1. `maw token` Subcommands (`maw-rs`)
In `maw-rs`, the `token` verb manages engine authentication tokens for AI providers:

```bash
maw token list       # List available engine auth tokens
maw token use        # Switch active engine auth token
maw token current    # Display currently active token
```

## 2. Token Matrix Summary

| Token Type | File / Location | Purpose |
|------------|-----------------|---------|
| **`maw token`** | `maw-rs` CLI subcommands | Managing & switching AI model engine auth keys |
| **`DISCORD_BOT_TOKEN`** | `.env` (e.g. `agents/no10/.hermes-no10/.env` or `agents/sombo/.claude/channels/discord-sombo/.env`) | Authenticators for Discord Bot / Gateway connection |
| **`federationToken`** | `maw.config.json` | Cross-node peer authentication for MAW federation (`maw hey`) |

## 3. SomBo (`88-sombo`) vs No.10 (`no10-oracle`) Deployment Summary on Black
- **`88-sombo`**: Operates as a **Claude CLI Engine** under `/home/meyd/agents/sombo/`. Uses `.claude/channels/discord-sombo/.env` for `DISCORD_BOT_TOKEN` and `/home/meyd/agents/sombo/.maw/maw.config.json` with `"federationToken": "PLACEHOLDER_FOR_NAT_TO_FILL"`.
- **`no10-oracle`**: Operates as a **Hermes Agent v0.19.0** under `/home/meyd/agents/no10/.hermes-no10/`. Uses `9router` (`ag/gemini-3.6-flash-high`) on port 20128 and Discord Gateway (`.env`).
- **`05-gmforge` (No.5)**: MUST NOT migrate to remote nodes (`black`). Stays on `maclab` as Home Guardian.

