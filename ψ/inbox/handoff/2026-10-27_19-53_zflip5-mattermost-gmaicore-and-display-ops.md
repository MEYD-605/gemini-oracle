# Handoff: Z Flip 5 Display Routing, Debloat & GM AI Core Mattermost Live Bridge

**Date**: 2026-10-27 19:53  
**Node**: maclab (100.83.0.1)  
**Agent**: No.4 MIMO  
**Session**: `2_e62a64` / `9_5bf4ed` · `ag/gemini-3.8-flash-high` / `cc/claude-opus-5-5`

---

## What We Did

### 1. Samsung Galaxy Z Flip 5 (`SM-F731B`) Hardware & Environment Setup
- **Screen & Display Topology**:
  - Inner screen (Display 0, 1080x2640): Broken 100%, touch unusable.
  - Cover screen / Flex Window 3.4" (Display 1 / SurfaceFlinger ID `4630947181303254916`, 748x720): Fully functional.
  - External Sony Bravia TV (Display 25, 3840x2160): Connected via Type-C HDMI adapter. Reverted DeX/Desktop mode back to clean One UI Screen Mirroring per user instruction.
- **ADB & Connectivity**:
  - Established permanent wireless ADB on `192.168.1.197:5555` and verified USB device serial `R5CW813M11T`.
  - Disabled Samsung Auto Blocker (`rampart_main_switch_enabled 0`), set stay awake while charging (`stay_on_while_plugged_in 7`).
- **RAM Debloat & Optimization**:
  - Purged 47+ unnecessary bloatware packages (PUBG, games, telemetry, unused Samsung services) yielding **~3.7 GB free RAM**.
  - Verified modem and mobile telephony services (`com.android.phone`) remain 100% operational for 4G/5G data and hotspot.
- **Linux Workstation on Device (Termux + PRoot)**:
  - Installed Termux suite + Ubuntu 26.04 Arm64 container.
  - Bound Adreno 740 direct GPU device (`/dev/kgsl-3d0`) with Turnip Vulkan / Zink Mesa acceleration.
  - Deployed startup script `~/start-desktop.sh` linked to `/usr/bin/start-desktop`.
- **Installed Essential Applications**:
  - `NewPipe v0.29.1` (ad-free YouTube with background playback).
  - `Tailscale v1.104.2` (VPN mesh connectivity).
  - `Discord`, `Apple Music`, `Meta Business Suite` (via split APKs).
  - `Good Lock` + `MultiStar` v7.1.33 and v9.0.15 APKs.

### 2. Cover Screen Navigation & Samsung Account Root-Cause Resolution
- **Cover Screen App Launching**:
  - Discovered direct display routing via `am start --display 1 -n <activity>` to launch any app directly onto the 3.4" cover display.
  - Successfully brought up the full **Settings** app on the cover screen (`am start --display 1 -n com.android.settings/.Settings`).
- **Galaxy Store & Samsung Account Diagnosis**:
  - Root cause of Galaxy Store error identified: `com.osp.app.signin` was frozen during afternoon debloat.
  - Knox Security blocks remote shell from re-enabling identity apps (`SecurityException: Shell cannot change component state for null to 1`).
  - Guided user to click "Enable" (เปิดใช้งาน) directly via mouse in Settings > Apps > Samsung account.
- **FOTA Firmware Landscape**:
  - Current device build: `AP3A.240905.015.A2.F731BXXS5EYG7` (Android 15 / One UI 7.0, Binary 5, THL).
  - Delta OTA update `F731BXXS5EYI1` (458.47 MB) already downloaded and ready to install on TV.
  - Upstream Samsung FOTA server latest build for THL: `F731BXXU7HZIJ` (Binary 7, matches Mook's unit).

### 3. GM AI Core (`gmaicore`) Deployed & Live on Mattermost
- Transferred core brain package `gmaicore-oracle` (45 MB) to Termux at `~/gmaicore-oracle`.
- Created bot user `gmaicore` on Mattermost (`https://mm.clubsxai.com` / `127.0.0.1:8065`) owned by `khunbo`.
- Created Bot Access Token (`xsnmgw9af7n83k5cz5fb1o8f8c`) and direct DM channel with Bo (`bp8bat1pwby7uydfd6k65wiu8o`).
- Integrated `gmaicore` into `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py` with full `SOUL.md` persona ("Core thinks. Grok acts. Bo decides." / The Relay Lantern ⚡) and real-time WebSocket connection.
- Successfully verified bidirectional DM test with Bo on Mattermost (`⚡ [flip5:gmaicore]`).

### 4. Background Completed Items (Earlier in Session)
- **Google Ads PMax (Club S `965-731-9650`)**: Verified ฿4,000 spend-match promotion code `3L9NN-LR7XE-RC4J` active; strategy set for early Nov 2026.
- **Velaa Longevity Re-grade v4**: Delivered 6 hero showcase images, replaced frame 586, dropped reception desk shot 578, synchronized with Sombo.

---

## Pending & Next Actions
- [ ] User to enable Samsung Account via Settings > Apps on TV screen to restore Galaxy Store login.
- [ ] Optionally execute FOTA update `EYI1` (458.47 MB) via "Install now" button when convenient.
- [ ] Configure MultiStar Launcher Widget / Labs cover screen app whitelist once One UI update completes.
- [ ] Launch PMax Graduation campaign on Google Ads account `965-731-9650` early November.

---

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/inbox/handoff/2026-10-27_19-53_zflip5-mattermost-gmaicore-and-display-ops.md` — This handoff
- `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py` — Mattermost multi-bot WebSocket daemon (Hermes, GM AI Core, Sombo, MIMO)
- `/Users/admin/srv/mattermost/bridge/.gmaicore-token` — Bot access token for GM AI Core
- `/Users/admin/Code/github.com/MEYD-605/gmaicore-oracle/` — GM AI Core source repository
- `/tmp/multistar_9.0.15.apk` — One UI 7 compatible MultiStar APK
