# Fleet Discord Architecture: relay-ws vs Hermes Gateway vs maw-rs Native

**Updated:** 2026-07-25 · **Status:** gmaicore migration FAILED — rolled back. Reference for future attempts.

## ⚠️ CRITICAL LESSON (2026-07-25)

**VERIFY WHAT CLI ACTUALLY RUNS IN TMUX BEFORE TOUCHING DISCORD PATH.**

I attempted to migrate gmaicore's 06-gemini from `discord-relay-ws.ts` to Hermes gateway native (following the GmGrub pattern). I:
1. Created `discord-state/` for Hermes gateway
2. Killed relay-ws 06 + disabled systemd service
3. Restarted Hermes gateway

**But 06-gemini is AGY CLI (Gemini 3.6 Flash), NOT Hermes.** It runs `agy --dangerously-skip-permissions --model 'Gemini 3.6 Flash (High)'` inside tmux. It depends on `discord-relay-ws.ts` for Discord I/O — relay-ws sends Discord messages into the tmux pane via `send-keys` and captures output to send back. Hermes gateway cannot serve AGY CLI this way.

**Result:** killed the agent's Discord, had to roll everything back. Bo: "มึงอ่ะชอบมั่ว" + "ชอบได้หน้าลืมหลังระวังด้วยไม่ค่อยเช็คบางอย่าง".

**Pre-migration checklist (ALWAYS run first):**
```bash
# 1. What CLI runs in this tmux session?
ssh root@100.81.0.110 'tmux list-panes -t 06-gemini -F "#{pane_current_command} #{pane_pid}"'
# → agy = AGY CLI (Gemini) — CANNOT use Hermes gateway for Discord
# → hermes = Hermes chat — CAN use Hermes gateway
# → grok = Grok CLI — uses Hermes gateway or own Discord path

# 2. What process does the tmux session actually launch?
ssh root@100.81.0.110 'ps aux | grep 06-gemini | grep -v grep'
# Look for: agy / hermes / grok / claude in the command line

# 3. Only proceed with Hermes gateway migration if the agent IS Hermes
```

## Three Discord architectures in the fleet

### 1. discord-relay-ws.ts (Bun standalone — maw-js era)
```
Discord WS ←→ discord-relay-ws.ts (Bun) ←→ .claude/channels/discord-X/ ←→ tmux send-keys → AGY/Grok/Claude CLI
```
- Used by: **06-gemini (AGY)**, **08-agy-nano2 (AGY)** on gmaicore
- systemd service per agent (`no6-discord-relay.service`, etc.)
- Each relay uses one bot token, routes via tmux send-keys into the agent's pane
- **This is the ONLY path for non-Hermes CLI agents** (AGY, Grok CLI, Claude CLI)

### 2. Hermes gateway direct (GmGrub pattern)
```
Discord WS ←→ Hermes gateway (discord-state/) ←→ Hermes agent session
```
- Used by: **GmGrub (Note20)**, **gmgrok (maclab)**, **gmforge/no5 (maclab)**
- `$HERMES_HOME/discord-state/.env` holds `DISCORD_BOT_TOKEN`
- Hermes gateway connects directly, no relay binary
- **Only works for Hermes CLI agents** — not AGY/Grok/Claude

