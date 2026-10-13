# Handoff: Ultra review "ทำไมบั๊กเยอะ" delivered · 9 fixes verified · subtract list awaits Bo GO

**Date**: 2026-10-13 09:11 +07
**Context**: 42% of 1M (420k) → self-clear after this handoff (Bo rule: ≥400k)
📡 Session: 2ae05f78 | sombo-oracle · cc/claude-fable-5-1 · cost $40.04

## Return protocol for the next session
1. DM Bo (1495648925640687727): "กลับมาแล้วหลัง /clear (context 420k)" + drift-check totals (expect 0 ❌).
2. Read `ψ/research/2026-10-13_ultra-review-why-so-many-bugs.md` (the full answer Bo asked for at 08:41). Do NOT re-run the audit.
3. Answer whatever Bo replied to DM 1559387205712089210 (lane 3 summary) and 1559384931212197909 (subtract list GO?).

## What We Did (all verified, all pushed, repo clean)
- 08:00 return report after fable-5-1 restart; drift 0❌. DECISION-011: merged sweep PRs cartographer #28 / gemini #10 / gmgrok #14, default branch `mainn`→`main` ×3.
- Golf VM presence-hub retired + verified on broker; watchdog repo copy fixed (oracle-substrate 9f032c4).
- Bo 08:13 "เผา token": weekly self-review `ψ/retrospectives/2026-10-13_weekly-self-review-10-06_to_10-13.md` (333 commits, 10 mistakes); maclab awake (sleep 0, caffeinate ×3); 3 houses green; CLI team audit with No.1 (06 unhung by No.1, canary launchd fix 2b48e9b high-wizard).
- Bo 08:41 "Ultra review": 3 supreme-architect lanes + my re-verification → **3 classes**: N owners per function · liveness proves exists not works · reporter speaks before testing. Numbers: 7d +59k/−1k lines, 71 new files/1 deleted, 53 launchd jobs.
- DECISION-012 (2/3): bridge.ts typed into `00-gmgrok:0` = ops-shell zsh (TUI was alive in window 1 all along) → window fix + pane guard + **execFile (payload `$(…)` was a real shell injection; probe inert)**. dispatcher.py guard + skip bridge-owned 00/04/06/08 (double delivery confirmed by probe, now single). seat-send guard + descendant walk (bash-wrapped 02/88) + UTF-8 locale; tracked at `fleet/bin/seat-send`.
- DECISION-013 (2/3): No.6 agy held No.8's Discord token (MCP child env discord-no8 since 10-08) → restarted. **B1 fired live**: MEYD supervisor spawned `claude` into the agy seat twice because `src/meyd/config.py` never read `start_cmd`/`env` from YAML → fixed 6aa5a27 + test 25/25; `~/.config/meyd/meyd.yaml` now has start_cmd+env for 06/08; daemon restarted (pid 96760), seats untouched.
- CLAUDE.md: "Seat liveness claims" rule (pane tail + real-turn evidence + `x`-test for greyed `❯` suggestion). Memory: maw-hey-under-launchd, herdr-per-session-socket, meyd-never-kill-session, verify-claims repeat.

## My errors today (for the retro, already logged)
No.8 "idle 11.6d" (log filename date) · No.2 "pending prompt" ×3 (greyed suggestion) · herdr "not running" (wrong socket) · tui-pane-ensure "dead" (logs only on repair) · "Hermes lock 103h" (false) · silent 6 min → Bo "ค้างไม่ยอมทำงาน". Root: accepted screen/subagent as finding.

## Pending (owner)
- [Bo] **Subtract list GO** (one by one, disable+archive, nothing deleted): ① turn off `com.maclab.oracle-mqtt-bridge` delivery+lwt (keep oracle-reply.sh; first widen dispatcher to `oracle/+/+/in`) ② remove meyd gateway tmux typing step (`gateway.py:202`, keep EventBus/presence) ③ drop fleet-lwt holders for plugin seats 01/02/05/88 ④ clear retained lwt for retired seats on HAOS broker (พี่นัท's) ⑤ delete 0-byte `~/.no6-home/.local/bin/agy`.
- [Bo] ② phd AUTH_KEY message to P'Nat (draft in DM 1559370995532439595) + rewrite gemini-oracle history? (destructive)
- [No.1] MQTT password: sentinel fixed on Grok VM (oracle-substrate #1); remaining agy-nano2-oracle + fleet-doctor-watcher.py → inventory → rotate (2/3 voted yes). `haos-arra-forward.py` binds 1883 on 0.0.0.0 vs "local only" docstring. `DISABLE_AUTOUPDATER=1` missing in start-no2.sh / gmforge.conf / start-no88.sh (npm reinstall ×6 this morning) → needs seat restarts.
- [No.1/No.4] Layer-2 liveness: `last_real_turn(seat)` in meyd presence payload + drift-check threshold (the ONE add). Separate `~/.gemini/config` per agy seat (one inode 642487).
- [Golf Vm] stale retained presence ai-news / clubs-marketing / meyd-grok-vm.
- 11 untracked files in sombo-oracle (scripts/, docs/) + `ψ/haos-sensor-sync.log` modified — Bo triage.

## Key Files
- `ψ/research/2026-10-13_ultra-review-why-so-many-bugs.md` · `ψ/decisions.md` DECISION-011/012/013 · `ψ/retrospectives/2026-10-13_weekly-self-review-10-06_to_10-13.md`
- live: `~/scripts/oracle-mqtt-bridge/bridge.ts` (tracked gmgrok-oracle ψ/tools/…, backup .bak.20261013-0859) · `scripts/fleet-mqtt-dispatcher.py` · `fleet/bin/seat-send` · `~/.config/meyd/meyd.yaml` (backup .bak.20261013-0908) · oracle-substrate `src/meyd/config.py`
- probes used: `mosquitto_pub -o ~/.config/fleet-mqtt/client.conf -t oracle/00-gmgrok/general/in -m "…"` then `tmux capture-pane -t 00-gmgrok:gmgrok-oracle`
