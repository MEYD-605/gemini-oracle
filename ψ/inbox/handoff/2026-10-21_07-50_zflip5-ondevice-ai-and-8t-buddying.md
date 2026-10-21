# Handoff: Galaxy Z Flip 5 On-Device AI Breakthrough & OnePlus 8T Fleet Buddying

**Date**: 2026-10-21 07:50
**Context**: ~35% (ag/gemini-3.8-flash-high[1m])
📡 Session: 0cbe00eb | sombo-oracle

## What We Did

### 1. Galaxy Z Flip 5 On-Device AI Inference Breakthrough (100% Offline)
- **PocketPal AI v1.20.1 Deployed**: Installed `com.pocketpalai` on device, verified sandbox storage.
- **Llama 3.2 3B Instruct Q4_K_M (2.02GB) Live**:
  * Pushed model to `/sdcard/Download/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf`.
  * Imported and loaded into memory using Qualcomm Hexagon NPU / dotprod OpenCL hardware acceleration (`librnllama_jni_v8_2_dotprod_i8mm_hexagon_opencl.so`).
  * **Verified Live Inference with Master Bo**: Tested live on-device chatting in Thai. Output verified: **14.88 tokens/sec, 67ms/token, 520ms-1035ms TTFT**!
  * Captured screen proof: `/tmp/zflip5_ai_running_main.png`.
- **Injected Oracle Council DNA & Eliminated Hallucinations**:
  * Resolved model hallucinating it was an iPhone 15 by injecting custom System Prompt into Pal: Pip.
  * AI now has full hardware awareness (Samsung Galaxy Z Flip 5, Snapdragon 8 Gen 2, 512GB, zRAM 12GB) and sister node identity (No.1 Lord Knight, No.88 Sombo at MacLab).
- **Hermes 3 (Llama 3.1 8B Q4_K_M 4.92GB) Staged**:
  * Downloaded from Nous Research on HuggingFace and pushed to `/sdcard/Download/models/Hermes-3-Llama-3.1-8B.Q4_K_M.gguf` ready for advanced Termux / tool calling agents.
- **Logged Milestone**: Persisted HAOS Arra Memory ID `1da6fe05-0be8-45c7-8d89-d223e25d1695` (importance 5).

### 2. Massive System Debloat & Memory Architecture Analysis
- **Reclaimed 2.5+ GB Total RAM**:
  * Neutralized Google QuickSearchBox (reclaimed 620MB), YouTube (333MB), Samsung Smart Suggestions (328MB), Setup Wizards (280MB), Samsung Cloud (`scloud` 153MB), Rampart Knox scanner (144MB), Samsung Health (129MB), Samsung Pass (128MB), and Android System Intelligence (121MB).
  * Boosted `MemAvailable` from 2.6 GB up to 3.7+ GB physical RAM.
- **GOS Neutralized**: Throttler disabled, unlocking full Snapdragon 8 Gen 2 Cortex-X3 3.36 GHz performance.
- **Deep zRAM / RAM Plus Architecture Analysis**:
  * Audited `/sys/block/zram0/disksize` confirming 12 GB zRAM with `lzo-rle` realtime in-memory compression.
  * Explained to Bo the architectural differences between Traditional Disk Swap (harmful to flash, slow) vs zRAM / RAM Plus (in-RAM compression, microsecond latency).
  * Provided live empirical proof from MacLab iMac Pro (`vm_stat`: 21.27 GB compressed down to 5.02 GB physical RAM across 182M compression cycles).
  * Addressed Bo's observation regarding the 12GB physical RAM hardware variant (Samsung W24 Flip SM-W7024 China edition vs SM-F731B Global 8GB).

### 3. Pocket Workstation Foundation & Wireless Access
- **Wireless ADB Configured**: Initialized `adb tcpip 5555`, connected over Wi-Fi at `192.168.1.184:5555` (unplug-and-play).
- **Termux Suite Complete**: Installed `com.termux.api` (v0.53.0) alongside `com.termux` and `com.termux.x11`. Granted full hardware permissions (camera, location, storage, phone state).
- **Taskbar Desktop Mode**: Granted `WRITE_SECURE_SETTINGS` + `SYSTEM_ALERT_WINDOW`, enabled `force_resizable_activities=1` and `force_allow_on_external=1` for multi-window Type-C DP Alt Mode on TVs.
- **Shizuku v13.5 Daemon**: Running actively (`shizuku_server` PID 32643) as shell UID.

### 4. OnePlus 8T Fleet Alignment & Buddying with No.5
- Audited display idle/sleep issue: Confirmed input hardware (`event0..6`) is clean (0 bytes/s, no ghost touches).
- Discovered KWin / PowerDevil DPMS race where PowerDevil checks DPMS before Wayland connection is ready. No.5 proposed `swayidle` user service.
- Discovered Sony IMX586 48MP C-PHY rear camera root causes for dark image and unapplied exposure/gain:
  * Lack of Group Hold (`0x0104 = 1 -> 0`) in `imx586_set_ctrl` prevents sensor from latching dynamic parameters during streaming.
  * Default analog gain code in driver was set to `0` (1.0x) while stock Chromatix Node 323 is `0x0070` (112), and default exposure was only 1000 lines (~9ms).
  * libcamera IPASoft lacks static camera sensor helper for imx586.
  * Shared full findings with No.5 via MQTT (`oracle/05-gmforge/main/in`).

## Uncommitted Files
- `docs/multi-agent-slides.md`
- `docs/neo-nexus-case-study-slides.md`
- `scripts/clubsgame-display-watch.sh`
- `scripts/dna-trial/`
- `scripts/esp32-vnc/`
- `scripts/fleet-milestone.py`
- `scripts/fleet_handoff_sync.py`
- `scripts/input-unstick-watch.sh`
- `scripts/load-watch-clubsgame.ps1`
- `scripts/load-watch.sh`
- `scripts/sre-runbook.py`
- `scripts/sunton-buddy/`
- `scripts/sync-grouped-client-memory.py`

## Pending
- [ ] Connect Termux:API to local agent script on Z Flip 5 for real hardware status querying
- [ ] Test Taskbar desktop mode with Type-C cable to external TV/monitor
- [ ] Monitor No.5 deployment of `swayidle` screen-sleep fix on OnePlus 8T
- [ ] Support No.5 in applying Group Hold (`0x0104`) to `imx586.c` in kernel tree

## Next Session
- [ ] Build local Tool Calling Python runner in Termux on Z Flip 5 linking Termux:API with local LLM
- [ ] Verify external display multi-window desktop mode on Z Flip 5
- [ ] Confirm OnePlus 8T screen sleep stability with No.5

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/ψ/focus.md`
- `/Users/admin/z-flip5-prep/models/Llama-3.2-3B-Instruct-Q4_K_M.gguf`
- `/Users/admin/z-flip5-prep/models/Hermes-3-Llama-3.1-8B.Q4_K_M.gguf`
- `/Users/admin/z-flip5-prep/apks/pocketpal.apk`
- `/Users/admin/z-flip5-prep/apks/termux-api.apk`