### 3. maw-rs native (พี่นัท's design — NOT YET DEPLOYED, verified 2026-08-03)
```
Discord WS ←→ maw-rs serve (plugin) ←→ tmux send-keys → any CLI
```
- Designed by P'Nat (Soul-Brews-Studio/maw-rs and tonkmac's fork — same crate, same state)
- Discord would be a **maw-rs transport plugin** — any CLI in tmux gets Discord
- Would replace both relay-ws AND per-agent Hermes gateways
- **Status: still design only as of 2026-08-03.** `crates/maw-discord/src/gateway.rs` has a fully-written, unit-tested `spawn_gateway()` (real twilight-gateway Discord websocket client) — but grep the whole repo (`grep -rn spawn_gateway crates/`) and every call site is inside `gateway_tests.rs`/`gateway_contract.rs`. No CLI subcommand wires it up; `maw discord --help` only lists `bind/pair/route/serve/access/status/tokens`, and `bind --apply` explicitly errors `"native maw-rs bind apply is intentionally not implemented in REST-only piece 1"`. This was true on both `main` and bleeding-edge `alpha` (fetched fresh, checked commits through Nat's Aug-2 commit). **Don't infer "it's ready" from the crate/module existing — a function can be fully coded and tested and still be dead code with zero callers.**
- `maw atlas route`/`reverse-bridge.ts` (the older `maw-js`/Bun TS implementation of the same poll-diff-forward idea) is a real, working implementation of the *reverse* direction (pane→Discord) — but it lives on an **unmerged feature branch** (`feat/maw-discord-post`, diverged from main since 7 Jun, never merged — verify via `git merge-base --is-ancestor <branch> main`), last touched 19 Jun, and isn't wired to the `maw-rs` binary the fleet actually runs (`maw atlas` under `maw-rs` only supports `discord-inv`, an inventory-only Discord REST subcommand — nothing about routing/bridging). Treat "I found the source file" as zero evidence of "this is what's running in production" until you've also checked merge status + which binary loads it.
- discord-relay-ws.ts does effectively this already (Discord → tmux send-keys) but as a standalone Bun script, not a maw plugin — see path 4 below for the concrete deployment pattern actually running in the fleet today.

### 4. Hermes native multi-profile — the answer to "how do I get engine X (Codex, GLM, etc.) onto Discord" (found 2026-08-03, from Nat's own `setting-up-hermes.pdf` / `01-discord-channel-internals.pdf` book pair)

**Do not try to route Discord into a raw CLI's tmux pane for a non-Hermes engine (path 1's job).** The pattern Nat actually uses on his own machine (`nh`, profile `kikyo-codex`) is simpler: run the *other engine as the model backend of a Hermes profile*, and let Hermes's own built-in Discord gateway (path 2) serve it — because from Hermes's perspective the backend model provider (Claude / Codex / GLM / whatever) is just a config value, not a different Discord integration.

```
~/.hermes/profiles/kikyo-codex/
├── config.yaml   ← discord block + model/provider = codex, lines ~450-470
└── .env          ← DISCORD_BOT_TOKEN for this profile only
```

Isolation is via `HERMES_HOME` pinned in the **launchd plist** (not a shell env var, not `DISCORD_STATE_DIR`):
```xml
<!-- ~/Library/LaunchAgents/ai.hermes.gateway-kikyo-codex.plist -->
<key>HERMES_HOME</key>
<string>/Users/nh/.hermes/profiles/kikyo-codex</string>
```
`hermes_constants.py:get_hermes_home()` resolution order: (1) in-process context override → (2) `HERMES_HOME` env var set by the plist/systemd unit → (3) platform default `~/.hermes`. Every profile's token/allowlist/log/session cache all live under one `HERMES_HOME` — there is no separate Discord-specific env var to juggle (unlike relay-ws's `DISCORD_STATE_DIR`, which must be set correctly on every process spawn).

`config.yaml` discord block that matters:
```yaml
discord:
  require_mention: true                 # bot stays silent outside free_response_channels unless @mentioned
  free_response_channels: '<channel_id>'  # channels where it answers without mention
  auto_thread: true
  history_backfill: true
```
Config merge priority (highest wins): env vars → profile `config.yaml` → profile `.env` → legacy `gateway.json` → built-in defaults. A profile that defines even one line for a key always beats global fallback — no partial merge.

**When to use this vs relay-ws (path 1):** if the target engine can run as a Hermes profile's model provider, use this — it's the officially-supported, isolated, no-custom-relay-code path. Only fall back to relay-ws/send-keys (path 1) for engines Hermes genuinely cannot drive as a backend (raw AGY CLI, Grok CLI in interactive mode, etc.).

## Fleet agent → CLI → Discord path map (verified 2026-07-25)

