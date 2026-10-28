# Handoff: Z Flip 5 Shizuku + Dual-Path LAN/Tailscale + GM AI Core MQTT Buddy & Subscreen QS Analysis

📡 SESSION: 9_5bf4ed | ตรวจสอบมาตรฐาน VM Grok | msgs=292 | ag/gemini-4-argon-high

**Date**: 2026-10-28 17:52
**Context**: ~80%

## What We Did
- **Z Flip 5 (`100.95.245.81` / `192.168.1.197`) Shizuku & Permissions Pre-Grant (Zero User Popups)**:
  - Fixed `shizuku_server` startup failure caused by Android 14+ SELinux blocking wildcard expansion in `/data/app/~~*` by resolving the exact path dynamically via `pm path moe.shizuku.privileged.api | sed "s/package://;s/base.apk/lib\/arm64\/libshizuku.so/"`.
  - Pre-granted all AppOps (`SYSTEM_ALERT_WINDOW`, `MANAGE_EXTERNAL_STORAGE`, `ACCESS_RESTRICTED_SETTINGS`, `GET_USAGE_STATS`, `WRITE_SETTINGS`), battery whitelist (`cmd deviceidle whitelist`), and runtime permissions (`CAMERA`, `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `READ_PHONE_STATE`, `CALL_PHONE`, `READ_SMS`, `SEND_SMS`, `POST_NOTIFICATIONS`, `BLUETOOTH_CONNECT`, etc.) to `com.termux`, `com.termux.api`, `com.termux.boot`, `dev.opencover`, and `moe.shizuku.privileged.api`.
  - Enabled `dev.opencover/dev.opencover.watcher.CoverAccessibility` and persisted `sshd -p 8022` + `termux-wake-lock` + Shizuku auto-start in `~/.termux/boot/start_node.sh`, `~/.bashrc`, and `~/.profile`.
- **Dual-Path LAN Wi-Fi (`192.168.1.197`) + Tailscale (`100.95.245.81`) Routing (Works when Tailscale is OFF)**:
  - Discovered macOS interface-scoped route quirk (`IFSCOPE` on `en1`) causing direct `ssh 192.168.1.197` to return `No route to host` while `ProxyCommand /usr/bin/nc %h %p` succeeds immediately.
  - Updated `/Users/admin/.ssh/config` (`flip5`, `flip5-wifi`, `192.168.1.197`) and `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py` (`get_flip5_adb_target`, `run_flip5_termux`, `take_flip5_screenshot`, `start_flip5_shizuku`) to use LAN `192.168.1.197` (`34285`/`5555`/`8022` via `nc`) + Tailscale `100.95.245.81` seamlessly.
  - Configured dual-path `/usr/local/bin/zflip5-adb` and `~/.ssh/config` (`Host zflip5`) on Muk's iMac (`100.83.15.49`) so `gm-aicore` can control Z Flip 5 even when Tailscale is turned off on the phone.
- **GM AI Core (`100.83.15.49`) MQTT Inbound Bridge & Buddy Execution**:
  - Created and deployed `/Users/use/.hermes-gmaicore/gmaicore-mqtt-inbound.ts` managed by ` ~/Library/LaunchAgents/com.local.gmaicore-mqtt-inbound.plist` on `100.83.15.49`.
  - Subscribed `gmaicore-gw` and `gmaicore` to `oracle/+/+/in` on `100.83.0.1:1883` with live LWT/meta presence and fixed broken `python` symlink in `~/.hermes-gmaicore/venv/bin` (`python3.14` / `/Users/use/Library/Python/3.14/bin/hermes`).
  - Executed joint buddy task with `gmaicore-gw` over MQTT (`send_to_oracle`) to probe and test `sysui_sub_qs_tiles` on Z Flip 5.
- **Cover Screen Quick Settings (`sysui_sub_qs_tiles`) Root-Cause Analysis**:
  - Verified via `logcat` and `SystemUI.apk` (`classes3.dex` / `dumpsys activity service com.android.systemui/.SystemUIService`) that Samsung `SecQSTileInstanceManager` (`mTileUsingHosts`) enforces a strict whitelist for `Subscreen` tiles (`Wifi`, `Bluetooth`, `SoundMode`, `AirplaneMode`, `Flashlight`, `MobileData`, `Dnd`, `RecordScreenTile`, `DeviceVisibilityTileService`, `LifestyleModeTile`).
  - `RotationLock` and `custom(com.tailscale.ipn/.QuickToggleService)` (`SecTile=false`) are restricted to `[Panel, QQS]` (inner screen only); any `settings put secure sysui_sub_qs_tiles` modification is overwritten by `com.android.systemui` within 10ms.
  - Identified clean code-level solution via `dev.opencover` (`CoverAccessibility` overlay on Display 1) to render a custom Quick Toggle bar (Rotation Lock + Tailscale toggle) or hook an existing subscreen tile when `SubScreenQuickPanel` expands.

## Pending
- [ ] Implement Rotation Lock + Tailscale quick toggle overlay bar in `dev.opencover` (`CoverAccessibility`) on Z Flip 5 cover screen when approved by Bo
- [ ] Clean up untracked research artifacts in `mimo-oracle` (`research_foldable/`, `tsf_launcher_decompiled_project.tar.gz`)

## Next Session
- [ ] Patch `dev.opencover` (`CoverAccessibility`) to add floating/attached Rotation + Tailscale quick toggles on Cover Screen (`Display 1`) and deploy APK via ADB
- [ ] Prune stale local branches and untracked temp folders in `mimo-oracle`

## Key Files
- `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py` — Mattermost `@gmaicore` hardware tool bridge (dual-path LAN/Tailscale ADB + Termux SSH + dynamic Shizuku path)
- `/Users/admin/.ssh/config` — Dual-path SSH config for `flip5` / `192.168.1.197` (`ProxyCommand /usr/bin/nc %h %p`) and `100.95.245.81`
- `/Users/use/.hermes-gmaicore/gmaicore-mqtt-inbound.ts` (on `100.83.15.49`) — Fleet MQTT inbound listener & presence daemon for `gmaicore-gw` / `gmaicore`
- `/usr/local/bin/zflip5-adb` (on `100.83.15.49`) — Dual-path ADB wrapper for `gm-aicore`
- `/data/data/com.termux/files/home/.termux/boot/start_node.sh` (on Z Flip 5 `192.168.1.197`) — Auto-boot script for `sshd`, `termux-wake-lock`, loopback ADB, and `shizuku_server`
