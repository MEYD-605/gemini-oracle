# Discord bot token reset / reconnect-loop notes

## Two causes of token invalidation

### 1. Reconnect storm (original)
Discord may invalidate a bot token when the bot reconnects excessively in a short time window. The user-facing symptom is a Discord notice saying the bot connected more than ~1000 times and the token was reset.

### 2. Token pasted in a Discord message (CRITICAL — 2026-07-16)
**Discord auto-scans ALL messages — including DMs — for bot token patterns.** If a token appears in any message body, Discord invalidates it within seconds. This is the most likely cause of repeated bot kicks when tokens are being rotated.

**Bo pasted 3 fresh tokens (no.4, sombo, no.1) in a Discord DM on 2026-07-16.** Even though they were freshly reset, Discord's scanner likely flagged them. This is why bots "keep getting kicked" — not a config bug.

**Rule: NEVER paste bot tokens in Discord chat, even in DM.** If Bo sends tokens via DM:
- They may already be invalidated by the time you read them.
- Use them immediately (update `.env` + restart relay), but if the bot disconnects again shortly after, the token was killed by the paste — not by a config problem.
- Next time Bo needs to rotate, tell him to put the token in a file directly or use a non-Discord channel.

## Bot relay architecture (maclab fleet)

Each Discord bot runs as a **Rust `discord-relay`** binary managed by **launchd keepalive**:

| Bot | Agent name | State dir | Keepalive script | launchd label |
|-----|-----------|-----------|------------------|---------------|
| No.1 | `01-lord-knight` | `~/.claude/channels/discord-no1` | `~/.maw/no1-relay-keepalive.sh` | `com.maclab.no1-relay-keepalive` |
| No.4 | `04-mimo` | `~/.claude/channels/discord-no4` | `mimo-oracle/ψ/tools/no4-relay-keepalive.sh` (via `~/.maw/no4-relay-keepalive.sh`) | `com.maclab.no4-relay-keepalive` |
| Sombo | `88-sombo` | `~/.claude/channels/discord-sombo` | `~/.maw/sombo-relay-keepalive.sh` | `com.maclab.sombo-relay-keepalive` |
| No.6 | `06-gemini` | `~/.claude/channels/discord-no6` | `com.maclab.no6-relay-keepalive` | `com.maclab.no6-relay-keepalive` |

**Token storage:** `~/.claude/channels/discord-{agent}/.env` → `DISCORD_BOT_TOKEN=...`

**Relay binary:** `/Users/admin/maw-workspace/tools/discord-reply-rust/target/release/discord-relay`

**Keepalive behavior:** launchd runs each keepalive script every 60s. The script checks if `discord-relay --agent {name}` is running; if not, starts it with `nohup`. Has a load-guard (skips if `load1m > 20`).

## Token rotation procedure (multi-bot)

```bash
# 1. Backup current .env
cp ~/.claude/channels/discord-{agent}/.env ~/.claude/channels/discord-{agent}/.env.bak.$(date +%Y%m%d_%H%M%S)

# 2. Write new token
# DISCORD_BOT_TOKEN=<new_token>

# 3. Kill stale relay
pkill -f "discord-relay --agent {agent_name}"

# 4. Start via keepalive script (or wait 60s for launchd)
bash ~/.maw/{agent}-relay-keepalive.sh

# 5. Verify
ps aux | grep "discord-relay --agent {agent_name}" | grep -v grep
tail -5 ~/.maw/relay-{agent}.log
```

**Success signals in log:**
```
Bot Identity: <bot_id>
Connected successfully. Starting event loop...
Heartbeat interval: 41250 ms
Sent Identify payload.
```

## Hermes gateway token (separate from bot relays)

For the Hermes Discord gateway (ai.hermes.gateway), the token lives in Hermes config, not in `~/.claude/channels/`. Safe restart:
```bash
launchctl kickstart -k user/$(id -u)/ai.hermes.gateway
```

## Post-reboot crash loop (Abort trap 6) — 2026-07-16

