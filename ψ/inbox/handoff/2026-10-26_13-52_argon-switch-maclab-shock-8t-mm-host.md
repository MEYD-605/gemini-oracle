# Handoff: model → Argon Medium · maclab power/shock · 8T Mattermost host question · MM backup

**Date**: 2026-10-26 13:52
**Context**: forward requested by Bo (MM `/forward`) right before the model switch restart
📡 Session: f8d9b101 | cartographer-oracle

## Context
**Oracle**: No.5 GmForge | **Human**: Bo
**Bo's channel = Mattermost DM** → oracle-channel reply `chat_id=mm-3p6w7dhozjrnbyg3xjchhfr8ur` (Discord user banned since 10-23).
**Model**: this session ran `cc/claude-opus-5-5`. Bo 10-26 13:32 MM "agron medium" → yaml + pin now `ag/gemini-4-argon-medium`; **next start = Argon Medium**. Verified 9router answers it (`model: gemini-4-argon`).

## What We Did (10-22 → 10-26)
- **k3s explained to Bo**: OrbStack k8s = k3s built in (k8s.enable false); can't join 8T to OrbStack cluster. Nat never wrote k3s advice (searched arra-v4 + Soul-Brews repos); Nat's line = "homelab on HAOS". Fixed `cluster/README.md` (wrong "8T kernel can't do nat" → real cause tailscale `TS_DEBUG_FIREWALL_MODE=nftables`). **Uncommitted.**
- **Mattermost durability**: OrbStack `app.start_at_login` false→true. Daily backup `~/srv/mattermost/backup.sh` + launchd `com.maclab.mattermost-backup` 03:37 → local + ClubSGame `/mnt/e/Backups/maclab/mattermost` (WSL rsync, 132 tables verified). GDrive leg blocked by TCC under launchd (warns, continues). Recorded in sombo `fleet/desired-state.yaml` (orbstack_maclab, mattermost_maclab).
- **Oracle upstream**: all core repos behind 0; behind = maw-rs 120, oracle-app-kit 119, maw-herdr-plugin 5 (not used).
- **8T**: RO screen clips → `~/Desktop/8t-screen-20261023-{1028,1051}.mp4`. 10-23 13:47 reset during RO: ramoops clean, cause unknown. Powered off 10-25 01:13 (Bo), came back on later (gmatom online).
- **Bo vault rule**: 11 files ψ/media/personal copied by Sombo → bo-personal-vault c394571, 11/11 blob hashes verified. Rule now in CLAUDE.md (Sombo edit).
- Merged cartographer #42 (mcp.json untrack, gitleaks clean). focus.md rewritten.
- **maclab power**: SMC shutdown cause `0: Battery disconnected` ×2 + `-2` (10-24/10-25) = AC lost upstream, no panic. Bo felt case shocks all day 10-25, none 10-26. Explained Y-cap/missing earth; asked for plug tester. Built read-only SMC reader `~/srv/smcread/smcread` (`--all` lists V/I/P/D keys): 12 V rail 12.015-12.027 V, PSTR 105-157 W — DC side clean.
- Relayed Atom (atom9934) contact ask → Bo gave FB link → sent to gmatom only.

## Pending
- [ ] **Restart No.5 onto Argon Medium** — Bo choosing now vs next restart (this /forward is step 1)
- [ ] Bo pick for 8T Mattermost: (1) 8T standalone podman (2) 8T app-only + DB on maclab [recommended] (3) k3s 2-node via maclab VM. Blockers: no arm64 docker image (build from `mattermost-team-12.0.1-linux-arm64.tar.gz`), 8T tailscaled back to nftables mode
- [ ] Bo answer: did he force-reboot 8T on 10-23? (decides wine/GPU vs hardware path)
- [ ] Bo: plug tester result for maclab earth; offer to log SMC values every minute — no answer
- [ ] Bo GO: Mattermost watchdog + cold-standby on ClubSGame; GDrive leg (Full Disk Access /bin/bash or rclone login)
- [ ] Bo approve: git rm ψ/media/personal + symlink/.gitignore (vault copy verified)
- [ ] No.1 asked No.5 consent for gmforge Notion-token fix (MQTT 10-25 00:31) — never answered
- [ ] Commit: `cluster/README.md`, sombo desired-state edits (Sombo's repo)

## Next Session
- [ ] Confirm statusline shows Argon Medium after restart; tell Bo on MM
- [ ] Act on whichever of Bo's pending picks arrived (8T MM option first)
- [ ] Answer No.1 Notion-token consent

## Key Files
- `~/srv/mattermost/backup.sh`, `~/Library/LaunchAgents/com.maclab.mattermost-backup.plist`
- `~/srv/smcread/smcread.c`
- `cluster/README.md`
- `sombo-oracle/fleet/desired-state.yaml` (No.5 model, orbstack_maclab, mattermost_maclab)
- 8T ramoops copy was /tmp/8t-ramoops-1348.txt — gone (maclab rebooted 10-24/25); original lives on 8T /var/lib/systemd/pstore
