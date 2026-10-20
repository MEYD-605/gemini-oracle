# Handoff: OnePlus 8T Remote Screen Optimization & Galaxy Z Flip 5 Linux Prep

**Date**: 2026-10-20 19:15 (+07)
**Seat**: [maclab:04-mimo]
**Context**: ~85%
**Model Migration**: ag/gemini-3.8-flash-high → cc/claude-opus-5-5 (Bo order)

## What We Did

### 1. Galaxy Z Flip 5 (SM-F731B / `b5q`) Research & Staging
- Verified Thai marketplace listing (SM-F731B 8GB/512GB @ ฿5,600): confirmed Global model 'B' is 100% bootloader unlockable (unlike US models U/U1).
- Corrected hardware specs: Type-C port supports USB 3.2 Gen 1 + DisplayPort Alt Mode (DP Out).
- Clarified Voice/Cellular architecture: Snapdragon 8 Gen 2 (SM8550) supports `q6voice` + AudioReach APM DSP sub-graph for native Linux voice calls just like OnePlus 8T.
- Dispatched 3 subagents to map IC layout, dual DSI panel controller (`S6E3FAC` inner 120Hz + `S6E3FC5` outer 60Hz), Synaptics TCMv2 touchscreens, and Knox Guard avoidance.
- Staged Odin4 v1.2.1 and `samloader` on OrbStack VM `oneplus-builder` (`~/z-flip5-prep/`), verified latest Thai stock firmware `F731BXXU7HZIJ`.
- Authored and committed complete hardware/software porting blueprint to `/Users/admin/z-flip5-prep/BLUEPRINT-B5Q.md` and `mimo-oracle/ψ/blueprints/BLUEPRINT-B5Q.md` (commit `535a3ee`).

### 2. OnePlus 8T (postmarketOS / KDE Plasma Mobile 6) Remote Screen & Audio
- **Audio Streaming**: Built and deployed PulseAudio HTTP streamer via Python (`audio_stream_server.py`) on port 8080 (`clubs8t-audio-stream.service`), opened nftables rule `52_audiostream.nft`, created MacLab desktop shortcut `/Users/admin/Desktop/OnePlus-8T-Audio.webloc`.
- **KRDP FreeRDP / OpenSSL Crash Fix**:
  - Root cause: Microsoft Remote Desktop for Mac SSL layer crashed with `BIO_should_retry error:0A00010F:SSL routines::bad length` whenever an uncompressed/large video frame (>16KB) was written in a single call.
  - Solution: Developed and compiled `/usr/local/lib/libchunk_ssl.so` on 8T to intercept `SSL_write()` and fragment buffers into 16,384-byte chunks; preloaded into `app-org.kde.krdpserver.service`. Completely eliminated RDP drops and broken pipe errors.
- **Mouse Coordinate & Display Latency Tuning**:
  - Diagnosed mouse coordinate misalignment caused by 2.6x fractional scaling.
  - Changed display geometry to integer scale `2.5x` (432×960) via `kscreen-doctor output.1.scale.2.5 output.1.rotation.none`.
  - Configured `~/.config/kcminputrc` with `cursorTheme=breeze_cursors` (Size 32) so desktop cursor arrow renders properly on touch UI.
  - Set KRDP `--quality 25` to reduce video bitrate from 275 Mbps to ~10 Mbps, cutting software x264 encoding latency from 40ms to ~3ms.
  - Updated `/Users/admin/Desktop/OnePlus-8T.rdp` with `smart sizing: 0` for 1:1 pixel-perfect sharpness.
- **Kernel & Hardware Analysis**:
  - Confirmed DisplayPort Alt Mode (`card0-DP-1`) is registered and bound in Qualcomm DPU driver (`ae90000.displayport-controller`).
  - Investigated `qcom-venus` hardware video encoder: blacklisted in `/etc/modprobe.d/blacklist-venus.conf` due to upstream SM8250 firmware exception (`0x3bcd4`) SoC reset bug.
  - Investigated sudden reboot at 19:07: confirmed caused by No.5 GMForge running raw camera register probe (`/tmp/rd.py 0xacb5200`) triggering Snapdragon hardware SError/bus fault.
  - Recommended hardware solutions: Powered Docking Station (HDMI 0ms native out), HDMI Capture Card to Mac QuickTime, or 4-channel Quad Multi-Viewer.

## Pending Items
- [ ] Test OnePlus 8T video out via Powered Docking Station to external monitor / TV (0ms hardware DP Out).
- [ ] Inspect Samsung Galaxy Z Flip 5 (SM-F731B) upon physical arrival tonight: verify Knox Guard state (`KG STATE: Checking` or `Completed`), test Download Mode.
- [ ] Backup stock partitions (EFS, boot, recovery) via Odin4 on Orb VM `oneplus-builder` before attempting bootloader unlock.

## Key Files
- `/Users/admin/Desktop/OnePlus-8T.rdp` — MacLab RDP shortcut
- `/Users/admin/Desktop/OnePlus-8T-Audio.webloc` — MacLab live audio shortcut
- `/Users/admin/z-flip5-prep/BLUEPRINT-B5Q.md` — Z Flip 5 Mainline Linux blueprint
- `/usr/local/lib/libchunk_ssl.so` (on 8T) — SSL write chunker library
- `/home/clubslinux8t/.config/systemd/user/app-org.kde.krdpserver.service.d/override.conf` (on 8T) — KRDP systemd configuration
- `/home/clubslinux8t/audio_stream_server.py` (on 8T) — PulseAudio HTTP streamer