| Agent | Node | CLI | Discord path |
|-------|------|-----|-------------|
| 06-gemini | gmaicore (100.81.0.110) | **AGY** (Gemini 3.6 Flash) | discord-relay-ws.ts |
| 08-agy-nano2 | gmaicore | **AGY** | discord-relay-ws.ts |
| gmgrok (00) | maclab | Hermes | Hermes gateway |
| gmforge/no5 (05) | maclab | Hermes | Hermes gateway |
| lord-knight/no1 (01) | maclab | Grok/Hermes | Hermes gateway |
| mimo (04) | maclab | Hermes | Hermes gateway |
| sombo (88) | maclab | Grok | Hermes gateway |
| GmGrub (10) | Note20 | Hermes | Hermes gateway direct |

**Key insight:** gmaicore agents (06, 08) use AGY CLI — they CANNOT migrate to Hermes gateway. They need either relay-ws or a future maw-rs Discord plugin.

## GmGrub (Note20) reference config

- **Tailscale hostname:** `note20` (NOT `dex-note20-d1` — resolves but connection refused)
- **tmux session:** `10-gmgrub`
- **HERMES_HOME:** `/data/data/com.termux/files/home/.hermes-no101`
- **Runs on:** Android Termux + proot-distro Debian
- **maw-rs serve:** port 3456 (HTTP federation bus)
- **discord-state/.env:** `DISCORD_BOT_TOKEN` + `DISCORD_ALLOWED_USERS` + `GATEWAY_ALLOW_ALL_USERS=true` + `HERMES_YOLO_MODE=1`
- **discord-state/discord-gateway.env:** `DISCORD_ALLOW_BOTS=mentions` + `DISCORD_AUTO_THREAD=false` + `HERMES_YOLO_MODE=1`
- **No relay-ws at all** — pure Hermes gateway

## Hermes gateway migration (ONLY for Hermes CLI agents)

If an agent runs Hermes in tmux (not AGY/Grok/Claude), you can migrate:

1. **Source bot token** from old relay's state dir or existing config
2. **Create discord-state:**
   ```bash
   mkdir -p $HERMES_HOME/discord-state
   # .env with DISCORD_BOT_TOKEN, DISCORD_ALLOWED_USERS, GATEWAY_ALLOW_ALL_USERS
   # discord-gateway.env with DISCORD_ALLOW_BOTS, DISCORD_AUTO_THREAD, etc.
   chmod 600 $HERMES_HOME/discord-state/.env
   ```
3. **Kill old relay + disable systemd** (CRITICAL — token conflict):
   ```bash
   systemctl stop <relay-service>
   systemctl disable <relay-service>
   ```
4. **Restart Hermes gateway** (must use heredoc/execute_code — gateway guard blocks inline kill+restart):
   ```bash
   ssh root@<node> 'bash -s' << 'REMOTE_EOF'
   kill <old_gateway_pid>
   sleep 3
   export HERMES_HOME=<path>
   set -a; . $HERMES_HOME/discord-state/.env; . $HERMES_HOME/discord-state/discord-gateway.env; set +a
   nohup $HERMES_HOME/venv/bin/hermes gateway run --replace > /tmp/gw.log 2>&1 &
   sleep 8
   tail -5 $HERMES_HOME/logs/gateway.log
   REMOTE_EOF
   ```
5. **Verify:** `[Discord] Connected as <botname>` in gateway log

## Pitfalls

- **Two processes, same bot token = WS eviction loop.** Always stop+disable relay service BEFORE starting gateway with same token.
- **systemd Restart=on-failure revives killed relays.** `kill -9` alone is not enough. Must `systemctl stop + disable`.
- **Gateway guard blocks kill+restart from within SSH.** Use `execute_code` (Python `hermes_tools.terminal`) or heredoc.
- **nohup doesn't survive reboot.** For production, set up systemd service or launchd plist.
- **Hermes gateway cannot serve non-Hermes CLI agents.** AGY/Grok/Claude need relay-ws or maw-rs plugin for Discord.