After a machine hard-reset (power button >4s, SMC shutdown cause 3), relays don't cleanly auto-restart. The launchd keepalive (every 60s) starts a new relay, but if the previous instance is still dying or if the WebSocket session is in a bad state, the relay hits **"Session Invalid (OP 9)"** → reconnect storm → **"Abort trap: 6"** crash. The keepalive then restarts it 60s later, creating a crash-restart loop that can run for hours.

**Symptoms:**
- keepalive log shows repeating `DEAD → STARTED → DEAD → STARTED` every 60s
- `.launchd.err` shows `Abort trap: 6` on the `nohup` line
- relay log (e.g. `relay-no1.log`) grows to multiple MB with `401 Unauthorized` or `Session Invalid (OP 9)` spam
- This crash loop can contribute to **machine freezes** (the relay-no1.log was 8MB of crash-retry spam when the machine hung)

**Root cause:** multiple relay instances competing for the same Discord WebSocket gateway session. When two instances connect with the same token, Discord sends OP 9 (Session Invalid) to one, it crashes, keepalive restarts it, and the cycle repeats.

## Clean restart procedure (after crash loop or machine freeze)

```bash
# 1. Kill ALL instances including zombies — use -9 for stuck processes
for agent in 04-mimo 88-sombo 01-lord-knight; do
  pkill -f "discord-relay --agent $agent" 2>/dev/null; sleep 1
  pkill -9 -f "discord-relay --agent $agent" 2>/dev/null
done
sleep 2

# 2. Verify ALL are dead (only 06-gemini should remain)
ps aux | grep "discord-relay" | grep -v grep

# 3. Truncate bloated logs (crash loops can create 8MB+ logs)
for b in no4 sombo no1; do
  > ~/.maw/relay-$b.log
done

# 4. Test each token individually BEFORE starting permanent relay
#    (catches invalidated tokens without starting a crash loop)
RELAY="/Users/admin/maw-workspace/tools/discord-reply-rust/target/release/discord-relay"
timeout 6 "$RELAY" --agent 04-mimo --state-dir ~/.claude/channels/discord-no4 2>&1 | head -6
# Look for: "Connected successfully" + "Sent Identify payload" = token works
# Look for: "401 Unauthorized" = token dead, needs re-reset

# 5. Start ONE instance per bot (background=true in Hermes terminal)
#    Do NOT use shell nohup — Hermes blocks it. Use terminal(background=true).
"$RELAY" --agent 04-mimo --state-dir ~/.claude/channels/discord-no4 >> ~/.maw/relay-no4.log 2>&1 &
"$RELAY" --agent 88-sombo --state-dir ~/.claude/channels/discord-sombo >> ~/.maw/relay-sombo.log 2>&1 &
"$RELAY" --agent 01-lord-knight --state-dir ~/.claude/channels/discord-no1 >> ~/.maw/relay-no1.log 2>&1 &

# 6. Verify after 3s
sleep 3
ps aux | grep "discord-relay" | grep -v grep | grep -v "06-gemini"
tail -3 ~/.maw/relay-no4.log
tail -3 ~/.maw/relay-sombo.log
tail -3 ~/.maw/relay-no1.log
```

**Key lesson:** Always test tokens individually with `timeout 6` BEFORE starting the permanent relay. A dead token in a launchd-managed relay creates a crash loop that can run for hours and potentially freeze the machine.

## Avoid
- Reusing the old token after Discord has invalidated it.
- **Pasting tokens in Discord messages** — Discord auto-scans and invalidates.
- Diagnosing token failure from empty-message send errors alone.
- Leaving a reconnect loop running while the token is already known-bad.
- Killing relay processes without backing up `.env` first.
- **Starting relays without testing tokens first** — a dead token in launchd = crash loop.
- **Leaving crash loops running** — 8MB of reconnect spam can contribute to machine freeze.
- **Using shell `nohup` from Hermes terminal** — blocked by Hermes; use `terminal(background=true)`.
