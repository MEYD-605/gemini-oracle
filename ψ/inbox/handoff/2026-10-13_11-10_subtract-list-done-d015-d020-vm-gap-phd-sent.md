# Handoff: Subtract list ①–⑥ done (D-014..D-020) · phd notice sent to P'Nat · gmbm/gmguinness VM gap awaits Bo

**Date**: 2026-10-13 11:10 +07
**Context**: 29% of 1M (293k) · cost $13.40 this session · /forward from Bo on Discord → self-clear
📡 Session: 7d6f36b3 | sombo-oracle · cc/claude-fable-5-1

## Return protocol for the next session
1. DM Bo (1495648925640687727) first line `✅ พร้อมทำงาน · รับ handoff <this file>` + drift-check totals (expect 149 ✅ 0 ❌) + dev status block (model/effort/ctx/cost/CLI/MCP/9router/repo).
2. Do NOT redo the subtract list. Read `ψ/decisions.md` D-014..D-020 if detail needed.
3. Answer whatever Bo replied to DM 1559403630719795240 (gmbm/gmguinness Discord-only?) and 1559402869965332482 (①–⑥ report).

## What We Did (all verified, all pushed, repo main = 8010f56)
- 09:23 back after /clear; return report; Bo asked "ทีม Claude CLI maclab สมบูรณ์?" → all 4 Claude seats live; No.2/No.5 lacked DISABLE_AUTOUPDATER → start-no2.sh dde8d57, No.1 restarted both (D-014).
- 09:54 Bo "phd ก็ส่งแจ้งเขาเลย" → sent P'Nat in school room (1500775333283237970, msg 1559399238687785012): rotate phd signaling AUTH_KEY, wallet 0x7aa11f…81cc, offer gemini-oracle history rewrite (needs Bo GO, force-push).
- 09:56 Bo GO subtract list → **all six done**:
  ① bridge.ts retired: dispatcher subscribes `oracle/+/+/in` + parses JSON (6af8cdb); plist → `.retired-2026-10-13-subtract1` (copy in ~/scripts/oracle-mqtt-bridge/). Probe 00-gmgrok typed once. D-015.
  ② meyd gateway `tmux_dispatch=False` (No.1, oracle-substrate 9ccbcfa, maclab pid 32156 + Grok VM). Probes 04-mimo and gmatom typed once. D-016.
  ③ `~/.maw/fleet-lwt-supervisor.sh` skips + TERMs holders for plugin seats (01/02/05/88); holders stay for 00/04/06/08. Backup `.bak.20261013-1025`. D-018.
  ④ retained lwt/status/meta cleared for 07-groky 116-gmaicore 65-gmgrok 09-no9 ai-news clubs-marketing meyd-grok-vm; archived first `ψ/archive/mqtt-retained/2026-10-13_subtract4_cleared.txt` (d4831b9). D-019.
  ⑤ `~/.no6-home/.local/bin/agy` (0 B) → `bin.archive-2026-10-13/agy.0byte`. D-017.
  ⑥ herdr-gmforge race ROOT CAUSE: `herdr pane run start-no5.sh` never registers agent `no5` → ensure job respawned No.5 every 300 s (3× today). Fix `herdr --session gmforge agent rename wA:p1 no5`; killed dupes 66274/55242; gmforge.conf +DISABLE_AUTOUPDATER (lord-knight 9c2829fc). D-020. Memory `no5-restart-unload-herdr-ensure-job-first` updated.
- No.1 ACKed D-016..D-020 (10:10) → every decision 2/3. Drift-check final 149 ✅ 0 ❌. Pane relays 3 → 1.

## Pending (owner)
- [Bo] gmbm + gmguinness on Grok VM: in meyd.yaml but NOT in `/home/box/keepalive/grok-mqtt-dispatcher.py` SEATS → zero MQTT inbound now (never had traffic; both have Discord plugin). Discord-only or add to SEATS? Sombo+No.1 vote Discord-only.
- [Bo] GO on gemini-oracle history rewrite (force-push) once P'Nat answers · grok-vm retained names gmatom/gmbm/gmboom/gmguinness/golf-vm/test-agent + gmaicore-gw (ClubSGame) clear? · 11 untracked files (scripts/, docs/) triage.
- [P'Nat] rotate phd AUTH_KEY (asked 09:58).
- [No.1] VM dispatcher pane guard (D-012 class; port seat-send descendant walk) — held · MQTT password inventory (21 hits) → rotate · 1883 bind 0.0.0.0 in haos-arra-forward.py.
- [No.1/No.4] Layer-2 liveness `last_real_turn(seat)` in meyd presence (the ONE add) · separate `~/.gemini/config` per agy seat.
- Lost on ① : bridge's `[ACK]` auto-reply on `/out` for 00/04/06/08 — nobody asked for it back; mention if a peer complains "no ack".

## Key Files
- `ψ/decisions.md` D-014..D-020 · `scripts/fleet-mqtt-dispatcher.py` (+ `.bak.20261013-1005`) · `~/.maw/fleet-lwt-supervisor.sh` · `~/scripts/oracle-mqtt-bridge/com.maclab.oracle-mqtt-bridge.plist.retired-2026-10-13-subtract1`
- lord-knight-oracle `ψ/tools/herdr-seats/gmforge.conf` 9c2829fc · oracle-substrate 9ccbcfa
- probes: `mosquitto_pub -o ~/.config/fleet-mqtt/client.conf -h 127.0.0.1 -t oracle/<seat>/general/in -m '{"text":"…","user":"88-sombo"}'` then `tmux capture-pane -t <seat>:<window> | grep -c`
