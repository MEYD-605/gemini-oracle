# Discord DM "not answering" — check the pairing gate before anything else (2026-08-12)

Symptom: Bo says "[agent] ตั้งให้ตอบ DM [person] แล้วแต่มันไม่ยอมตอบ" — the
target user DMs a fleet Discord bot directly and gets silence. Gateway is up,
token is valid, bot shows `Connected as <Name>#<disc>` in logs — but there is
**zero `inbound message` log line for that user, ever**, across the whole
`gateway.log`.

## Root cause

Hermes gateways gate unauthorized DMs through a pairing system
(`gateway/pairing.py`, default `unauthorized_dm_behavior: pair`). An unpaired
user's first DM should trigger the bot to auto-reply with a one-time pairing
code, which the operator then approves via `hermes pairing approve <platform>
<code>`. If that round-trip never happens (person doesn't relay the code, or
the DM reply itself gets swallowed), the user's messages are silently dropped
— they never reach `_handle_message`'s logged inbound path, so grepping the
log for their name/text finds nothing. This looks exactly like "the bot is
ignoring me" from the outside.

**Do not confuse this with actually-broken infra.** In the session that
produced this note, multiple false leads were chased first (stale relay
tokens from an unrelated legacy CLI system, a `mimo-talkback` webhook that
turned out to be outbound-only, credential/config checks) before the pairing
gate was identified as the real blocker. The fast diagnostic is:

```bash
grep "inbound message" ~/.hermes-<profile>/logs/gateway.log | \
  sed -n 's/.*user=\([^ ]*\).*/\1/p' | sort -u
```

If the target person's username never appears in that unique list despite
them saying they DMed the bot, suspect the pairing gate immediately — don't
spend time on token/webhook/config theories first.

## Fix: approve without waiting for the code round-trip

`hermes pairing list` only shows PENDING requests that already generated a
code. If the person's messages were dropped before/without a code ever being
issued (or the code expired — TTL is 3600s / 1 hour), there is nothing to
`approve` via the normal CLI path. Two options:

1. **Best**: ask the person to DM again, wait for the bot's auto pairing-code
   reply, then `hermes pairing approve discord <code>` (or `<request-id>` from
   `hermes pairing list`).
2. **Faster, if you already know their Discord user ID**: write directly into
   the approved-list JSON — this takes effect immediately (no gateway
   restart; the store re-reads the file on every check):
   ```bash
   python3 -c "
   import json, time, os
   path = '/Users/admin/.hermes-<profile>/platforms/pairing/discord-approved.json'
   data = {}
   if os.path.exists(path):
       with open(path) as f: data = json.load(f)
   data['<discord_user_id>'] = {'user_name': '<label>', 'approved_at': time.time()}
   with open(path, 'w') as f: json.dump(data, f, indent=2, ensure_ascii=False)
   os.chmod(path, 0o600)
   "
   ```
   Verify with `hermes pairing list` (shows under "Approved Users").

## Finding a Discord user ID when you only have a username

If the person shares a guild with the bot, use the bot's own token against
the Discord API — no manual lookup needed:
```bash
TOKEN=$(grep '^DISCORD_BOT_TOKEN=' ~/.hermes-<profile>/.env | cut -d= -f2- | tr -d '\r"')
curl -sS -H "Authorization: Bot $TOKEN" \
  "https://discord.com/api/v10/guilds/<guild_id>/members/search?query=<username>&limit=25"
```
Returns the member object including `user.id`. `/users/@me/channels` does
**not** list open DM channels for a bot — don't waste time on that endpoint.

## Confirmed end-to-end a second time (2026-08-12, No.4/mimo ↔ พี่โม)

Full recipe validated again on a live case: person had DMed the bot with zero
pairing-code round-trip ever completing (no code, no pending entry — `hermes
pairing list` showed "No pairing data found"). Used Option 2 directly:

1. Found the guild(s) the bot shares via `GET /users/@me/guilds` (bot token).
2. `GET /guilds/<id>/members/search?query=<username>&limit=25` returned the
   member object with `user.id` on the **first try** — confirms the bot's
   `GUILD_MEMBERS` privileged intent is enabled fleet-wide, so this lookup
   path is reliable, not a maybe. (`/users/@me/channels` was tried first and
   correctly returned `[]` — that endpoint genuinely never lists bot DM
   channels, don't waste a call on it.)
3. Wrote the approved-list JSON directly (Option 2 snippet above) — took
   effect immediately, confirmed via `hermes pairing list` showing the user
   under "Approved Users" with no gateway restart needed.

Also re-confirmed the **false-lead pattern** from the first incident: before
finding the real cause, a `deliver_only` webhook route's `chat_id` was
mistaken for "the DM with the third party" when it was actually Bo's own DM
with the bot (used as an automation delivery target). Always cross-check a
webhook/automation `chat_id` against real `user=` values seen in that chat's
inbound history — don't infer identity from a chat_id's role in a webhook
config.

## Related but distinct: don't confuse with legacy relay tokens

A separate legacy system (tmux-based Grok CLI relay under
`~/.claude/channels/discord-<agent>/.env`) may hold a *different, possibly
dead* Discord bot token for the same-named agent. Test the token actually
used by the **Hermes gateway** (`~/.hermes-<profile>/.env`) directly — it can
be perfectly valid (HTTP 200 on `/users/@me`) even while the legacy relay's
separate token 401s. Don't let a dead legacy token diagnosis stand in for
checking the live gateway's own credentials.
