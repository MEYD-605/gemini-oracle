# Handoff: Bo's Discord account banned · Mattermost→real No.4 bridge live · 21.10.69 delivered

**Date**: 2026-10-23 08:29 · **Context**: 45% (over 40% threshold) · cost $67
📡 Session: e7bfd248 | sombo-oracle

## ⚡ FIRST THING
- **Bo's Discord USER account is banned/locked** since **01:47:39** (Discord app log `~/Library/Application Support/discord/logs/renderer_js.log` line ~75747: 4003 → INVALID_SESSION → 4004 → /login; 07:12:53 re-login → `/account-standing`). Reason still unknown. Asked Bo to screenshot Account Standing (Settings → Privacy & Safety).
- **Do NOT reply on Discord.** Bo is in the **terminal**. All 10 seat bot tokens return 200 (07:49), so the bots are fine and the ban is on Bo's account.
- **My Discord progress hook is OFF**: removed 23 entries from `~/.claude-sombo/settings.json`. Backup is `settings.json.bak.20261023-discordban`; to restore, copy it back.
- Fleet told to hold Discord (MQTT to No.1 + No.4). No.4 confirmed it is holding.
- **Ban window check:** nothing in the fleet touched Discord 01:30–01:50. Seat Claude turns ended ~00:48. Hermes only ran silent cron. Every script I searched uses `Bot …` tokens; I found no self-bot. Not checked: ClubSGame (ssh timed out), Bo's phone.

## Mattermost → real seat (pilot = No.4 only, Bo "ทดสอบแค่ no.4")
- `~/srv/mattermost/bridge/mm_seat_bridge.py <seat> <tokenfile>`: MM DM to the bot → `oracle/<seat>/mm-<channel_id>/in`; seat reply on `…/out` → posted back to MM.
- launchd `com.maclab.mm-bridge-no4`; log `~/srv/mattermost/bridge/no4.log`; token `bridge/.mimo-token` (600).
- `hermes-mattermost-daemon.py`: ONLY the mimo listener is commented out. Backup `.bak.20261023-mmbridge`. Hermes, gmgolf and the FB relay are untouched.
- e2e proven 08:16 ("MM bridge OK"). Bo has not tried it yet himself.
- Revert: `launchctl unload ~/Library/LaunchAgents/com.maclab.mm-bridge-no4.plist`, restore the .bak, `launchctl kickstart -k gui/$(id -u)/com.maclab.mattermost-daemon`.
- Proposal to No.1: roll it out to the other seats + make the progress hook post to MM, with ONE primary channel only (no double posting). No.1 has not answered.

## 21.10.69 Graduation Party: DONE
- `~/Downloads/21.10.69_Graduation_Party/{2048,Full}`: 320 photos each, same Club S-N numbering in both (verified image-by-image).
- Last edits: S-28 −0.86, S-105 dropped, Bo's "139" = frame 173 → exp 0.8 (now S-138). Map: `~/Downloads/.old_21.10.69.noindex/delivery_map_final.csv`.
- Root causes this job:
  - (1) camera profile /tmp was wiped. It is now in the repo: `scripts/lightcraft/profiles/hue2`.
  - (2) I never eyeballed the photos. `contact_sheet.py` is the fix.
  - (3) per-frame face evening flipped between people. `ev_burst.py` (one exposure per ≤15 s burst) is the fix.
- Old versions (21G) are in `~/Downloads/.old_21.10.69.noindex` (Spotlight skips them). Bo may want them deleted; ask first.
- Heat 00:42: Spotlight indexing 31G + my stale 11 h `until ssh dd` loop (killed).

## Pending
- [ ] Bo: Account Standing screenshot → wait or appeal (dis.gd/appeals)
- [ ] No.1: answer on the MM bridge rollout + progress→MM
- [ ] Bo: rotate No.8's Discord bot token (commit 448f12a0 scratch/ is on origin/sweep/maclab-held-main, repo private). PR #11 stays held (2-of-3 + Bo).
- [ ] Bo ordered a **photo viewer program** for editing (bursts, neighbours side by side, before/after). Build it before the next photo job.
- [ ] Post-job improvement write-up for Bo: exposure by burst from the start, eyeball every sheet, profile path check
- [ ] Clipping still left: frames 173 (~0.16% after 0.8), 325 1.0%, 13 0.55%
- [ ] Drift ❌: No.1/4/6 model mismatch (Bo), stale focus No.6/8, git-sweep backlogs; sombo main 59 ahead of origin
- [ ] Older: Kali on 8T · RO Fold3 (No.5: wine works, explorer hangs at winex11) · 10-29 ADR-016 tally

## Key Files
- `scripts/lightcraft/{contact_sheet.py,ev_burst.py,ev_even.py,ev_fix.py,deliver2.py,ev_deliver3.py,profiles/hue2/}`
- `~/srv/mattermost/bridge/mm_seat_bridge.py`
- memory: `look-at-every-photo-before-send.md`, `preset-as-is-then-small-nudge.md`, `lightcraft-render-parallelism-2.md` (noindex note)
