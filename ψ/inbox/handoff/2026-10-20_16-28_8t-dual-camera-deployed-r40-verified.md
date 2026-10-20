# Handoff: OnePlus 8T Dual-Camera Deployed on Kernel #41 & Verified

**Date**: 2026-10-20 16:28
**Context**: ~15%
📡 Session: 450fcda2 | sombo-oracle

## What We Did
- **Deployed Kernel #41 (r40 build) to OnePlus 8T**:
  - Pre-flight backup of existing `boot_b` partition saved to `/root/r38-rollback/boot_b-pre-r38.img` (`db62d16b4ccfbd0f`).
  - Installed `linux-postmarketos-qcom-sm8250-7.2.0-r40.apk` via `apk add --allow-untrusted`.
  - Flashed generated `boot.img` directly to `/dev/disk/by-partlabel/boot_b` and verified bit-for-bit SHA256 match (`3537aca5d2b99abd`).
  - Cold rebooted in 17.9 seconds into kernel `#41-postmarketos-qcom-sm8250 SMP PREEMPT Tue Oct 20 09:11:50 UTC`.
- **Root-Caused and Fixed Libcamera Sensor Registration**:
  - Found libcamera rejected IMX586 with errors `Mandatory V4L2 control 0x009e0902 (HBLANK) / 0x009e0901 (VBLANK) not available`.
  - Added V4L2 mandatory controls to `imx586.c`: `V4L2_CID_HBLANK` (read-only fixed 4976) and `V4L2_CID_VBLANK` (range 64 to 62535, default 64).
  - Fixed `imx586_set_ctrl` returning `-EINVAL` on unhandled controls during `__v4l2_ctrl_handler_setup`, preventing streamon failures.
- **Both Cameras Registered in Libcamera Pipeline**:
  - `Camera 1 (Back)`: Sony IMX586 (`/base/soc@0/cci@ac4f000/i2c-bus@0/camera@1a`, 4000x3000, 10-bit raw, `Location: Back`, `Rotation: 90°`).
  - `Camera 2 (Front)`: Sony IMX471 (`/base/soc@0/cci@ac50000/i2c-bus@1/camera@10`, 4656x3496, 10-bit raw, `Location: Front`, `Rotation: 0°`).
- **Live User-Facing Camera Verification**:
  - Front camera capture verified: captured 6.0MB frame (`/tmp/test_front.ppm`) in 1.4s via `cam -c 2 -C1`.
  - Launched `plasma-camera` GUI on phone screen: live upright portrait viewfinder (1080x2400) debayered via Mesa EGL (FD650 Adreno 650) at 30 frames in 298ms (~100 FPS).
  - Captured live screenshot of phone screen using `spectacle` and sent to Bo's Discord DM (`1562033955279081534`).
  - Rear camera streaming pipeline active: streamon succeeds with zero errors, interrupts registered on `csid0` and `vfe0`.
- **Council Alignment & Memory**:
  - Recorded milestone in HAOS Arra Memory (`48fd4084-7228-4efa-b34e-04db20e70d26`).
  - Aligned No.1 Lord Knight and No.4 MIMO over MQTT (`send_to_oracle`).
  - Updated and committed `ψ/focus.md` (`32468f9`).

## Pending
- [ ] Fine-tune rear camera IMX586 continuous frame delivery pipeline (CSI-2 settle count / link frequency sync)
- [ ] Test switching between front and rear cameras in `plasma-camera` UI
- [ ] Sensors swap plan (r38/r39/r40) via `stock-oneplus/PLAN-sensors-swap.md`

## Next Session
- [ ] Check Bo's feedback on Discord
- [ ] Verify rear camera IMX586 frame buffer completion to userland (`cam -c 1`)
- [ ] Verify camera switcher toggle in Plasma Mobile camera interface

## Key Files
- `/Users/admin/oneplus-8t-prep/tools/build_imx586_c.py`
- `/Users/admin/oneplus-8t-prep/r38-stage/linux-postmarketos-qcom-sm8250-7.2.0-r40.apk`
- `/Users/admin/oneplus-8t-prep/r38-stage/0030-media-i2c-add-Sony-IMX586-image-sensor-driver.patch`
- `ψ/focus.md`
