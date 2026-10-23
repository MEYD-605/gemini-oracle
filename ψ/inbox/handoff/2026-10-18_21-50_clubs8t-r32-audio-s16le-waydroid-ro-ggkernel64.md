# Handoff: Clubs8T Kernel 7.2.0-r32 (#33) + PulseAudio S16_LE Fix + Waydroid Boot Fix + RO GameGuard ARM64 Driver

**Date**: 2026-10-18 21:44
**Context**: Post-clear handoff of sessions `1eb2c277` & `6e308279`
📡 Session: 6e308279 | cartographer-oracle

## What We Did
- **Clubs8T Kernel `7.2.0-r32` (`#33-postmarketos-qcom-sm8250`) Built & Flashed to `boot_b` (`58/58 PASS`)**:
  - **In-Call Audio (`q6cvp.c` + `kebab-voice-topology`)**: Fixed Mic `PCM_CHANNEL_FL` (`mapping 1,0` on `0xb021` `VA_CODEC_DMA_TX_0`) + Earpiece/Speaker stereo fan-out (`rx_rate=48000, rx_bits=16, rx_channels=2, mfc_config=true` -> `mapping 1,2` + `mfc 2 channels out of 1` on `0x1004` `TERT_MI2S_RX`).
  - **Modem Sahara `0x9` Recovery (`sahara.c` + `kebab-call-route` + `clubs8t-modem-watchdog`)**: Forced `hello_resp.mode = SAHARA_MODE_IMAGE_TX_PENDING` + `sahara_send_reset()` on `0x09` + CSFB `2g|3g|4g` (`preferred: 4g`).
  - **75Hz USB-PD / `tcpm-source-psy` Storm Eliminated (`tcpm.c`)**: `udevadm monitor --kernel` dropped from **75 uevents/sec ➔ 0 uevents/sec**.
- **Speaker & Waydroid Audio Fix (`PulseAudio` `S16_LE` vs `S24_LE`)**:
  - Found `/home/clubslinux8t/.config/pulse/daemon.conf` had `default-sample-format = s24le`, causing PulseAudio to open `HiFi__Speaker__sink` at `s24-32le` while dual `TFA9874` (`15-0034`/`15-0035`) only unmutes TDM at `S16_LE 48000Hz`.
  - Set `default-sample-format = s16le` and `default-sample-rate = 48000` in both `/etc/pulse/daemon.conf` and `/home/clubslinux8t/.config/pulse/daemon.conf` (`chmod 0444`). Verified `Left/Right POWER: On`, `Left/Right SBSL: On`.
- **Waydroid Auto-Start Fix (`waydroid-session.service`)**:
  - Identified boot-time race in `/var/lib/waydroid/waydroid.log`: `Failed to mount "/run/user/10000/pulse/native" onto "/usr/lib/lxc/rootfs/run/xdg/pulse/native"`.
  - Updated `/home/clubslinux8t/.config/systemd/user/waydroid-session.service` `ExecStartPre` to wait for both `/run/user/10000/wayland-1` and `/run/user/10000/pulse/native`.
- **Display Stability & Thermal Guard (`/usr/local/sbin/clubs8t-power-cap.sh`)**:
  - Restored DPU `perf_mode=2` (`fix_core_clk_rate=460000000`, `ab=3.2GB/s`, `ib=6.4GB/s`) so SM8250_MMCX never underruns during Wine/Waydroid load while keeping CPU Big/Prime capped at `1.28GHz`/`1.07GHz` and GPU at `305MHz`.
- **Ragnarok Online (`Ragexe.exe` + `GameGuard`) on `Clubs8T` (`distrobox ro` / Hangover 11.16)**:
  - Built native `aarch64` `ggkernel64.sys` (`IoCreateDevice` + `IoCreateSymbolicLink` for `\Device\GGKernel64` / `\DosDevices\GGKernel64`) and patched `ntdll.so` (`NtLoadDriver`, `APC_CREATE_THREAD`, `signal_arm64.c`) in `/Users/admin/oneplus-8t-prep/wine-ntload/`.

## Pending
- [ ] Verify SDX55 PCIe2 (`0002:01:00.0`) link-up on cold/warm boot when SDX55 shuts down after unexpected AP reset (`mdm2ap-status` GPIO 3 low)
- [ ] Complete `npggNT.des` WoW64 FEX callback (`PC=0x0` guard in `signal_arm64.c`) for `Ragexe.exe` in `distrobox ro` without triggering screen-on PMIC peak current reset

## Next Session
- [ ] Verify `clubs8t-verify-all` (`58/58 PASS`) + `Waydroid Session: RUNNING` + `HiFi__Speaker__sink s16le 48000Hz` after reboot
- [ ] Coordinate with `No.4` (`04-mimo`) and `No.8` (`08-agy-nano2`) on `Clubs8T` so only one seat touches hardware/sysfs at a time

## Key Files
- `/Users/admin/oneplus-8t-prep/tools/linux-postmarketos-qcom-sm8250-7.2.0-r32.apk`
- `/Users/admin/oneplus-8t-prep/wine-ntload/ntdll.so`
- `/Users/admin/oneplus-8t-prep/wine-ntload/ggkernel64.sys`
- `Clubs8T:/home/clubslinux8t/.config/pulse/daemon.conf`
- `Clubs8T:/home/clubslinux8t/.config/systemd/user/waydroid-session.service`
- `Clubs8T:/usr/local/sbin/clubs8t-power-cap.sh`
