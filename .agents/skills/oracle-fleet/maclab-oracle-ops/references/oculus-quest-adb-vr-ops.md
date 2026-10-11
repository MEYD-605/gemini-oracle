# Oculus Quest 1 ADB & VR Workstation Operations

## User Workflow & Verification Directives
- **Explore & Verify Before Claiming (Bo's Rule)**: Never do naive trial-and-error in front of the user. Fully explore, inspect logs (e.g. `adb logcat`), and verify process stability BEFORE reporting completion.
- **No Unchecked Launches**: When installing or launching APKs on Quest/Android, pull `logcat` or check process state to confirm the app hasn't crashed (`FATAL EXCEPTION`) before telling the user it is running.
- **Thorough Exploration First**: Avoid guessing or making trial-and-error round-trips. Inspect dependencies, test APIs/executables, and ensure the full stack is functional before claiming a task is done.

## Quest 1 (Android 10 AOSP) Quirks & Pitfalls
- **Private DNS (DoT) & ISP Bypassing**:
  - Quest 1 (Android 10) supports DoT via Private DNS settings:
    `adb shell settings put global private_dns_mode hostname`
    `adb shell settings put global private_dns_specifier one.one.one.one`
    (Note: Do NOT use `private_dns_host` — use `private_dns_specifier`).
  - **CRITICAL PITFALL — Tailscale DNS Hijack**: Tailscale client on Quest hijacks all DNS routing via a dead MagicDNS resolver (`100.100.100.100`). This breaks all domain resolution on the device (even `google.com`) despite valid Private DNS or Wi-Fi settings. If DNS fails completely, kill Tailscale immediately via `adb shell am force-stop com.tailscale.ipn`.
  - **CRITICAL PITFALL — Wi-Fi Toggling over Wireless ADB**: NEVER issue `adb shell svc wifi disable` when connected via Wi-Fi ADB (`192.168.1.x:5555`). Disabling Wi-Fi immediately kills the ADB connection, preventing the follow-up `svc wifi enable` command from running and rendering the device offline until physical USB reconnection.
  - **Tool Quirks**: Toybox `nc` on Android does NOT support `-z` for port scanning (`nc -z` exits with error, which may be mistaken for port 853 being blocked). Use `nc -w 3 <ip> <port> < /dev/null` or test `dumpsys connectivity` for `ValidatedPrivateDnsAddresses`.

- **Proximity Sensor & Display Keep-Alive**: Quest 1 turns off screen when unmounted.
  - Keep display on while USB connected: `adb shell settings put global stay_on_while_plugged_in 3`
  - Proximity sensor disable: `adb shell am broadcast -a com.oculus.vrpowermanager.prox_close`
- **Modern Android APK Compatibility**: Modern React Native / Play Services APKs (e.g. Discord 2024+ builds) fail with missing JNI libraries (`FATAL EXCEPTION: couldn't find "libkv_storage.so"`).
  - Remedy: Use Web PWA in Oculus Browser or lightweight web wrappers/PWAs instead of heavy Play-dependent APKs.
- **WebXR Development & Local Host Access**:
  - WebXR on Quest Browser requires HTTPS or ADB Port Reverse.
  - Forward local Vite dev server: `adb reverse tcp:5173 tcp:5173`
  - Open URL directly in Oculus Browser: `adb shell am start -a android.intent.action.VIEW -d "http://localhost:5173" -n com.oculus.browser/.MainActivity`
- **Voice Control & Maw Board Integration**:
  - Web Speech API (`webkitSpeechRecognition`) works natively in Oculus Browser (`com.oculus.browser`).
  - Voice Gateway pattern: local HTTP server on port 3458 receiving POST JSON `{text}` → routes to `maw hey` or `tmux send-keys`.
  - PTT UI Widget: Floating button injected into web board UI to trigger voice recognition and forward speech to Voice Gateway.
