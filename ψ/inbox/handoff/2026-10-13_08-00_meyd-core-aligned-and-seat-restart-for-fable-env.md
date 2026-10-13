# Handoff: MEYD Core aligned on 3 hosts · seat restart for Fable env (Bo GO)

**Date**: 2026-10-13 08:00 +07
**Session**: 49b1d920 | sombo-oracle · cc/claude-fable-5-1
**Trigger**: Bo 07:53 "1ลุย" = GO to restart seat 88 so live env matches the fable-5-1 pin (last drift ❌). Watchdog `no88-loop.sh` respawns `start-no88.sh`, which re-reads the pin.

## Return protocol for the next session
1. DM Bo (1495648925640687727): "กลับมาแล้วหลัง restart" + run `scripts/fleet-drift-check.py` and paste the totals. Expect **0 ❌** now; if `model (live env)` still says opus-5.5, the launcher did not re-read the pin → check `start-no88.sh` lines 18-41.
2. Then answer whatever Bo replied to my 07:58 message (DM 1559368782303068161) about ② phd key and ③ sweep PRs.

## Done this session (all verified, all pushed)
- DECISION-009: 3 relays typed MQTT into plugin seats → dispatcher 348dbd5, bridge.ts (88-sombo removed), meyd gateway bae0397. No.1 PASS 02:14.
- herdr orphan 23331 stopped by No.8, verified.
- DECISION-010 MEYD Core ("magnum"): EventBus thread fix 2f3e26b, presence_beacon d510d06, Grok merge, WSL test flake 60c55ad/f705df5/4c27a36, FEEDBACK FB-005/020/022/026 resolved 3981e42. All 3 hosts on 3981e42: MacLab pid 27081 · ClubSGame WSL root pid 876409 · Grok VM pid 3225597 (cloud_sandbox, MQTT ✅ after python3-yaml install).
- WHEA ClubSGame 0 events since 01:05; one-shot cron at 08:37 re-checks and DMs Bo (session-only → **will be lost by this restart; re-run the check manually around 08:40**: ssh ClubSGame, Get-WinEvent WHEA-Logger since 2026-10-13 01:05).

## Bo's answers 07:53 and what they mean
- ① "ลุย" → restart seat 88 (this handoff).
- ② "กุญแจพี่นัทหรา" → confirmed yes: phd signaling AUTH_KEY (wss://phd-signaling.laris.workers.dev, from phd/dropbox/.env) posted by No.6 in P'Nat's #free-for-all 06-20, swept into **public** gemini-oracle 07-12; tip redacted 6a4c3d5a, history still has it; ETH private key for wallet 0x7aa11f…81cc in same set, owner unknown. Asked Bo: tell P'Nat himself or I draft the message.
- ③ "ทำไมอ่ะ PR มันทับกันหรือว่าไง" → told Bo: no conflicts, auto PRs from git-sweep (DECISION-008), ψ/ memory files only (handoff mirrors, drift state, fan log, kiosk presets). cartographer + gmgrok default branch is literally `mainn` (typo) since 10-09, so PRs target mainn. Offered: say "merge" and I merge all 3, fix mainn→main separately.

## Pending (owner)
- [Bo] reply on ② and ③
- [Golf Vm] retire Grok VM tmux `presence-hub` + 5 `*-presence` sessions now that meyd presence_beacon runs there (asked 07:52 via oracle-send)
- [gmlab owner] feat/clubslab-gmlab-bootstrap diverge 10 local / 55 remote, No.4 parked sweep/maclab-diverged-20261011
- [Bo] Google Drive link for 589-photo client delivery · [No.4] NAS backup when SSD attached
- FEEDBACK open: FB-011 Windows-native supervision · FB-023 Grok watchdog consolidation
- 11 untracked files in sombo-oracle (scripts/, docs/) for Bo to triage

## Key files
- ψ/decisions.md DECISION-009, DECISION-010 · ψ/goals/2026-10-13_pair-no1-complete-oracle-setup-sweep-problems.md
- oracle-substrate: src/meyd/core/{event_bus,daemon,gateway,supervisor}.py, docs/FEEDBACK.md
- memory: meyd-core-silent-failures-and-host-layout.md, mqtt-relays-must-skip-plugin-seats.md
