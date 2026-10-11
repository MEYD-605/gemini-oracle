# Sending Bo a Discord DM from a CLI/tmux session (no gateway turn)

Verified 2026-08-18 (No.5 CLI session in the 05-gmforge pane; message id
1538964817325457462 delivered to Bo's DM, no error).

Situation: a pane/maw instruction says "รายงานโบทาง Discord DM" but this is a
CLI session with no messaging tool. The no5 gateway bot can still deliver:
Bo's DM channel with the bot already exists, and the bot token lives in
`~/.hermes-no5/.env`.

## Recipe

1. Find Bo's DM channel id — two independent sources, cross-check:
   - Inbound history: `grep "inbound message" ~/.hermes-no5/logs/gateway.log | tail`
     → `platform=discord user=Meyd-605 chat=<channel_id>`
   - Canonical routing map: `~/.hermes-no5/state.db`, table `gateway_routing`
     (session_key `agent:main:discord:dm:<chat_id>`; the `origin` JSON carries
     user_id/user_name). This table is the authoritative chat_id ↔ session map
     for every platform chat — useful far beyond DMs.
2. Send (token stays in a shell var, never printed to output):
   ```bash
   TOKEN=$(grep '^DISCORD_BOT_TOKEN=' ~/.hermes-no5/.env | cut -d= -f2- | tr -d '\r"')
   curl -sS -X POST "https://discord.com/api/v10/channels/<chat_id>/messages" \
     -H "Authorization: Bot $TOKEN" -H "Content-Type: application/json" \
     -d '{"content":"..."}'
   ```
3. Verify from the JSON response: `"id": "<message_id>"` present and no
   `"message"` (error) field = actually delivered. Parse with python json —
   don't eyeball raw HTTP.

## Notes
- Works for an EXISTING DM channel only (Bo has DMed the bot before). Do not
  confuse with `GET /users/@me/channels`, which never lists bot DM channels —
  see `discord-dm-pairing-silent-block.md`.
- Keep it 1–3 Thai sentences (Bo's DM style), sign `[maclab:05-gmforge]`,
  respect the 2000-char message cap.
- No gateway restart needed — the REST post is independent of the running
  gateway; the message simply appears in the same DM thread Bo reads.
