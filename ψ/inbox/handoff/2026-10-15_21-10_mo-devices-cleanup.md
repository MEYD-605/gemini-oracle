# Handoff: P'Mo Devices Audit & Full Deep Clean (iMac Sujit & MacBook Pro M1)

**Date**: 2026-10-15 21:10
**Context**: ~50%
**Oracle**: No.5 GM Forge (`[maclab:05-gmforge]`) | **Human**: Master Bo
**Host**: iMac Pro maclab (`100.83.0.1`)

## What We Did
- **iMac Sujit (Late 2015 27" 5K, 100.69.197.66)**:
  - Investigated and solved system instability and frozen apps: uninstalled O+ Connect completely, purged daemons (`com.oplus.dsp.core`, `com.oplus.dsp.rc`), fixed loginwindow state `T` app freeze (Chrome, Grok Bot, Discord, Canva, Windows App).
  - Deep cleaned +9 GB SSD space (427GB -> 436GB) by purging Chrome on-device Gemini Nano weights (`OptGuideOnDeviceModel` 4.07GB), web cache (3.5GB), old updater caches.
  - Disabled broken `com.user.mount-nas-tailscale` LaunchAgent looping dead pings every 5 minutes.
  - Re-audited Chrome: running smoothly playing YouTube, 0 crash logs, WindowServer uptime 1 day 22h without GPU crash/panic.
- **MacBook Pro 13" M1 2020 (clubsamacbook-mo / 100.82.0.2)**:
  - Purged legacy NAS automount (`com.local.nas-automount.plist` running continuous 15s osascript FTP loop) and scripts (`~/bin/nas-automount.sh`, `~/nas-download.sh`, `~/NAS_Photo_Hub`).
  - Purged crashlooping OpenClaw launchagents (`ai.openclaw.gateway`, `ai.openclaw.node`) and >800MB error logs.
  - Removed OpenClaw and O+ Connect from user Login Items.
  - Clarified OS reality: 100% native macOS on APFS (no Boot Camp / no Linux partition; "Windows App" is Microsoft Remote Desktop; Parallels was a 1.5MB empty skeleton from 2021).
  - Full second-wave deep purge: removed `Docker.raw` Linux VM container (1.5GB), Whisky container (425MB), Downloads DMGs/apps (`Discord.app` 476MB, `Discord.dmg` 202MB, `Antigravity.dmg` 161MB), Chrome on-device AI weights (4.07GB), Chrome web cache (3.69GB), updater caches (~1.7GB).
  - Preserved 100% of Agent tools: `claude`, `lightcraft-cli`, `nano-pdf`, `~/.oracle-skills`, `~/.claude/`.
  - Available SSD space surged from 15 GB -> 29 GB (+14 GB total freed, 45% capacity). Load average down from 2.74 -> 1.38. RAM 8GB with 0.00MB swap and 71% free memory pressure.

## Pending
- [ ] Monitor Tailscale and stability on both iMac Sujit and MacBook Pro M1
- [ ] If Bo needs to remote to ClubSGame from MacBook Pro, verify Windows App (Microsoft Remote Desktop) configuration
- [ ] Periodic drift audit of maclab LaunchAgents and Mosquitto broker

## Next Session
- [ ] Check fleet connectivity (`tailscale status`, `list_fleet`)
- [ ] Continue LightCraft photo processing recipes or system coordination with Sombo / Lord Knight / MIMO

## Key Files
- `imac-sujit-specs-and-setup.md`
- `macbook-mo-cleanup-and-specs.md`
- `MEMORY.md`
