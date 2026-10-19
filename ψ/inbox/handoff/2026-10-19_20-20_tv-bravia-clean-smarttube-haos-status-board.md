# Handoff: Sony TV clean-up, SmartTube, TV in HAOS, Club S status board · No.5 unstuck

**Date**: 2026-10-19 20:20
**Context**: 42% (opus-5.5[1m])
📡 Session: 03530ff4 | sombo-oracle (started after /clear 11:34)

## Bo's rules this session
- White safety hook: "ทำคร่าวๆไว้ก่อนพรุ่งนี้ค่อยลุยเต็มตัว" (11:39). Full push tomorrow.
- TV: "มึงคุมงานได้เลย". Bo only watches YouTube and Netflix. Put in good features and clean out old stuff.
- TV status board: show only OUR machines, no PM2.5 (12:25).
- HA token on TV: Bo chose **token** over a read-only proxy (12:37).

## What We Did (verified)
- **Return report**: drift-check 213 checks, ❌6 (all model drift + No.2 focus stale). Seat models are Bo's call, so I didn't touch them.
- **White hook (PimQuin)**: re-ran my probes.
  - Passing: tests.sh 68/68, probe 35/35.
  - New holes, sent to B3/PimQuin: `sh -c '...'` and `eval '...'`.
  - Told Bo **not to GO yet**.
  - Told No.1 to add `git push origin main;` + sh -c/eval to the maclab safety-check vote.
- **No.5 stuck**:
  - Cause: a /goal waiting on Bo kept the stop hook looping 20 turns, which burned the GLM 5h quota (code 1308, 429 from 14:10, reset 16:45). /forward then sat queued behind the retry plus a dead subagent.
  - I ran `goal.py block` (cartographer-oracle).
  - Bo ordered Sonnet 5.5, so: `/model cc/claude-sonnet-5-5[1m]`, desired-state commit `5d8f828`.
  - /forward → /clear done. No.5 is back at 13%.
- **MacLab compile check**: Xeon W-2140B 16T / 80GB.
  - No thermal events and no panic in 28 days.
  - Wine x86 built in ~14 min in OrbStack VM.
  - `load-watch.sh` only ever logged 10-03.
- **Sony BRAVIA KD-55X7500F** (192.168.1.104, Android 9, 2GB, armeabi-v7a). Backups in /tmp/no6_bravia/ (No.6 did the read-only survey).
  - Root cause of YouTube slowness: RAM (212MB free, 52 kills/9h), not CPU or network.
  - Disabled 41 bloat/unused apps + official YouTube. Trimmed ~700MB cache, rebooted. Free RAM now 430–680MB.
  - cleanyourtv launcher built (JDK 17 at `~/.local/jdk`, SDK 34 added).
    - Repo `~/Code/github.com/Gathin23/cleanyourtv` branch `bo-bravia` (44b31e9, b2b702c), not pushed.
    - Theme `club-s`. Dock: SmartTube / Netflix / Prime / F-Droid.
    - Trap: a reboot right after `pm disable-user tvlauncher` brought the stock launcher back. Wait ~30s before rebooting.
  - SmartTube 32.56 + F-Droid 2.0.2 installed from F-Droid. sha256 + signer certificate verified against the signed index-v2 (entry.jar).
  - HAOS: `braviatv` integration paired with PIN 3551 (read off a TV screenshot).
    - Entities: media_player/remote.bravia_kd_55x7500f, button restart/terminate_apps.
    - ⚠️ HA `volume_mute(false)` does NOT unmute this TV. I muted the TV ~1–2 min by accident; fixed with KEYCODE_VOLUME_MUTE, now vol 25.
  - **Club S Status app** (`~/Code/github.com/MEYD-605/clubs-tv-status`, c203736, not pushed, 67KB, ~20MB RAM).
    - Board view + StatusActivity + StatusDream (screensaver, set active). Card approved on the launcher.
    - Rows: MacLab / ClubSGame / OnePlus 8T / white / fleet+tv. Orange on threshold. Generated studio background.
    - Reads HA at **192.168.1.180:8123**: MacLab's LAN IP changed from .160 to .180 (Arra fact saved).
    - Token: dedicated LLAT `clubs-tv-bravia (Sombo 2026-10-19)`, copy at ~/.haos/ha_llat_tv_bravia. Lives in the app's ha.json on the TV, not in the APK.
- **haos-sensor-sync.py** (1b5fc9b): added MacLab cpu temp (osx-cpu-temp), ClubSGame cpu load + battery (ssh), and 8T cpu/batt/load/ram (ssh 8t-wifi). Those ClubSGame values had been stale since 10-18.
  - Gitleaks false positive: restructured the code, did not bypass.
- **D-048** (0971c1b): LaunchAgent `com.maclab.sombo-haos-sensor-sync` runs every 120s (Bo GO 20:11). `crontab -` hung (TCC), so the crontab is untouched; backup at ψ/lab/crontab.bak.20261019-201130. PATH was added for mosquitto_sub.
  - Cost: 0.4s CPU per run. TV app uses 6% CPU.
- Arra milestones: RO-on-8T, TV clean-up, MacLab IP .180.

## Pending
- [ ] **Bo: which seat goes to "Gemini 3.8"?** (20:19 "เดี๋ยวเปลี่ยนโมเดลกลับเป็น Gemini 3.8"). I asked Sombo / No.5 / No.8; no answer yet. When he answers: switch + desired-state.yaml in the same turn.
- [ ] White hook: PimQuin to close the `sh -c` / `eval` holes. Then re-run /tmp/white-review/probe*.py and the new-claims probe. Then advise Bo GO (tomorrow, full push).
- [ ] No.1: vote on the maclab safety-check.sh regex widening (rm flag spellings, refspec main/+main, `main;`, sh -c/eval). Write patch + test tomorrow.
- [ ] Router DHCP reservation for MacLab (.180). Needs Bo's router admin. Otherwise the TV board breaks if the lease changes.
- [ ] SmartTube login: Bo does yt.be/activate himself (optional).
- [ ] Old pending from 10-18/19: Gemini seats reset at ~30%? · a/b/c drift/HAOS board items · white backup destination · No.1 live-model drift · /goal after compact.
- [ ] No.1 hasn't replied to the 19:50 cron vote or the D-048 FYI. Check oracle-channel.
- [ ] Optional TV extras offered: animation 0.5x, Thai locale, Private DNS (tracker blocking). Bo hasn't picked.

## Next Session
- [ ] Ask Bo which seat → Gemini 3.8 if still unanswered; do it with yaml + verification.
- [ ] Check B3/PimQuin replies; re-probe the white hook.
- [ ] Glance at the TV board (adb screencap 192.168.1.104:5555) to confirm it is still updating.

## Key Files
- ψ/lab/tv-bravia-clean/ (restore_sombo_20261019.sh — full undo for everything on the TV)
- ~/Code/github.com/MEYD-605/clubs-tv-status (app) · ~/Code/github.com/Gathin23/cleanyourtv (launcher, branch bo-bravia)
- scripts/haos-sensor-sync.py · ~/Library/LaunchAgents/com.maclab.sombo-haos-sensor-sync.plist · ψ/decisions.md D-048
- ~/.local/share/clubs-tv/ha_ws.py (stdlib HA websocket client, used to mint the TV token)
