# iPad / iOS Device Inspection & OTA Log Audit via libimobiledevice

When inspecting an iPad or iPhone connected via USB on MacLab:

## 1. Device Discovery & Pairing ID
- USB serial format for modern iOS/iPadOS devices uses hyphenated UDID (e.g., `00008027-000C098A0E0B802E`).
- Run `idevice_id -l` to get the active connected device UDID.
- Fallback hardware lookup: `system_profiler SPUSBDataType | grep -i -B1 -A8 "ipad\|iphone"`.

## 2. Query Device Info & OS Build
```bash
S="<UDID>"
for k in ProductVersion ProductType ActivationState DeviceName BuildVersion; do
  echo -n "$k: "
  ideviceinfo -u $S -k $k
done
```
- `ProductVersion`: e.g. `26.6`
- `ProductType`: e.g. `iPad8,9` (iPad Air 4th gen)
- `BuildVersion`: e.g. `23G71`

## 3. Extracting OTA Update Logs & Crash Diagnostics
When verifying whether a software update completed or was interfered with:
```bash
mkdir -p /tmp/ipad_crash
idevicecrashreport -u $S -e /tmp/ipad_crash
```
- Inspect `/tmp/ipad_crash/ota_patch.txt` for system update checkpoints.
- Key checkpoint markers for successful update completion:
  - `CHECKPOINT BEGIN: PATCHD:[...]` -> steps through NAND firmware, system volume sealing, kernel cache, baseband/SEP updates.
  - `CHECKPOINT END: PATCHD:[0x0583] success`
  - `CHECKPOINT FINISHED-ENGINES:(SUCCESS)`
  - `CHECKPOINT PROGRESS: SUCCESS (...) -> (initial_engine_success)`
  - `CHECKPOINT BEGIN: PATCHD:[0x0548] ota_result_success`
- Check timestamps in `ota_patch.txt` (GMT) against local time to verify when the update executed.
