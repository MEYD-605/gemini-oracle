# Bridging a non-Discord-native CLI agent tool onto Discord

Use when the user wants a CLI/agent tool that has **no native Discord
integration** (e.g. thClaws, or any future fleet tool) to run as a Discord
bot persona. Verified working end-to-end 2026-08-12: thClaws headless mode
bridged onto Discord ("Thep No.777") on VPS natz-ai-03, backed by 9router
over Tailscale.

## Architecture: direct Gateway WebSocket, not a hosted relay

Prefer connecting straight to `wss://gateway.discord.gg` from the bridge
process itself — no relay server needed. This mirrors how CLI tools handle
their OWN direct-connectable platforms (e.g. thClaws' own Telegram adapter:
"no relay... getUpdates long-polling works behind NAT, so a desktop client
connects directly"). Only reach for a relay architecture when the platform
is webhook-only (LINE, Messenger) — Discord isn't.

`~/maw-workspace/tools/discord-reply-rust/src/relay.rs` is the fleet's
existing proof this works (production WS relay for the agent fleet's own
bots) — reuse its connect/heartbeat/identify pattern as a reference even
when writing a new bridge in a different language.

## Build steps

1. **Verify the bot token's identity FIRST**, before wiring anything else:
   `GET /users/@me` with `Authorization: Bot <token>`. A handed-off token's
   assumed identity can be wrong — this fleet has direct prior-incident
   history of assigning roles to the wrong bot because nobody checked
   `/users/@me` before trusting which bot a token belonged to.
2. Confirm the target CLI tool has a non-interactive/headless invocation
   mode (e.g. `thclaws -p "<prompt>" --resume <session_id>`) — the bridge
   shells out to this per inbound message.
3. If the tool needs an LLM backend and has no paid key of its own, route
   it through 9router via the generic OpenAI-compatible provider slot — see
   `model-provider-triage` skill's "Generic OpenAI-compatible CLI tools via
   9router" section. Works across the fleet over the existing Tailscale
   mesh (`100.83.0.1:20128`), not just localhost — check `tailscale status`
   on the target box for a `maclab` peer before assuming you need a new key.
4. **Session continuity**: capture the tool's own session-id from its
   stdout/stderr (e.g. regex a `[session] saved sess-...`-style line) and
   persist a `{channel_id: session_id}` map on disk so `--resume` keeps
   per-Discord-channel conversation continuity across messages.
5. **UX parity checklist** — a bare Gateway WS bridge silently misses
   standard chat-bot affordances a user expects, and WILL notice missing:
   - Typing indicator: `POST /channels/{id}/typing`, fired every ~8s while
     the subprocess is still running. Discord auto-expires the indicator
     after ~10s, so a single one-shot call before the reply is not enough
     for anything but instant responses.
   - 2000-char message chunking on send (Discord's hard cap).
   - DM vs guild-channel policy: respond unconditionally in DMs, require an
     `@mention` in guild channels (mirrors default Hermes gateway policy).
6. **Deploy as a systemd service** (`Restart=always`, `enabled`) — not a
   foreground/nohup process — so it survives crashes and VPS reboots
   without a manual restart. `journalctl`/a plain log file under `/var/log`
   is enough; no need for anything fancier for a single-bot bridge.
7. **Check upstream's own issue tracker before building** — a closed
   `not_planned` issue on the tool's repo can save you from duplicating a
   decision the maintainers already made, and the closing comment usually
   explains their reasoning (e.g. thClaws declined a native Discord adapter
   in favor of a hosted-tunnel model) — useful context even when you decide
   to build it yourself anyway for reasons upstream doesn't share (e.g. this
   fleet already operates entirely on Discord bot personas).

## Pitfalls

- **"[tool] repo" can mean "bot persona," not a literal git repository.**
  This fleet uses "repo" colloquially for an agent instance sometimes. When
  handed what looks like a raw Discord bot token alongside a repo-sounding
  name, check BOTH a GitHub repo search AND the token's live identity via
  `/users/@me` before concluding either way — don't assume "no GitHub repo
  found" means the thing doesn't exist.
- **Pre-approving a Discord DM pairing without waiting for a code.** If
  `hermes pairing list` shows nothing pending because the target user's
  messages are being silently dropped by the pairing gate (see
  `discord-dm-pairing-silent-block.md`), you can approve them directly
  without waiting for them to trigger the code flow:
  1. Find their user ID via `GET /guilds/{guild_id}/members/search?query=<name>`.
  2. Write `{user_id: {"user_name": ..., "approved_at": <epoch>}}` into
     `~/.hermes-<seat>/platforms/pairing/discord-approved.json`.
  3. Verify with `hermes pairing list`.
  Takes effect immediately — `PairingStore` re-reads the file on every
  check, no gateway restart needed.
