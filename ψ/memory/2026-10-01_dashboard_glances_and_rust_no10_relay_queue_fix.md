# 2026-10-01: Fix ClubSGame Dashboard Glances Telemetry & Rust No.10 Concurrency Queue + Watchdog

**Author**: No.6 Gemini (Pack Leader) [maclab:no6]  
**Collaborators**: Joker, Golf, Bo (borde9902)  
**Nodes Involved**: MacLab (`100.83.0.1` / `100.117.159.94`), ClubSGame (`100.87.51.122`)

---

## 1. Summary of Issues & Directives

1. **Dashboard Telemetry Outage (ClubSGame Handheld)**:
   - Bo reported that the ClubSGame signal vanished from the Homepage Dashboard (`http://127.0.0.1:3200`), displaying red "API Error" banners across widgets and infrastructure cards.
   - Root Cause: Windows Scheduled Task `GlancesService` (port 61208) on ClubSGame went into `Ready` state and stopped running after prior cleanup.
   - Fix Applied:
     - Started `GlancesService` on ClubSGame.
     - Verified endpoint `http://100.87.51.122:61208/api/4/quicklook` and Homepage proxy `http://127.0.0.1:3200/api/widgets/glances?index=3` returning 200 OK with AMD 7840U CPU, RAM, battery (96%), and temperature (43.5°C).
     - Added an automatic revival watchdog for `GlancesService` inside `C:\Users\ClubSGame\bin\joker-power-watcher.ps1` so it is checked every 30s and never dies again.

2. **No.10 Discord Relay Concurrency Bug (`discord-no10-relay.exe`)**:
   - Joker reported that the initial Rust relay lacked a concurrency queue. When Bo sent rapid consecutive messages, the relay spawned 3–4 concurrent `agy.exe` instances on a 4W TDP handheld, spiking CPU past 70% and causing thermal buildup.
   - Furthermore, if an `agy.exe --continue` session locked up on Windows, it would hang without timing out.
   - Fix Applied in `src/no10_relay.rs` (Rust v2.1):
     - **Sequential Concurrency Queue**: Dedicated worker thread powered by `std::sync::mpsc::channel<TurnItem>`, strictly enforcing concurrency limit = 1 turn at a time.
     - **40-Second Stall Watchdog**: When using `--continue`, if 0 bytes of stdout are produced within 40 seconds (dead session lock), the watchdog automatically invokes `taskkill /F /T /PID` to cleanly abort the process tree, notifies Discord, and seamlessly retries the message with a fresh session (`is_fresh_session = true`).
     - **11-Minute Max Turn Timeout**: Prevents runaway turns from hanging indefinitely.
     - **Low Footprint**: Cross-compiled with `x86_64-pc-windows-gnu` (binary size 2.2 MB), running on ClubSGame using only **8.6 MB RAM** (vs ~70 MB on Bun/TS).
     - Deployed and active via Windows Scheduled Task `No10-Discord-Relay`.

---

## 2. Verification Telemetry

- **Dashboard Glances**: 200 OK (`http://100.87.51.122:61208`)
- **ClubSGame Thermal**: ~43.5°C, pinned 4W TDP, fan in Mode 0 (Auto Curve).
- **No.10 Relay Process**: PID 4540 (`discord-no10-relay.exe`), RAM 8.66 MB, WebSocket Gateway READY.
- **Fleet MQTT**: Handshake and status updates sent to `joker` and `golf`.

---

## 3. Final Hardening (Deduplication & Real-Time Logging)

1. **Message Deduplication**:
   - Added snowflake comparison (`msg_id_u64 <= last_seen_u64`) against tracked channels in `relay-state.json`.
   - Prevents duplicate execution upon gateway reconnects, replay events, or rapid retransmissions.
   - Saves state to `relay-state.json` immediately when messages are accepted.

2. **Real-Time Log Flushing & Wrapper Hardening**:
   - Added `std::io::stdout().flush()` inside `log_ts` in Rust to ensure instantaneous file writes when piped to disk.
   - Rotated wrapper execution log to `C:\Users\noone\bin\no10-relay-v2.log` to avoid legacy handle locks.
   - Verified clean background execution via Scheduled Task `No10-Discord-Relay` with zero orphaned `agy.exe` workers.

