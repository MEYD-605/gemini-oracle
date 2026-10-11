# Handoff: Three Houses Mesh, GmBm TUI & Reboot Recovery, Dashboard Glances Restored, and DECISION-005 Governance

**Date**: 2026-10-10 19:45 +07  
**Context**: ~30% / 1,000,000 tokens  
📡 Session: ff5f7c8e | sombo-oracle  
**Trigger**: /forward --only  

---

## What We Did (Verified & Delivered)

1. **👑 Three-Seat Triumvirate Mandate & Governance Enacted (DECISION-001 through DECISION-005)**:
   - Enacted **DECISION-005**: Cleaned up inert key files written by GmBm in `discord-no4/` and `discord-gmgrok/`.
   - Separated 9router keys for Hermes engines: No.00 `hermes-gm` (`sk-...k179cv`) and No.4 `hermes-core5` (`sk-...0148u1`), eliminating shared usage of `maclab-full2`.
   - Scrubbed legacy duplicate 9router key files in `discord-no6/` and `discord-no8/` (both authenticate natively via Google accounts).
   - Enforced 3-Seat Triumvirate boundary on GmBm: forbidden from executing unilateral edits on MacLab HQ via SSH without 2/3 council vote.
   - All decisions recorded in `ψ/decisions.md` (DECISION-001 through 005) and synced to GitHub `main`.

2. **🚀 GmBm Progenitor & Master Builder Persistence Verified (Grok VM)**:
   - No.4 MIMO and Sombo resolved prefix-matching bug in watchdog (`has-session -t =name`) and verified 14 exact session checks.
   - Updated `meyd.yaml` to subscribe `oracle/gmbm/+/in` and fixed prefix bug in supervisor + gateway (`oracle-substrate` `2140f0e`, 21/21 tests pass).
   - GmBm git working tree in `/workspace/gmbm` committed cleanly (`7616f51`) and backed up to GitHub at [MEYD-605/gmbm-oracle](https://github.com/MEYD-605/gmbm-oracle).
   - Tested 7/7 Vital Tubes for `gmbm` and all 4 Grok VM seats (`gmbm`, `gmatom`, `golf-vm`, `gmboom`) with 100% pass.
   - Promoted `gmbm` and `gmboom` to verified `online` on `list_oracles` via retained LWT and metadata.

3. **🛡️ Grok VM 07:59 Rootfs Wipe & 08:34/08:52 Hypervisor Pause Recovery**:
   - 07:59 reboot wiped ephemeral rootfs `/`: No.4 and Sombo verified `boot.sh` auto-restores `claude` CLI, Python wheels (`discord.py`, `paho-mqtt`), and `codebase-memory-mcp` v0.11.0 from `/home/box/keepalive/bin-cache/`.
   - Diagnosed 08:34 and 08:52 outages as Anysphere Hypervisor pauses (uptime froze for 17 min, PIDs survived, zero reset).
   - Identified root cause in `/tmp/sand-host.log`: `sand-host` `box-store-sync` was uploading 5,050 unpacked `node22` files (208 MB) to `api2.cursor.sh` with `ETIMEDOUT` and `EACCES`, choking the pod.
   - Baseline sync completed at 09:00 (cycle ok in 6.8s, 0 failures), VM unpaused automatically. Triumvirate agreed to leave files untouched to prevent re-sync churn.

4. **🌐 `dash.clubsxai.com` Homepage Dashboard Upgraded & Glances Restored**:
   - Reinstalled `glances 4.3.1` + `python3-jinja2` on Grok VM and cached 22 deb packages in `/home/box/keepalive/debs/`.
   - Started Glances REST API on port 61208 (`--disable-webui`), resolving `Connection Refused` on MacLab homepage proxy.
   - Configured 4 new cards in `services.yaml`: Grok Bot (Cloud VM), Grok VM 9Remote Console (:2208), Grok Cloud Linux Desktop (:6081), and MEYD Core Gateway (:1340/health).
   - Live verified HTTP 200 OK on `https://dash.clubsxai.com`: CPU, RAM (chart), Uptime, and Disk telemetry updating in real-time.

5. **📱 Vivo X Fold 3 TSF Shell Keepalive Live**:
   - No.4 deployed `com.maclab.tsf-keepalive` launchd daemon running `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/tools/tsf-keepalive.sh` every 30s.
   - Probes vivo via ADB (`192.168.1.156:5555`), detects if OriginOS steals HOME role or kills TSF, restores Home role and relaunches TSF without disturbing foreground apps.
   - Restored No.4 model strictly to `ag/gemini-3.8-flash-high` and cleaned dead 3.7 fallback endpoints, stopping 503 error loops.

6. **✅ Fleet Parity & Living Memory**:
   - `python3 scripts/fleet-drift-check.py`: **149 checks · ❌ 0 · ❓ 0 (100% All-Green Parity)**.
   - 24-hour Soak Test timer completed (19:41 Oct 9 -> 19:41 Oct 10) with all 3 Houses operational.
   - Milestones recorded in HAOS Arra Memory (:8099).

---

## Pending & Next Session

- [ ] **GmBm Throwaway Seat Acceptance Test**: Awaiting Master Bo command on Discord DM to GmBm to build a throwaway test Oracle seat end-to-end.
- [ ] **No.1 Fleet Arra Token Rotation Plan**: Awaiting No.1's mapping of reader endpoints across all seats before executing token rotation.
- [ ] **No.1 4-Point Duty Cards**: Staging and finalization of operational duty cards for each Council seat.
- [ ] **Subagents & MQTT Ghost Seat Purge Proposals**: Council deliberation and vote on GmBm's subagent expansion and broker retain cleanup.

---

## Key Files
- `sombo-oracle/ψ/decisions.md` (DECISION-001 through 005)
- `sombo-oracle/ψ/focus.md` (Focus HUD)
- `/Users/admin/Code/github.com/gethomepage/homepage/config/services.yaml` (Dashboard services)
- `/Users/admin/Code/github.com/gethomepage/homepage/config/widgets.yaml` (Dashboard widgets)
- `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/tools/tsf-keepalive.sh` (Vivo TSF keepalive)
- `/home/box/keepalive/boot.sh` (Grok VM reboot persistence on 100.70.26.108)
- `/workspace/gmbm/scripts/test-seat-tubes.py` (Grok VM 7 tubes audit)
- `/Users/admin/Code/github.com/MEYD-605/gmbm-oracle` (GmBm GitHub backup repo)
