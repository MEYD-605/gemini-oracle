# Handoff: ClubSGame Temperature Pipeline, Glances Latency & Display Power Fixed

**Date**: 2026-10-10 10:50 +07
**Context**: ~50% / 1,000,000 tokens
📡 Session: 30bc6963 | agy-nano2-oracle
**Trigger**: /forward (Discord chat_id: 1511970222444118016)

---

## What We Did (Verified & Delivered)

1. **🖥️ ClubSGame Native Display Timeout Set to 3 Minutes**:
   - Diagnosed why display never slept on AC power: Windows Balanced scheme had `Turn off display after (VIDEOIDLE)` on AC set to `0x00000000` (Never).
   - Purged custom screensaver / AOD watcher / Edge kiosk tasks and directories per Master Bo's request.
   - Configured native Windows display timeout to **3 minutes (180s)** on both AC and DC (`powercfg /change monitor-timeout-ac 3 && powercfg /change monitor-timeout-dc 3`).
   - Kept system sleep (`STANDBYIDLE`) at `0` (Never) so background services, Hermes/Joker bots, and Tailscale remain online and display wakes immediately on input.
   - Verified `powercfg /requests` shows `DISPLAY: None`.

2. **⚡ Glances 2-Second Socket Timeout Eliminated (120x Speedup)**:
   - Root cause: `HddtempPlugin` in Glances on Windows attempted to connect to local port 7634 on an NVMe handheld without any hddtemp daemon, blocking for a 2.07s TCP timeout on every single `/api/4/sensors` call.
   - Patched `site-packages\glances\plugins\sensors\__init__.py` and `glances_hddtemp.py` to skip `hddtemp` on Windows handheld.
   - Verified `/api/4/sensors` latency dropped from **2,076 ms to 17 ms** (over 120x speedup).

3. **🌡️ Homepage & Temperature Real-Time Sync Pipeline Fixed**:
   - Replaced old `ryzenadj.exe` call in `C:\Scripts\get_temp.ps1` with direct read from `C:\Users\ClubSGame\hwinfo-logs\latest.json` (`tctl_c`).
   - Updated `/Users/admin/bin/fleet-silicon-temp.sh` on MacLab to fetch directly from `http://100.87.51.122:8056/status` (<0.05s HTTP) and purged stale cache file.
   - Updated Homepage backend `src/pages/api/widgets/glances.js`:
     - Parallelized all endpoint queries (`cpu`, `load`, `mem`, `uptime`, `sensors`, `fs`) using `Promise.all`.
     - Lowered in-memory cache TTL for `onexfly` from 15s to 1.5s for instant sync.
     - Homepage index 3 widget latency dropped from **2.18s to 0.13s** (20x faster).
   - Reduced `clubsgame-bridge.ts` `updateTelemetry` interval from 5000ms to 2000ms to match HWiNFO 2s writer.
   - Verified OneXConsole (`tctl_c`), ClubsFleet companion (`:8056`), and `dash.clubsxai` (`:3200`) are in 100% sync.

4. **🔊 Joker Cable Sentry**:
   - Re-enabled `Joker-Cable-Sentry` task on ClubSGame (PID 6024); audio and haptics verified working when unplugged.

5. **🧠 Arra Memory Logged**:
   - `37a00cfb-1ad3-4043-948d-f509b23f0ca7` (dash.clubsxai temp pipeline)
   - `38bd0edf-7173-43a4-9915-ea89fd934dce` (Glances latency and cache bottleneck)
   - `c4d15fff-20e7-4d9c-821a-3eeeec8cb232` (Display timeout 15m)
   - `1de79057-9dc2-4eb2-a553-60d825615670` (Display timeout updated to 3m)

---

## Key Files Modified

- **ClubSGame**:
  - `C:\Scripts\get_temp.ps1` (reads `hwinfo-logs\latest.json` `tctl_c`)
  - `C:\Users\ClubSGame\bin\clubsgame-bridge.ts` (2s telemetry loop)
  - `C:\Users\ClubSGame\AppData\Local\Programs\Python\Python312\Lib\site-packages\glances\plugins\sensors\__init__.py` (hddtemp removed from grab map)
  - `C:\Users\ClubSGame\AppData\Local\Programs\Python\Python312\Lib\site-packages\glances\plugins\sensors\sensor\glances_hddtemp.py` (fast exit on win32)
- **MacLab**:
  - `/Users/admin/bin/fleet-silicon-temp.sh` (bridge :8056 direct HTTP query, 1s cache)
  - `/Users/admin/Code/github.com/gethomepage/homepage/src/pages/api/widgets/glances.js` (Promise.all parallel + 1.5s TTL for onexfly)
