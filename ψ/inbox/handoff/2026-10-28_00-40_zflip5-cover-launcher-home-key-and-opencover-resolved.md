# Handoff: Z Flip 5 Cover Screen (Flex Window) Launcher & Home Button Exit Trap Resolved

**Date**: 2026-10-28 00:40
**Node**: iMac Pro maclab (100.83.0.1)
**Device**: Samsung Galaxy Z Flip5 (SM-F731B / `R5CW813M11T` / `z-flip5--jayson`)
**Engine**: Hermes Agent (`ag/gemini-3.8-flash-high`) · Session: `04-mimo`

## What We Accomplished
1. **Reverse-Engineered Samsung One UI Clamshell SubScreen Architecture**:
   - Pulled and decompiled 3 core system APKs from device using JADX 1.5.6: `AODService_v80.apk`, `MultiStar.apk`, and `DressRoom.apk`.
   - Identified that Display 1 (Flex Window 748×720, ID `4630947181303254916`) root task is locked to `com.android.systemui.subscreen.SubHomeActivity`.
   - Discovered that Samsung uses internal flag `FLAG_SUB_DISPLAY = 16` (`mWhich = 17, 18`) to distinguish sub-display wallpapers from primary display wallpapers.

2. **Diagnosed Root Cause of "กดปุ่มกลางแล้วหลุดเลย"**:
   - Running any standard launcher or activity on Display 1 via `am start --display 1` creates a transient task.
   - When the user taps the center Home button (`O`) or performs the Home gesture on Display 1, `PhoneWindowManager` and `SystemUI` trigger `ACTION_CLOSE_SYSTEM_DIALOGS reason=homekey, displayId=1`.
   - `SubLauncherBroadcastReceiver: onHomeGestureDetected()` catches the broadcast, immediately dismisses the foreground launcher task, and returns to Samsung's clockface carousel (`SubHomeActivity`).

3. **Community & Global Open-Source Research**:
   - Dispatched 2 parallel subagents to research GitHub, XDA Developers, and Reddit (`r/galaxyzflip`).
   - Analyzed 3 major solutions: `CoverScreen OS`, `SamSprung TooUI`, and `Shmubbier/OpenCover` (GPL-3.0, specifically designed for Z Flip 5 Flex Window on One UI).
   - Confirmed the universal technical invariant: On Android 14+, preventing Home from exiting requires a system-bound `AccessibilityService` combined with `WRITE_SECURE_SETTINGS` and `SYSTEM_ALERT_WINDOW` to catch the focus loss and immediately re-anchor the cover desktop.

4. **Deployed & Verified OpenCover (v0.1) on Z Flip 5**:
   - Downloaded and installed `OpenCover-0.1.apk` on `192.168.1.197:5555`.
   - Granted privileged permissions via ADB:
     - `pm grant dev.opencover android.permission.WRITE_SECURE_SETTINGS`
     - `appops set dev.opencover SYSTEM_ALERT_WINDOW allow`
     - `appops set dev.opencover GET_USAGE_STATS allow`
     - `settings put secure enabled_accessibility_services dev.opencover/.watcher.CoverAccessibility`
     - `settings put secure accessibility_enabled 1`
   - Verified that pressing the center Home button (`keyevent 3`) **STAYS on the Cover Launcher and NEVER exits to Samsung's lockscreen**.
   - Verified full app drawer access (Phone, Photos, Mattermost, Discord, Chrome, Settings, Calculator, Music, etc.) with A-Z search and quick settings shade.

5. **Integrated Knowledge into Fleet Skill**:
   - Knowledge fully crystallized in `android-foldable-workspace-and-dex-v6` under `mobile-devops`.

## Pending
- [ ] Configure custom wallpaper (Oracle Nexus Core theme) on OpenCover home screen
- [ ] Add favorite app shortcuts to OpenCover dock (Phone, Gallery, Mattermost, Settings)
- [ ] Finalize Notification Access toggle for OpenCover to enable message previews on cover display

## Next Session
- [ ] Set up OpenCover wallpaper via settings or push directly to app storage
- [ ] Configure Mattermost and Discord notifications to display cleanly on Flex Window
- [ ] Verify battery consumption and idle performance of OpenCover over 24h soak

## Key Files
- `/tmp/reverse_zflip5/` — Decompiled sources of `AODService`, `MultiStar`, and `DressRoom`
- `/tmp/OpenCover.apk` — OpenCover v0.1 binary for Galaxy Z Flip 5
- `/Users/admin/.hermes-no4/skills/mobile-devops/android-foldable-workspace-and-dex-v6/SKILL.md` — Authoritative foldable & cover screen skill
- `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py` — Upgraded daemon supporting media uploads and display-specific commands
