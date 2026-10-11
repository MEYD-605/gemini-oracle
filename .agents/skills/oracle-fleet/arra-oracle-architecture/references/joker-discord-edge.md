# Joker No.99 Discord Integration on Cloudflare Edge

Updated: 2026-08-10

## 1. Deployment Overview

- **Worker URL:** `https://joker.clubsxai.com` (custom domain via `joker.clubsxai.com/*` route)
- **workers.dev URL:** `https://joker-oracle.ai-no-1bro.workers.dev`
- **wrangler deploy:** `cd /Users/admin/Code/github.com/MEYD-605/joker-oracle && CLOUDFLARE_API_TOKEN="S4Y1Ra..." wrangler deploy`
- **Bot Token:** Stored in Cloudflare Secrets as `DISCORD_BOT_TOKEN` (set via `echo "<token>" | wrangler secret put DISCORD_BOT_TOKEN`)
- **Public Key:** `86747358b3783330d27a5be6e3d1ca346fbbf3329f9ee4ab51167b8f8a13dc87` (stored as `DISCORD_PUBLIC_KEY`)
- **App ID:** `1492092474515259402` (Bot: `No.99 Joker#0343`)
- **Bot User ID (Meyd-605):** `910909378876571658`
- **DM Channel ID (Bo↔Joker):** `1492095180218568835`

---

## 2. Direct DM via REST API (Working — 2026-08-10)

Cloudflare Workers CAN initiate Discord DMs using REST API v10 (no Gateway needed):

```typescript
// Step 1: Create DM Channel
const ch = await fetch("https://discord.com/api/v10/users/@me/channels", {
  method: "POST",
  headers: { "Authorization": `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ recipient_id: "910909378876571658" })  // Bo's User ID
});
const chData = await ch.json();
const channelId = chData.id;  // "1492095180218568835"

// Step 2: Send Message
await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
  method: "POST",
  headers: { "Authorization": `Bot ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ content: "🃏 Hello from Cloudflare Edge!" })
});
```

**Verification:** HTTP 200 response with `message.id` confirms delivery. Check Discord DM to verify.

---

## 3. Discord Interaction Endpoint (Slash Commands / Webhooks)

### Why Interaction Endpoint URL Won't Save (Common Pitfall)
Discord **requires Ed25519 signature verification** before allowing you to save `Interactions Endpoint URL` in Developer Portal. If the Worker doesn't verify signatures correctly, Discord shows:
> `การตรวจสอบความถูกต้อง: Interactions_endpoint_url: และยืนยัน URL...` (Validation error — red border)

**Fix:** Worker must:
1. Read `x-signature-ed25519` and `x-signature-timestamp` headers
2. Verify using `nacl.sign.detached.verify()` with the app's Public Key
3. Return `{"type":1}` for PING (`payload.type === 1`) within **3 seconds**

```typescript
import nacl from 'tweetnacl';

const isVerified = nacl.sign.detached.verify(
  Buffer.from(timestamp + body),
  Buffer.from(signature, 'hex'),
  Buffer.from("86747358b3783330d27a5be6e3d1ca346fbbf3329f9ee4ab51167b8f8a13dc87", 'hex')
);
if (!isVerified) return new Response('Invalid signature', { status: 401 });

if (payload.type === 1) return Response.json({ type: 1 });  // PING response
```

### Finding the Public Key
Go to `discord.com/developers/applications/<APP_ID>` → **General Information** → copy **`PUBLIC KEY`** field (64-char hex string).

### Slash Command Deferred Response (Avoid "Application Did Not Respond")
Discord requires response within **3 seconds**. Workers AI (Llama 3.3 70B) takes 4-5s → always causes timeout error.

**Fix:** Return `type: 5` (deferred) immediately, then use `ctx.waitUntil()` to compute and PATCH:

```typescript
// Respond to Discord immediately (< 0.1s)
if (payload.type === 2) {
  const appId = payload.application_id;
  const interactionToken = payload.token;
  
  ctx.waitUntil((async () => {
    const reply = await getAIReply(env, userQuery);  // Can take 5+ seconds, that's OK
    await fetch(`https://discord.com/api/v10/webhooks/${appId}/${interactionToken}/messages/@original`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply })
    });
  })());
  
  return Response.json({ type: 5 });  // Discord shows "thinking..." immediately
}
```

---

## 4. Discord Gateway WebSocket via Durable Objects (Two-Way DM — Partial)

**Library:** `discord-gateway-cloudflare-do` (npm v0.1.2, Dan Carter, MIT License)

**Architecture:**
```
Discord WebSocket Gateway
        │
