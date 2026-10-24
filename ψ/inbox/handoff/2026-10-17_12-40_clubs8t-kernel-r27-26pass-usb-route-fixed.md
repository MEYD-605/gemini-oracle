# Handoff: Clubs8T Kernel 7.2.0-r27 (#28) Flashed & Verified 26/26 PASS + MacLab USB Route Fixed

**Date**: 2026-10-17 12:40
**Context**: ~42%
📡 Session: ad2b3610 | cartographer-oracle
**Model**: `ag/gemini-4-argon-medium[1m]` (pinned in `~/.claude/channels/discord-no5/anthropic-model`, `~/.claude-no5/settings.json`, and `sombo-oracle/fleet/desired-state.yaml`)

## What We Did
- **Root-Cause Forensics on Clubs8T Hard Resets**:
  - Captured and analyzed `console-ramoops-0` + PMIC PON registers (`0x8C5 POFF_REASON1 = 0x02` `PS_HOLD`, `0x8C7 OFF_REASON = 0x80`) + `sm8250-7.2.0` kernel sources via 3 parallel subagents.
  - Identified 2 exact kernel crash mechanisms:
    1. **USB-C DP Unplug Bus Fault (`dp_display.c`)**: `msm_dp_display_disable()` turned off DP controller/PHY clocks before clearing `msm_dp_display->power_on = false`. Concurrent `vblank timeout` triggered `disp_snapshot` thread -> `msm_dp_snapshot()` read unclocked DP registers -> `Internal error: synchronous external abort: 0000000096000010` -> watchdog reset.
    2. **Runtime DCS OPP Drop + Endless Frame-Done Timeout Storm (`dsi_host.c` & `dpu_encoder.c`)**: Every runtime DCS backlight command (`0x51`) ran `msm_dsi_host_xfer_restore()` -> `dsi_link_clk_disable_6g()` -> `dev_pm_opp_set_rate(dsi, 0)` (not refcounted), dropping `SM8250_MMCX` to `LOW_SVS (64)` while scanning out at 120Hz, causing `dsi_err_worker: status=4` (`DSI_ERR_STATE_FIFO`, which did not call `dsi_sw_reset()`) and an endless `dpu_encoder_frame_done_timeout` loop (`frame_busy_mask` never cleared).
- **Built, Flashed & Verified Kernel `7.2.0-r27` (`#28-postmarketos-qcom-sm8250`)**:
  - Added 4 targeted patches (`0022`..`0025`) to `jfbobier/Oneplus-8T-kebab-pmos-bringup/kernel/` (`pkgrel=27`):
    - `0022-drm-msm-dpu-bail-out-of-an-endless-frame-done-timeou.patch` (`optional/0002`)
    - `0023-usb-typec-qcom-widen-the-vSafe5V-poll-tolerance.patch` (`optional/0003`)
    - `0024-drm-msm-dp-clear-power_on-before-clock-off-and-guard.patch`
    - `0025-drm-msm-dsi-fix-runtime-dcs-opp-drop-and-fifo-reset.patch`
  - Saved 60Hz mode patch separately at `kernel/optional/0004-OPTIONAL-drm-panel-amb655x-expose-60hz-and-fix-120hz-vfp-lpm.patch` for future `r28` if needed (per No.4 MIMO peer review).
  - Built in OrbStack `oneplus-builder` VM (`jobs=8`, `nice -n 19`), verified SHA256 (`6f27d369b54c0149adec209821080288017fe05661ff26f5fab1ba4553debf41`) with No.4 MIMO.
  - Backed up `r26` (`/root/r26-backup/{boot,boot_b-r26.img,modules-7.2.0}` and flashed `boot_b-r26.img` to `boot_a` `/dev/sde11`).
  - Installed `linux-postmarketos-qcom-sm8250-7.2.0-r27.apk`, pinned in `/etc/apk/world`, flashed regenerated `/boot/boot.img` (`4e936860a9d67bc8c4ade9c2313f9d1b1c784afa98278c2c5c4b893bdc2b4bad`) to `boot_b` (`/dev/sde35`), and saved copy at `~/oneplus-8t-prep/tools/boot-r27.img`.
  - Rebooted into `#28-postmarketos-qcom-sm8250` and verified `/usr/local/sbin/verify-on-device.sh`: **`26 passed, 0 failed, 0 skipped`**, `dsi_err_worker = 0`, `frame done timeout = 0`.
- **Userspace Audio, Sudoers & RO Hangover Setup on Clubs8T**:
  - Installed & pinned `device-oneplus-kebab=9-r0` and `device-oneplus-kebab-audio=9-r0` + full 4,685B `/usr/share/alsa/ucm2/Qualcomm/sm8250/OnePlus8T/HiFi.conf` (`Speaker`, `HDMI` `DP0 Jack`, `Mic`).
  - Configured `/etc/sudoers.d/90-clubslinux8t-agent` (`NOPASSWD: ALL`, `0440`, `visudo -cf` OK) and `/etc/claude-code/managed-settings.json`.
  - Locked SDX55 modem to **4G-only (`mmcli -m 0 --set-allowed-modes=4g`)** + pinned `/sys/bus/mhi/devices/mhi*/power/control = on` (eliminating AIS 5G NSA `drb-released-at-rrc` / `qrtr3 timed out` drops; verified `curl --interface mhi_hwip0 https://ipinfo.io/org` -> `AS131445 Advance Wireless Network`) and blocked NFC (`rfkill block nfc`, persisted in `/usr/local/sbin/clubs8t-power-cap.sh`).
  - Installed patched `ntdll.so` (`NtLoadDriver` -> `sc.exe start`) into distrobox `ro` (`Hangover 11.16`) and updated `~/ro-launch.sh`.
- **Fixed MacLab USB-C Default Route Hijack**:
  - Reordered macOS network services (`networksetup -ordernetworkservices`) so `(1) Ethernet` and `(2) Wi-Fi` sit above `(5) OnePlus 8T (en11)`, preventing `Router: 172.16.42.1` on `en11` from hijacking MacLab's default gateway when USB-C is plugged in. Verified live with USB-C cable plugged in (`gateway: 192.168.1.1` on `en1`, `172.16.42.1` reachable via `ssh 8t`).

## Pending
- [ ] Optional: Test launching Ragnarok Online (`~/ro-launch.sh`) on Clubs8T when Bo wants to test it on `#28` kernel
- [ ] Optional: Test `r28` (`0004-OPTIONAL-drm-panel-amb655x-expose-60hz-and-fix-120hz-vfp-lpm.patch`) only if Bo wants a 60Hz toggle on the phone panel

## Next Session
- [ ] Run `/recap` to orient and check Clubs8T uptime / zero-reset streak on `#28-postmarketos-qcom-sm8250`

## Key Files
- `/Users/admin/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md`
- `/Users/admin/oneplus-8t-prep/tools/linux-postmarketos-qcom-sm8250-7.2.0-r27.apk`
- `/Users/admin/oneplus-8t-prep/tools/boot-r27.img`
- `/Users/admin/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/kernel/` (`0022`..`0025` patches + `optional/0004`)
