# Handoff: Fleet fixes — B3/PimQuin, No.3 slash, No.1, Rdda upgrade, Sombo, maclab heat

**Date**: 2026-10-13 07:52
**Context**: ~high (long Discord DM lane with Bo, compacted once)
📡 SESSION: 3_548e8d | msgs=365 | cc/claude-opus-5-5
Tag: [maclab:04-mimo]

## What We Did
- **white (iMac พี่บูม) B3 + PimQuin Discord drop**: bun discord plugin stuck SYN_SENT to bogus 10.10.0.1/[2020::1] after net blip → killed stale claude PIDs, loops respawned. Installed `~/discord-link-watch.sh` + LaunchAgent `com.b3.discord-link-watch` (120s, restart seat after 3 zero-socket checks). ARRA learn saved.
- **No.3 / No.10 slash commands leaking into every bot DM**: ClubSGame `E:\Agents\highclass-oracle\scripts\no3-slash-menu.py` + `E:\Agents\no10-oracle\scripts\no10-slash-menu.py` → `allowed_installs(guilds=True, users=False)`, `private_channels=False` (backups `.bak-userinstall-20261012`); scheduled tasks restarted; REST verified guild-install only.
- **No.1 stuck** (interrupted mid-reply 19:29, queued "merge PR ทั้งหมด") → cleared buffer, No.1 replied Bo 19:41. Told Hermes Prime (white) to talk to No.1 only via MQTT `oracle/01-lord-knight/general/in`, never tmux.
- **Hermes Prime got Grok VM access how-to** (`ssh grok-vm` from white = box@100.70.26.108) via MQTT `oracle/hermes-prime/general/in`; it verified tmux ls.
- **Grok VM "ดับ" RCA** (for Bo/พี่กอล์ฟ): not a crash — cloud pod hibernates/pauses ("virtual machine fork" 233× in 2 days); in-box keepalives don't count as activity. Keep-awake Routine `keep-computer-awake` (every 5 min) created in box 22:43 — first run unverified.
- **Rdda (Muk iMac, `rdda` = 100.83.15.49, user `use`)**:
  - Backup `~/rdda-backups/hermes-rdda-20261012-2104.tgz`
  - Hermes v0.18 → **v0.21.7** side-by-side at `~/.hermes-install-v21/venv` (+ `.[messaging]`, openpyxl). Launchers `~/.rdda/start-rdda-gateway.sh`, `start-rdda.sh` repointed (`.bak-v018`). gmaicore left on old install.
  - `_initializer` bug gone after switch. env hint fixed (gemini-3.8-flash-high, not sonnet).
  - Own memory confirmed local (`~/.hermes-rdda/memories`, own ARRA); removed stale B3 note; config backup `config.yaml.bak-v018-*`.
  - New skills `~/.hermes-rdda/skills/muk-work/`: `muk-tenant-rep-leasing`, `muk-office-docs`, `muk-inbox-followup` (+ moved `mook-office`). Tested: Rdda summarized Muk's Colliers role + WK LINE lead + WHA Bangna follow-up.
  - Discord reconnected as D.Rdda#6413 on v0.21.7 (~21:18).
  - **Power RCA**: sched shutdown 02:00 / wake 07:00 is fine; last 2 outages = "Battery disconnected" (power cut) and `autorestart` = 0, so the Mac stays off after power loss.
- **Sombo (No.88) stuck 1h03m** on a 160-tool photo-preview loop (392k ctx) → Esc, queued /forward + /clear ran, replied Bo 21:46. Then switched live model to **cc/claude-fable-5-1** (`/model`; pin file `~/.claude/channels/discord-sombo/anthropic-model` already fable-5-1).
- **maclab "ร้อน" (07:13)**: CPU 41–53°C, fan 2238 rpm (curve 42→65 by design), no throttle, load spike ~8 → 5.9. Top CPU: Discord desktop app 40–60% (up 19 days), WindowServer ~30%, syspolicyd bursts, DisplaysExt 30%. Swap 2.2/3 GB. No changes made.

## Pending
- [ ] Bo: OK to restart Discord desktop app on maclab (biggest CPU hog)
- [ ] Bo: optional fan curve 42→45 start if noise bothers him
- [ ] Muk: run `sudo pmset autorestart 1` on rdda (needs her password) — or System Settings › Energy › start after power failure
- [ ] Rdda: `nemo_relay` ModuleNotFoundError (4×, terminal tool in cron job) — not fixed
- [ ] Rdda: live Discord round-trip test on v0.21.7 not yet done (needs a human message)
- [ ] Rdda: LINE desktop window closed since 2026-09-21 → line scan fails; ask Muk to keep it open
- [ ] Rdda Wi-Fi flaps (SSH dropped 3–4× during work) — suggest LAN cable
- [ ] Grok VM (Golf): verify Routine `keep-computer-awake` actually runs (`runs.json`) and whether hibernation drops
- [ ] vivo X Fold 3 (100.87.109.68) offline — battery/thermal-alert check still blocked until Bo opens Tailscale + sshd
- [ ] ClubSGame agents: not yet assigned/tested on real business work (quotes, page chat)

## Next Session
- [ ] Re-check maclab load + Discord app CPU after Bo decides
- [ ] Confirm Rdda replies on Discord with v0.21.7, then grep errors.log for new errors
- [ ] Investigate `nemo_relay` import in hermes v0.21.7 relay_runtime (optional dep → install or disable relay)
- [ ] Check Grok VM routine runs + hibernation count

## Key Files
- white: `~/discord-link-watch.sh`, `~/Library/LaunchAgents/com.b3.discord-link-watch.plist`
- game: `E:\Agents\highclass-oracle\scripts\no3-slash-menu.py`, `E:\Agents\no10-oracle\scripts\no10-slash-menu.py`
- rdda: `~/.hermes-install-v21/`, `~/.rdda/start-rdda-gateway.sh`, `~/.hermes-rdda/skills/muk-work/`, `~/rdda-backups/`
- maclab: `~/.claude/channels/discord-sombo/anthropic-model`, `gmgrok-oracle/ψ/tools/maclab-fan-health.sh`