Cloudflare Durable Object   ← holds persistent WebSocket connection
        │ HTTP POST forward
Cloudflare Worker           ← handles events, replies
```

**Key Features:**
- Persistent WebSocket stays connected even during Worker sleep/eviction
- Heartbeat via Cloudflare Alarms (Hibernation API) — near-zero cost when idle
- Auto-reconnect with backoff on disconnect
- Forwards `MESSAGE_CREATE`, `REACTION_ADD`, etc. to Worker via HTTP POST

**wrangler.toml Requirements:**
```toml
[durable_objects]
bindings = [
  { name = "DISCORD_GATEWAY", class_name = "DiscordGatewayDO" }
]

[[migrations]]
tag = "v1"
new_classes = ["DiscordGatewayDO"]
```

**⚠️ PITFALL — Durable Object Migration Tags:**
- `new_sqlite_classes` (for SQLite storage) vs `new_classes` (for regular storage) — wrong tag causes deploy error `10074: Cannot apply new-sqlite-class migration to class already depended on by existing Durable Objects`
- Use `new_classes` first. Only use `new_sqlite_classes` for fresh DOs.

**⚠️ PITFALL — Error 1101 (Worker Unhandled Exception):**
- Occurs when DO class binding fails at runtime
- Root cause investigated: module bundling of `DiscordGatewayDO` from npm library into Cloudflare Worker context has unresolved issues (2026-08-10)
- **Status: UNRESOLVED** — Worker's `export { DiscordGatewayDO }` from npm doesn't satisfy CF runtime DO binding requirements in all cases

**Connect Gateway (One-time setup after deploy):**
```bash
curl -X POST "https://joker.clubsxai.com/connect" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 5. Token Security (Critical)

**NEVER post Discord Bot Tokens in any chat/Discord channel!**

Discord has an automated scanner that detects token format (`MTQ5MjA5...` prefix) in chat messages. When detected, Discord **automatically revokes the token** instantly, causing:
- HTTP 403 Forbidden on all API calls
- Bot goes offline
- Must reset token in Developer Portal → **Bot** → **Reset Token**

**After reset:**
1. Copy new token immediately
2. Update Cloudflare secret: `echo "<new_token>" | wrangler secret put DISCORD_BOT_TOKEN`
3. Verify: `curl -s -H "Authorization: Bot <token>" https://discord.com/api/v10/users/@me`

---

## 6. Quota & Cost Breakdown ($5/mo Workers Paid)

| Resource | Included | Used (Fleet) | Cost Extra |
|---|---|---|---|
| Workers Requests | 10M/month | < 50K | $0 |
| Workers AI (bge-m3) | 10K reqs/day | ~488 sync | $0 |
| Vectorize Storage | 5M vectors | 26,374 | $0 |
| Durable Object Reqs | 1M/month | < 5K | $0 |
| R2 Storage | 10GB/month | 14.75MB | $0 |
| Cron Watchdog (*/5) | - | 8,640/month | $0 |
| **Total** | | | **$0 extra** |

---

## 7. Finding User IDs for DM

Source from Hermes session DB:
```python
import sqlite3, json
db = sqlite3.connect('/Users/admin/.hermes-gmgrok/state.db')
rows = db.execute("SELECT * FROM gateway_routing").fetchall()
for r in rows:
    data = json.loads(r[2])
    origin = data.get('origin', {})
    print(origin.get('user_id'), origin.get('user_name'), origin.get('chat_type'))
```

**Known IDs:**
- Bo (Meyd-605 / borde9902): `910909378876571658`
- Joker Bot App ID: `1492092474515259402`
- DM Channel (Bo ↔ Joker): `1492095180218568835`
