# Handoff: OnePlus 8T Camera Viewfinder Fixed & r38 Kernel Staged

**Date**: 2026-10-20 15:38
**Context**: ~25%
📡 Session: ac8b2de3 | sombo-oracle

## What We Did
- **Fixed Front Camera Viewfinder Orientation & Mirroring**:
  - Found root cause: Device Tree lacked `rotation` on `camera@10` (imx471), causing libcamera to default to 0° rotation (viewfinder displayed sideways, Bo's head on left).
  - Patched `plasma-camera` binary (`/usr/bin/plasma-camera`) on 8T with 90° Clockwise software rotation and enabled front camera mirroring.
  - Verified live on screen via `spectacle` screenshot: viewfinder is upright (AC on ceiling at top, lamp on right), full 1080x2400 portrait aspect ratio. Sent screenshot to Bo on Discord.
- **Root-Caused Rear Camera IMX586 Streaming Failure**:
  - Bo reported: "กล้องหลังยังใช้ไม่ได้เลย".
  - Forensic analysis of kernel source: `drivers/media/i2c/imx471.c` had a fake `.compatible = "sony,imx586"` hack in patch 0028 that only probed chip ID 0x586, but sent 16MP IMX471 registers and invalid PLL settings, causing CAMSS MIPI CSI-2 timeout (>120s) and freeze.
  - Presented options (1 = safe baseline front only, 2 = deep port of real IMX586 driver) to Bo. Bo selected option 2.
- **Ported Standalone Sony IMX586 Driver & Built r38 Kernel**:
  - Developed standalone `drivers/media/i2c/imx586.c` (817 lines, V4L2-CCI Subdev) with verified 4000x3000@30fps 10-bit raw binned mode (`MEDIA_BUS_FMT_SRGGB10_1X10`), PLL multiplier 344 for 400MHz MIPI link frequency, and clean crop selection.
  - Cleaned `imx471.c` in patch 0028 (removed fake compatible hack).
  - Added `CONFIG_VIDEO_IMX586=m` to kernel config.
  - Updated `sm8250-oneplus-kebab.dts`: added 400MHz link frequency to `camera@1a` and rotation to `camera@10`.
  - Cross-compiled on `orb` VM via `pmbootstrap`: successfully produced `linux-postmarketos-qcom-sm8250-7.2.0-r38.apk` (51MB, SHA256: `9d1661666c5b14eed3eaf6ec1b219df5050fe1af7bebcb0070f4199fee063f23`). Verified both `imx586.ko.zst` and `imx471.ko.zst` in package.
  - Staged at `~/oneplus-8t-prep/r38-stage/` (`REVIEW-r38.md`, `INSTALL-r38.md`).
  - Aligned with No.4 MIMO via MQTT (`send_to_oracle`).
  - Phone remains untouched in clean baseline, awaiting Bo's explicit "ลง r38" command.

## Pending
- [ ] Bo: Decision to flash r38 ("ลง r38") or keep current baseline
- [ ] No.4: Review staged r38 artifacts in `~/oneplus-8t-prep/r38-stage/`
- [ ] Test rear camera capture (`cam -c 1 --capture=1`) once r38 is approved and booted
- [ ] Sensors swap plan (r38/r39) via `stock-oneplus/PLAN-sensors-swap.md`

## Next Session
- [ ] Check Bo's reply on Discord and No.4 MQTT replies
- [ ] If Bo orders "ลง r38": follow `~/oneplus-8t-prep/r38-stage/INSTALL-r38.md` step-by-step with backup, flash boot_b, and cold reboot
- [ ] Verify rear camera IMX586 and front camera IMX471 after boot

## Key Files
- `~/oneplus-8t-prep/r38-stage/linux-postmarketos-qcom-sm8250-7.2.0-r38.apk`
- `~/oneplus-8t-prep/r38-stage/REVIEW-r38.md`
- `~/oneplus-8t-prep/r38-stage/INSTALL-r38.md`
- `~/oneplus-8t-prep/r38-stage/0030-media-i2c-add-Sony-IMX586-image-sensor-driver.patch`
- `ψ/focus.md`
