# Android / ADB probe quick note

Use when a Samsung/Android phone is physically connected but `adb devices` is empty.

## Fast checks
1. Confirm USB enumeration on macOS:
   - `system_profiler SPUSBDataType | egrep -i -A6 -B2 'samsung|android|galaxy|mobile|phone|ultra'`
2. Check ADB visibility:
   - `adb devices -l`
3. If `adb` daemon startup collides on the default socket/port, try an alternate server port:
   - `adb -P 5038 start-server`
   - `adb -P 5038 devices -l`

## What this tells you
- USB visible but no ADB entry: cable/driver/debugging/authorization issue.
- ADB works on alternate port: the default daemon socket is occupied or stale.
- Still no device: phone-side USB debugging authorization likely still pending.

## Keep it short
When replying to Bo, state only:
- whether the phone is visible on USB,
- whether ADB sees it,
- and the exact next blocker.
