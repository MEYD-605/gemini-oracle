# Handoff: Hermes presence + HA online lights · 3 questions waiting on Bo

**Date**: 2026-10-21 12:58 +07
**Context**: long session (10-14 → 10-21), No.1 on claude-opus-5-5 via /model; launch env still `ag/gemini-4-argon-high` (10-14 05:17), so a restart fixes the env and reconnects codebase-memory-mcp (disconnected since 10-18)
📡 Session: 88852f34 | lord-knight-oracle

## Waiting on Bo (asked on Discord, no answer yet — do NOT act without it)
1. **No.4/No.00 facebook-mcp + seo-audit** fail to start ~515×/day: they run on `~/.hermes-gmgrok/venv` where `mcp` 2.0 dropped `mcp.server.fastmcp`. Fix = separate venv pinned to mcp 1.x (also needs `bs4` for seo-audit), then restart both gateways. Bo asked "fix now or when No.4 is idle?" (msg 1562313387956772875).
2. **Registry cleanup**: ~12 dead names on the board (99-bridgetest, 00-gmgrok-x, 04-mimo-x from my 10-21 test; 07-groky, 09-no9, 116-gmaicore, 65-gmgrok, ai-news, clubs-marketing, b3-probe, test-*, 99-seatstate-test). Deleting = clear retained `lwt`/`meta`/`status` (`-r -n`) — needs Bo GO.
3. **HA front-page card** (all seats' online + doing-now) and **phone alert** when a seat is down >5 min — asked if I may just do them.
Also: ClubSGame Windows reinstall (back up C: first; E:\Agents survives). Bo to give a date.

## Done 10-21 (all committed, live)
- `ψ/tools/maclab-hermes-inbound.ts`: real presence for 04-mimo/00-gmgrok from the launchd gateway PID, re-asserted every 30 s (4e3eb1a0, fae9cb97); soft cap 420 s posts "still working…", hard cap 900 s (aadd9bdb). No.4 audited the log with me: RECV 76/SENT 76, 12 lost answers were all the old 180 s cap.
- HA: `binary_sensor.oracle_no_N_online` per seat via MQTT discovery, 8/8 on (3ab39711, `ψ/tools/ha-seat-online-discovery.py`). Bo's path: Settings → Devices → "Oracle No.N".
- Relayed No.4 → No.5: "8T: idle" (r50 flash ok from No.4's side; Bo's 10-20 "หยุดเลย" for the 8T is No.5's to confirm).

## Open (mine)
- [ ] **Stray `00-gmgrok`/`04-mimo` tmux sessions** keep appearing (fleet-lwt.log: 92 holder starts) → fleet-lwt holder fires `offline` over a live Hermes gateway. My bridge now overrides within 30 s, but find who creates them (not MEYD: both `enabled:false`; candidate `~/scripts/oracle-mqtt-bridge/bridge.ts` targets pane `00-gmgrok:gmgrok-oracle`).
- [ ] Safety-hook fix (rm -fr / push variants / sh -c re-scan) — Sombo drafts, I vote with a before/after probe table. Not started (10-20 "tomorrow" slipped).
- [ ] haos-sensor-sync `--fast` split (TV every 2 min hits grokbot + memory-group sync).
- [ ] fleet-model-live.py reads launch env; switch to the transcript's last model (it miscounted Sombo/No.5/No.1 on 10-20).
- [ ] Restart myself (env + codebase-memory).

## Rules learned this stretch
- Bo's model switches are his experiments — report a mismatch, never restart to "fix" it.
- Sombo = สมโบ in Thai (drift-check enforces it fleet-wide).
- Tell a seat before any change to it (Bo 10-18); D-045 one model source = desired-state.yaml.
