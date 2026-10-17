# Handoff: MEYD seat_state · No.3 MQTT · maclab heat · herdr duplicates

**Date**: 2026-10-16 09:28 +07
**Context**: long session (10-14 14:10 → 10-16 09:28), No.1 on cc/claude-opus-5-5 (pin says opus-5.5[1m]; live on next restart)
📡 Session: 88852f34 | lord-knight-oracle

## What We Did
- **MQTT password**: Bo said no rotation, room is locked. Searched: 0 copies in broker retained / ψ / git. Closed.
- **HAOS 2 houses + D1**: `arra-edge-sync.ts` takes `ARRA_SITE` (maclab `mem-`, ClubSGame `gm-`) + skips `createdBy=edge-replay`. ClubSGame task re-enabled → its own HAOS 192.168.1.161. Both directions verified errors=0. Bo: ClubSGame HAOS is a trial; maclab is home.
- **No.4 poteto-harness**: reviewed; No.4 fixed key (own), allowlist, redaction, INCOMPLETE, WAL check (`c24153c`). Re-review passed.
- **D-042/D-043**: seats → 9router combos (primary unchanged + fallback). Sombo `opus-5.5[1m]` (Bo), No.2 `fleet-flash[1m]`, No.5 = **glm/glm-5.3 (Bo set it himself 10-16 07:03)**, No.1 `opus-5.5[1m]` pinned. New combo `fable-5.1`. `/model` via seat-send pops a "Switch model?" modal that needs Enter.
- **MEYD seat_state (T3 ideas)**: merged to oracle-substrate **main = e174e4c**, **OFF** in `~/.config/meyd/meyd.yaml`. Fixes found by live tests: Claude spinner minute format + footer window; resume never fired because the limit text stays on screen; alert_fn for waiting_for_user/blocked_billing ≥10 min. Branch **feat/seat-state-remote 34331b0** (not merged) = per-agent `capture_cmd`, off-host seats observe-only.
- **Shadow run** `~/.meyd-shadow/` (worktree src-wt @34331b0, shadow.py, ticks.jsonl) watching **12 seats** incl. ClubSGame no3 (via `C:\Users\noone\bin\no3-state.ps1`, transcript-based), gmlab/gmaicore/gmatom (WSL `/usr/bin/tmux`). 19 h, 0 errors, 0 false sends/alerts; no real rate-limit seen yet.
- **No.3 MQTT** dead 10-09..10-15: dispatcher task restarted; topics `+/in`; SYSTEM can't see user psmux → new `no3-inbox-deliver.ps1` in `run-no3-psmux.cmd` loop (idle from transcript). No.3 answered "no3inboundOK". drift-check: real PONG round trip (`e01d4e7`).
- **builder agent** (`~/.claude-no1/agents/builder.md`, `isolation: worktree`) — smoke test passed.
- **Heat (D-044)**: arra-cf KeepAlive loop + lightcraft lock-in-WatchPaths loop (`69228de`); Sombo: pm2 sysmonit off, 125 sleep loops. **MEYD was down since the 06:38 tmux-server restart** (not Sombo) → restarted in tmux `meyd-core`; 00-gmgrok/04-mimo `enabled:false` in meyd.yaml (Hermes, launchd). drift-check checks MEYD (`18b188e`).
- **herdr**: No.5 duplicates (Terminal pid 9348; herdr panes wE/wF) removed; `oracle-herdr-up.sh` now adopts an unnamed agent instead of spawning (`a254a8fd`). Fleet-wide: one instance per seat.
- seat-send manifests No.6/No.8 → `gemini-oracle` / `agy-nano2-oracle` (match spawn-no6-no8-sessions.sh).

## Pending
- [ ] Who restarted the tmux server at 06:38 10-16 (Terminal login ttys006 06:38 also started the 9348 No.5 dupe) — unknown
- [ ] MEYD has no watchdog of its own (drift-check only alarms). Put `meyd-core` under launchd or the fleet watchdog
- [ ] seat_state: merge feat/seat-state-remote after shadow review; then enable in meyd.yaml (dry_run first), one seat at a time
- [ ] seat_state coverage gaps: joker/golf (Hermes, no pane), No.10 (agy remote-control), Grok VM
- [ ] Route seat_state alert_fn to Discord (shadow only logs WOULD_ALERT)
- [ ] Leftover branch `worktree-agent-adee2c590978c0c35` in lord-knight-oracle (smoke test) — delete with -d
- [ ] Grok account (grok-cli) out of credit 402 — Bo's (money)
- [ ] tsf-keepalive / haos-ready 30 s → 60 s (cheap, optional)
- [ ] focus.md stale: No.2, No.6, No.8

## Next Session
- [ ] Read `~/.meyd-shadow/ticks.jsonl` (WOULD_SEND / WOULD_ALERT / state counts) → decide merge of feat/seat-state-remote
- [ ] Give MEYD a respawner (launchd plist with `meyd up`, not a bare tmux loop)
- [ ] Restart my own seat when idle so the `opus-5.5[1m]` combo goes live (clears drift-check ❌)

## Key Files
- oracle-substrate `src/meyd/core/seat_state.py`, `src/meyd/config.py` (main e174e4c; branch feat/seat-state-remote)
- `~/.config/meyd/meyd.yaml` (seat_state off; 00/04 enabled:false; backup .bak.20261016)
- `~/.meyd-shadow/shadow.py`, `ticks.jsonl`
- sombo-oracle `scripts/fleet-drift-check.py`, `fleet/desired-state.yaml`, `ψ/decisions.md` (D-040..D-044)
- `ψ/tools/oracle-herdr-up.sh`
- ClubSGame: `C:\Users\ClubSGame\bin\fleet-mqtt-inbound.ts`, `C:\Users\noone\bin\no3-inbox-deliver.ps1`, `no3-state.ps1`, `run-no3-psmux.cmd`, `bin\change-log.md`
- `/Users/admin/scripts/arra-edge-sync.ts` (+ ClubSGame copy)
