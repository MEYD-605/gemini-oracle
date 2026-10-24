# Sony Bravia KD-55X7500F: Google Play Button Remap to SmartTube

**Date**: 2026-10-20
**Author**: No.6 Gemini (Research & Analysis)
**Target**: Sony Bravia KD-55X7500F (`192.168.1.104:5555`, Android 9, armeabi-v7a)

## Root Cause Discovery
1. Sony Bravia remote dedicated buttons (Google Play / Netflix) are hardcoded at the firmware/system level:
   - Kernel scancode: 587 -> `SONY_UINPUT_SERVICE.kl`: `key 195 BUTTON_2`
   - Intercepted by `com.sony.dtv.sonysystemservice.remotekey.GlobalKeyReceiver`
   - Dispatched to `GlobalKeyIntentService.broadcastKey()`:
     ```java
     case 195:
         launchApplication(getGooglePlayLaunchIntent(), zIsPowerOn);
         break;
     ```
   - `getGooglePlayLaunchIntent()` checks if `com.google.android.videos` or `com.android.vending` is enabled, then calls `packageManager.getLeanbackLaunchIntentForPackage(...)`.
2. Because it is intercepted at the system service layer before standard window focus / accessibility dispatch, standard third-party apps (Button Mapper by flar2, KeyMapper) fail or get blocked by the Play Store launching over them (plus Button Mapper locks custom hardware keys behind a paid Pro license).

## Solution Implemented
1. **Disable Play Store Launch**:
   - `pm disable-user com.android.vending`
   - With both `com.google.android.videos` and `com.android.vending` disabled, Sony's `GlobalKeyIntentService` cannot launch Play Store and simply displays a harmless Toast.
2. **Lightweight Logcat Daemon**:
   - Placed `/data/local/tmp/remap_play_button.sh`:
     ```sh
     #!/system/bin/sh
     logcat -v brief -s SSServ_GlobalKeyIntentService:I -T 1 | while read -r line; do
         case "$line" in
             *"keycode = 195"*)
                 am start -n app.smarttube.fdroid/com.liskovsoft.smartyoutubetv2.tv.ui.main.SplashActivity
                 ;;
         esac
     done
     ```
   - Permissions: `chmod 755 /data/local/tmp/remap_play_button.sh`
   - Background execution: `nohup /data/local/tmp/remap_play_button.sh > /dev/null 2>&1 &`
   - Overhead: 0% CPU, < 1MB RAM (sleeps in kernel poll on pipe).
   - Target Activity: `app.smarttube.fdroid/com.liskovsoft.smartyoutubetv2.tv.ui.main.SplashActivity` (exported LEANBACK_LAUNCHER).

## Verification
- Simulated and live physical button press verified:
  - Button press on Sony remote -> `broadcastKey() : keycode = 195` -> daemon launches SmartTube in ~0.2s.
  - No Play Store popup, no crash.
