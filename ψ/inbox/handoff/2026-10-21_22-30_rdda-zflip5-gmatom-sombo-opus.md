# Handoff: Rdda → Z Flip 5 standalone · GmAtom caretaker · Sombo back on Opus

**Date**: 2026-10-21 22:30
**Seat**: [maclab:04-mimo] · cc/claude-opus-5-5
📡 SESSION: 20261021_152055_0d6893 (Discord DM Bo)

## What We Did
### GmAtom (OnePlus 8T, `8t-wifi`, Haiku 5.5)
- Root cause of the "hallucinating": 12 reboots in 24h, no boot checklist, and its docs never mentioned the intentional settings (`clubs8t-charger.sh` stops charging at 60%; `clubs8t-power-cap.sh` caps the CPU at ~1.17 GHz).
- Changes made:
  - Rewrote `~/gmatom/CLAUDE.md`: Caretaker role, boot checklist, handoff discipline, and a "Known intentional settings" section.
  - Added a SessionStart hook in `~/.claude-gmatom/settings.json` that cats `focus.md` plus the latest handoff.
  - Copied in 4 of Sombo's lessons.
  - Backup: `~/gmatom/.bak-no4-20261021-1523`.
- Verified with 3 test questions; all answered correctly. 8T handed back to No.5 for the kernel r51 flash.

### Rdda on Samsung Z Flip 5 (`192.168.1.184:5555`, Termux; custom Python bot, NOT Hermes)
- **9router route:** LAN-first `http://192.168.1.180:20128/v1`, then `https://9router.clubsxai.com/v1`. The Tailscale route (100.83) is removed.
- **Model fallback:** `ag/claude-sonnet-5-5-high`, then `cc/claude-sonnet-5-5`, then `ag/gemini-3.8-flash-high`. `cc` was returning 429 / 500.
- **Tool progress in Discord** (Hermes style, one message edited as tools run). Hidden for Khun Mook (id 1136298690697506926).
- **Tool rounds:** max 2 → 8; steps 5 → 10.
- **Memory migration from ClubSGame WSL** (`~/Code/github.com/MEYD-605/rdda-oracle`, `~/rdda-data`):
  - `~/.rdda/knowledge.md`: who-speaks rule, scope, the 4 muk-work skills condensed, games.
  - `~/.rdda/muk_company_profile.json`: 16 deals.
  - `memory.json`: 1 → 7 entries.
  - Knowledge and memory are injected into the system prompt.
  - Test: 4/4 correct.
  - Not migrated: the Note20 PIN, docs, game saves, old transcripts. Nothing deleted on ClubSGame.
- **Private ARRA store (new):**
  - Seat `rdda` on maclab `:8106` (`com.maclab.arra-client-rdda`, DB `~/srv/arra-memory-client/data/rdda/`, token in `~/.config/arra-client/rdda.env`).
  - Sync moved off the fleet `:8099`; LAN only; 8 memories synced.
  - The old fleet bearer is saved at `~/.rdda/arra-bearer.fleet-8099.bak`.
- **Vision and image tools:**
  - `look_at_image` uses `ag/gemini-3.8-flash-high`.
  - `generate_image` uses `ag/gemini-3.1-flash-image` (~15s).
  - Edit = vision describes the image, then the image model redraws it (~40s); the user is told it is a redraw.
  - Inbound images are saved to `/sdcard/rdda_inbound.jpg`; generated images are attached to the reply.
  - **TRAP:** 9router's image model silently drops image INPUT (it called a cat "durian"), and `/images/edits` returns 500. Recorded in skill `companion-mobile-agent-integration`.
- **Backups on the phone:** `*.bak-premigrate`, `*.bak-premedia-*`, `*.bak-pregemimg*`, `memory.json.bak-*`.
- **Battery soak** (`~/.rdda/battery_soak_log.csv`, every 5 min): unplugged at 16:20 at 100%; 92% at 20:05, about 2%/h; 30–36°C.

### HAOS audit (read-only, nothing changed)
- Updates: all installed (the app was showing stale data).
- Country unset, time zone UTC.
- Automatic backups never ran.
- 0 automations.
- 1 repair: `sensor.clubsgame_battery` state_class.
- 5 unavailable entities: light group, `notify.vivo`, Google TTS, 2 BRAVIA buttons.

### Sombo (88)
- Ran the whole day on fallback `ag/gemini-3.8-flash-high` after the `cc` 429s at ~16:16 and never went back.
- Bo approved switching back; I sent `/model opus-5.5[1m]` in tmux.
- Verified in the 9router log: `opus-5.5 → claude/claude-opus-5-5` from 22:29.

## Pending
- [ ] Rdda battery soak: summarize the full day tomorrow morning (`battery_soak_log.csv`) → report %/h to Bo
- [ ] Rdda Discord presence ideas (status dot by battery level + "what Rdda is doing"): Bo hasn't picked one. Wait until the soak test ends; restarting the bot breaks soak continuity
- [ ] HAOS fixes waiting for Bo's GO: country TH + Asia/Bangkok, daily backups (destination: NAS or Drive?), clubsgame_battery repair, 2 notification automations (fleet seat down, phone battery low)
- [ ] 1 Rdda entry (matcha) left in the fleet `:8099` corpus. Deleting it needs Bo's approval
- [ ] Proposal to Bo, not yet approved: write an agent-seat completeness checklist using No.4 as the reference (Discord, vision, image, private memory, progress log, route fallback, boot-load) plus a live smoke-test script with output inspection
- [ ] Sombo falls back without returning: Claude CLI `--fallback-model` is sticky for the session. Consider a watchdog that notices when the primary has recovered and sends `/model`
- [ ] vivo X Fold 3 `192.168.1.158:5555` offline

## Next Session
- [ ] Read `/sdcard/rdda_discord.log` plus the soak CSV on the Flip 5, and report battery %/h
- [ ] Check that Sombo is still on Opus (`tmux capture-pane -t 88-sombo`, 9router log `opus-5.5 →`)
- [ ] Ask Bo about the HAOS GO plus the backup destination

## Key Files
- Phone: `/data/data/com.termux/files/home/{rdda_agent.py,rdda_discord_bot.py,.rdda/}`
- Local copies: `/Users/admin/.hermes-no4/cache/scratch/{rdda_agent_patched.py,rdda_bot.py,rdda_export/}`
- ARRA seat: `~/Library/LaunchAgents/com.maclab.arra-client-rdda.plist`, `~/.config/arra-client/rdda.env`
- 8T: `/home/clubslinux8t/gmatom/CLAUDE.md`, `~/.claude-gmatom/settings.json`
- Skill: `mobile-devops/companion-mobile-agent-integration`
