# Handoff: CLI-team audit · subtract list ② · MQTT password inventory started

**Date**: 2026-10-13 11:11
📡 Session: 9174e903 → 9668ee19 | lord-knight-oracle | 08:04 → 11:11

## What We Did
- **06-gemini hang**: stuck 10h22m on `rtk maw-discord-reply --help` (waiting stdin) → killed 50304/50305, pane ready.
- **git-sweep non-ff**: sombo #15 rejected because #14 was squash-merged (ancestry lies). Closed #15 (`git cherry` 17×'-'). Fix: reset sweep branch only when `git cherry @{u} <old tip>` has no `+` → mimo #14 b24f125 (live in working tree, cron 09:30+).
- **MQTT password in Grok VM sentinel** (Sombo finding): now reads `~/.config/fleet-mqtt/client.conf` (600) via paho → oracle-substrate #1 0e3af41. Deployed `/home/box/keepalive/agent-sentinel-watch.py` (.bak.20261013), restarted tmux `agent-sentinel`, fresh retained msg verified.
- **Votes/acks (2/3)**: DECISION-011, 012, 013 (No.6 held No.8 Discord token → restarted 09:01, verified discord-no6 / no8 split), 014, 017–020.
- **DECISION-014**: restarted No.2 (pid 49834) + No.5 (pid 52023) → `DISABLE_AUTOUPDATER=1` live, models = pins unchanged. My mistake: `herdr pane run` didn't register agent name → 300s job spawned no5 dupes; Sombo fixed (D-020, `herdr agent rename`).
- **Subtract ② (DECISION-016)**: meyd gateway `tmux_dispatch=False` default (code kept) → oracle-substrate #2 9ccbcfa, 26/26 tests. maclab meyd pid 32156; Grok VM clone ff'd 9f032c4→9ccbcfa **via git bundle** (VM has no GH creds) + meyd-core restarted. Probes: 00-gmgrok ops-shell untouched; golf-vm got the probe exactly once (VM's own grok-mqtt-dispatcher.py delivers; before = duplicate typers).
- Sombo audit for Bo: 8 decisions with evidence, bridge ① retired (plist `.retired-2026-10-13-subtract1`), probe to No.4 delivered once. Drift 149 ✅ ❌0.
- Corrected myself to Bo: No.2's "unsent prompt" was greyed suggestion text (SGR 2 dim).

## Pending
- [ ] **MQTT password rotation** (2/3 YES, waits on inventory). maclab live consumers holding the literal value:
  `~/scripts/fleet-doctor-watcher.py` · `~/.local/bin/fleet-task-dispatch` · `~/ClubS-Workspace/tools/discord-reply-rust/src/no10_relay.rs` (+ .bak) · `~/.config/meyd/meyd.secrets.yaml` · `~/.claude/channels/oracle/.env` · `~/.config/fleet-mqtt/client.conf` (the two last are the canonical stores). file-history copies in .claude-no1/no5/sombo = stale snapshots, ignore. Committed: oracle-substrate (history), agy-nano2-oracle (1 file). Not yet swept: all-repos `git grep` (Bo rejected the long sweep mid-run), ClubSGame, Grok VM (`~/.claude/channels/oracle/.env` used by grok-mqtt-dispatcher), HAOS mosquitto passwd.
- [ ] grok-mqtt-dispatcher.py has no pane guard (same class as DECISION-012) — discuss with Sombo.
- [ ] No.5 has no respawn loop (no5-loop.sh not running) — adding one is an ADD, discuss first.
- [ ] `haos-arra-forward.py` binds 1883 on 0.0.0.0 vs "local only" docstring.
- [ ] Separate `~/.gemini/config` per agy seat (no6/no8 share one inode).
- [ ] phd AUTH_KEY → Bo/P'Nat message; maw-ssh rtc.ts TURN cred; gmlab diverged branch (carried).

## Next Session
- [ ] Move each live consumer above to read client.conf / .env (no literal), verify each still connects, THEN rotate on HAOS broker + update the 2 canonical stores + Grok VM + ClubSGame; probe every seat after.
- [ ] Read `~/.maw/logs/git-sweep.cron.log` from the 12:30 run: expect no non-ff on sweep/maclab-held-* and 0 "could not read Username".

## Key Files
- oracle-substrate: src/meyd/core/gateway.py · watchdog/agent-sentinel-watch.py
- mimo-oracle/ψ/tools/git-sweep-maclab.sh
- sombo-oracle/ψ/decisions.md (DECISION-011…020)
- /tmp/mqtt-inv.txt (inventory, will vanish on reboot — list copied above)
- memory: reference_cc_prompt_suggestion_not_input.md · reference_herdr_pane_run_skips_agent_name.md
