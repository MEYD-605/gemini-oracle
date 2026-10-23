# Handoff: MacLab heat + background-bug sweep

**Date**: 2026-10-16 10:08
**Context**: 42% (opus-5.5[1m])
📡 Session: 879febdb | sombo-oracle

## What We Did
- Bo 06:40 "เมื่อคืนระบบเป็นอะไรค้าง": every tmux session (7 seats + meyd-core) was gone between ~03:50 and 06:38; at 06:38 the seats were recreated, but MEYD was not. maclab did not reboot (uptime 25d). **Root cause NOT found.** Bo told me to stop digging (07:0x). The heat timeline shows no hot minute overnight, so heat did not cause it.
- Model: confirmed I'm on `opus-5.5[1m]` (live, pin, settings, desired-state). Fixed 2 stale lines in CLAUDE.md that still said gemini-4-argon-high (**uncommitted**).
- Heat fixes (all logged in ψ/activity.log):
  1. `com.maclab.arra-cf` respawned 336/hr (KeepAlive=1, ensure-server exits 0) → KeepAlive `{SuccessfulExit:false}`; backup `~/.maw/com.maclab.arra-cf.plist.bak.20261016-082439`
  2. `lightcraft-base-develop` 325/hr: lock file inside its own WatchPaths dir. No.1 moved it (mimo-oracle 69228de, D-044).
  3. syspolicyd at 20–87% CPU = ~270 rejected `node-26.8.1` execs every 30s from pm2 SysMetrics (netstat × 36 interfaces). No.8's empty pm2 (`~/.no8-home/.pm2`, 0 apps, since 09-23) → `pm2 kill`. Main pm2 → `pm2 set pm2:sysmonit false` + `pm2 update` (7 apps online). syspolicyd is now at 0%.
  4. Killed 125 orphan `zsh -c while true; do sleep 30/60` loops (ppid 1, 10-12..10-14). List: `~/.maw/orphan-sleep-loops-killed-*.txt`.
- Heat timeline (runcat log is 1 line/min, so I timestamped back from its mtime): every ≥80°C peak in the last 48h was MY photo work. 10-15 12:21–12:40 MediaPipe/ONNX over 498 frames (load 61, 85°C); 18:06–19:18 Terminal 21 renders at 6 workers (load 66, 85°C). Bo was right ("ไล่ดูว่าความร้อนขึ้นตอนไหน"). Updated memory lightcraft-render-parallelism-2.
- MEYD Core: it was not killed by my cleanup (0 meyd in the kill list). It vanished with the tmux die-off. No.1 restarted it 09:12 in tmux `meyd-core` and disabled 00/04 in meyd.yaml. No.1 also stopped the duplicate No.5 claude (pid 9348).
- My mistake: I told Bo that No.4's io-load-guard + orphan-search-reaper were dead, based on a single 08-18 cron-log line. Both are alive (their heartbeats update every 2/15 min). I corrected it and saved memory check-log-timestamps-before-calling-broken.
- Grok VM wake scripts (keepalive.sh + lifeline.py) are light and working; one wake miss today at 08:57, recovered 08:59.

## Pending
- [ ] Bo has not answered: put MEYD under launchd and add a meyd-core check to drift-check (proposal sent 09:25).
- [ ] Bo has not answered: restart the Mac? I advised not yet. boot-recovery.sh only restores pm2, not seats/MEYD/HAOS/OrbStack. If Bo wants a reboot, expand boot-recovery first.
- [ ] Bo has not answered: close O+Connect on maclab (2 renderers at ~5% each).
- [ ] Root cause of the 03:50 tmux die-off (parked by Bo)
- [ ] Commit CLAUDE.md model-line fix
- [ ] Photo backlog: Terminal 21 per-photo colour fixes · #13 Upright · Bo-Auto v2 crop
- [ ] Something still calls `ag/gemini-3.7-flash-high` → 9router 404 every 2 min (seat or script not yet identified)

## Next Session
- [ ] Wait for Bo's choice on MEYD launchd / reboot / O+Connect, then do it with No.1 (2-of-3 rule)
- [ ] Any heavy photo or analysis batch: max 2 workers, and pause while 1-min load is above 8

## Key Files
- ψ/activity.log (08:24 + 09:10 fix entries)
- ~/Library/LaunchAgents/com.maclab.arra-cf.plist
- ~/.pm2/module_conf.json (sysmonit false)
- /tmp/runcat-machine.log (1 line/min temp+load)
- memory: lightcraft-render-parallelism-2.md, check-log-timestamps-before-calling-broken.md
