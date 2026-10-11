# Credential Pool Debugging & Discord DM/Webhook Verification (2026-08-11)

## 9router / Hermes Credential Pool Debugging

**A provider "not working" complaint (e.g. "glm เป็นไรวะ") can be a stale/duplicate
credential pool entry, not a dead API key.**

`~/.hermes-no*/auth.json` → `credential_pool.<provider>` can hold multiple entries
for the *same underlying key* pointing at different `base_url`s — e.g. one entry
for a pay-as-you-go endpoint that's out of balance, another for a
subscription/coding-plan endpoint that's healthy. Hermes tries entries in
`priority` order (0 first), so a dead priority-0 entry surfaces as "provider
broken" to the user even though a working priority-1 entry sits right behind it
and the raw API key itself is completely fine.

### Diagnosis sequence
1. `curl` the actual model endpoint directly with the key from `.env` first —
   this isolates "is the key/model actually fine" from "is Hermes's routing
   broken". If that returns 200, the break is in Hermes's own
   credential-pool/routing layer, not upstream.
2. Inspect `auth.json`'s `credential_pool.<provider>` array for duplicate
   entries with different `base_url`. Test each `base_url` individually
   (same key, different URL) to find which one is dead.
3. Fix: remove the dead-endpoint entry (**back up `auth.json` first** —
   `cp auth.json auth.json.bak-$(date +%Y%m%d-%H%M%S)`), leave the working one.
4. Takes effect on next gateway/process restart — reloading `auth.json`
   does NOT happen automatically mid-process. Don't restart the gateway
   you're currently talking through (kills the live session); tell the
   user it'll apply next restart, or restart a *different* seat's gateway.

### Concrete case (2026-08-11, GLM/zai on maclab no5)
Two `credential_pool.zai` entries, same key `ccce8b0b...`:
- `bo-glm` (priority 0) → `api.z.ai/api/paas/v4` (pay-per-token, balance
  exhausted → `{"code":"1113","message":"Insufficient balance..."}`)
- `ZAI_API_KEY` (priority 1) → `api.z.ai/api/coding/paas/v4` (Coding Plan
  subscription, healthy, HTTP 200)
Removed the priority-0 entry; kept priority-1.

## Discord DM / Webhook Delivery Verification

**Never confirm "DM setup succeeded" from a webhook subscription or approval
flow completing — verify against actual inbound log lines from the target
user.**

A `webhook_subscriptions.json` route existing (even `deliver_only: true`
firing successfully) only proves outbound delivery works for whoever/whatever
triggers that webhook — it says nothing about whether the *other person*
(e.g. "พี่โม") has ever actually messaged the bot.

### Verification steps before reporting "DM works" to Bo
1. `grep "inbound message" ~/.hermes-noX/logs/gateway.log | sed -n
   's/.*user=\([^ ]*\).*/\1/p' | sort -u` — list every unique sender across
   the whole log history.
2. If the named person never appears as a sender, they have never messaged
   that bot — full stop, regardless of what got configured on the sending
   side.
3. Don't assume a `chat_id` referenced in a webhook config is a DM *with the
   person being discussed* — it is frequently the DM between Bo and the bot
   itself (used as the delivery target for automation output), not a DM
   with the third party. Cross-check `chat_id` against actual `user=` values
   seen in that chat's inbound history before concluding who it belongs to.
4. Also check `~/.hermes-noX/pairing/` — if empty, no external Discord user
   is authorized for DM with that bot yet (only the configured home channel
   works by default). A third party's DM may be silently unauthorized rather
   than unanswered.

### Concrete case (2026-08-11/12, No.4/mimo ↔ "พี่โม")
Bo asked No.4 to "set up answering พี่โม's DM". A webhook route
`mimo-talkback` (`deliver_only: true`) existed and fired successfully — but
grepping the full gateway log's inbound `user=` field showed only
`Meyd-605`, `maw-hey`, `nazt` ever sent a message; "พี่โม" never appeared.
The `chat_id` in the webhook config was Bo's own DM with No.4, not a DM with
พี่โม. Conclusion given to Bo: พี่โม has not actually messaged the bot yet
(or messaged the wrong place), and even if he does, `pairing/` is currently
empty so he isn't pre-authorized for DM.
