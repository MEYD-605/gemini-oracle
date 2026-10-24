# Handoff: Clubs8T Kernel 7.2.0-r29 (#30) q6voice Cellular Call Audio + 60Hz Default + GmAtom Buddy

**Date**: 2026-10-18 12:40
**Context**: ~38%
📡 Session: c97bdb38 | cartographer-oracle

## What We Did
- **3 Closed-Loop `/goal` Missions Completed (`status: DONE`, 100% command-verified via `~/.claude/hooks/goal.py`)**:
  1. **Goal 1 — Clubs8T End-to-End Audit & GmAtom Buddy Pairing (`8/8 DONE`)**:
     - Fixed KDE Mobile Lockscreen PIN freeze in `/usr/share/plasma/shells/org.kde.plasma.mobileshell/contents/lockscreen/LockScreenState.qml` (added `promptReady` + `warmupTimer` + 4s `authWatchdogTimer` to fix `Received prompt response, but no pending prompt was found!`), masked `fprintd.service`, and cleaned `/etc/pam.d/kde-fingerprint` & `kde-smartcard`.
     - Fixed boot-time `*ERROR* failed to load a650_sqe.fw` on `/dev/tty1` by bundling `/lib/firmware/qcom/a650_*` into `/etc/mkinitfs/files/10-adreno-a650-firmware.files`, setting `loglevel=3 vt.global_cursor_default=0` in `/etc/kernel-cmdline.d/10-quiet-console.conf`, flashing `boot_b`, and installing `/etc/apk/commit_hooks.d/99-sync-boot-b.sh`.
     - Suppressed the 75Hz `tcpm-source-psy` USB-PD VDM uevent storm (`3.29M` events that burned 8h CPU in `udev-worker` + 1.7h in `upowerd`) via `/etc/udev/rules.d/50-ignore-tcpm-psy-storm.rules` (`ENV{UPOWER_IGNORE}="1", OPTIONS+="ignore_device"`).
     - Removed `postmarketos-ui-phosh`, `greetd-phrog`, `calls`, `chatty` bloat; configured `/etc/greetd/config.toml` fallback session to Plasma Mobile; archived old migration dirs into `~/.staging-archive/`.
     - Wired `gmatom` (`Clubs8T`) as Primary Buddy with `05-gmforge` (`MacLab`): enabled `--channels plugin:oracle-channel@oracle-registry`, enabled MQTT fleet tools (`send_to_oracle`, `list_fleet`, `oracle_replies`) on `gmatom`'s isolated `:8102` `arra-memory`, synced all MacLab skills (`apk-surgeon`, `goal`, `pstack`, 0 broken symlinks) + `goal.py` + `tier-{cheap,standard,deep}.md` agents + `Oneplus-8T-kebab-pmos-bringup` repo.
  2. **Goal 2 — Kernel `7.2.0-r28` (`#29`) Native 60Hz Default + Passwordless Boot + 100% Power-Saving Suite (`5/5 DONE`)**:
     - Built & flashed `0026-drm-panel-amb655x-default-60hz-and-hs-backlight.patch` (audited by Opus subagent): exposes `1080x2400@60.00*!` (`vfp=1208`) as `DRM_MODE_TYPE_PREFERRED`, keeps `1080x2400@120.00` (`vfp=4`) as secondary, writes panel DDIC `0x60 = 0x00` (60Hz) when `vrefresh <= 90`, and sends backlight updates (`0x51`) in High-Speed mode.
     - Disabled lockscreen on boot/resume (`~/.config/kscreenlockerrc`: `Autolock=false`, `LockOnResume=false`, `LockOnStart=false`, `Timeout=0` + `/etc/pam.d/kde`: `auth sufficient pam_permit.so`) -> reboots straight to unlocked home screen in ~15–25s.
     - Verified full power-saving suite with `gmatom`: `tuned` `powersave`, Wi-Fi `power_save on`, PowerDevil 60s dim / 120s DPMS off (`LockBeforeTurnOffDisplay=false`), `clubs8t-power-cap.service` (CPU 1.86GHz / GPU 441MHz), Waydroid `suspend_action=freeze`.
  3. **Goal 3 — Kernel `7.2.0-r29` (`#30`) In-Call Cellular Voice Audio (`q6voice` / `CS-VOICE` + `q6voice-mhi` 128KiB SMMU Mailbox) (`4/4 DONE`, `52/52 PASS`)**:
     - Ported `q6mvm`, `q6cvs`, `q6cvp`, `q6voice-cal`, `q6voice-dai`, `q6voice-mhi`, `q6core`, and `apr` DMA configure (`0027-ASoC-qcom-qdsp6-add-q6voice-support-for-sm8250-sdx55.patch` + `sm8250-oneplus-kebab.dts` + `CONFIG_SND_SOC_QDSP6_Q6VOICE*=y`) and added `AUDIO_VOICE_0` (ch 80 offload UL) to `modem_qcom_sdx55_fusion_channels` in `pci_generic.c`.
     - Verified `mhi0_AUDIO_VOICE_0` bound to `q6voice-mhi` and `/sys/kernel/debug/q6voice-mhi/config` reports `sent/held adsp: 0x1ffdc0000`, `sent/held pcie: 0xffe60000`, `sent/held size: 0x20000` (128 KiB).
     - Tuned `/usr/local/bin/kebab-voice-topology` for OnePlus 8T (`bypass_topology=Y`, `rx_rate=48000`, `rx_bits=16`, `rx_channels=1` on `TERTIARY_MI2S_RX` `0x1004` + `VA_CODEC_DMA_TX_0` `0xb021`) -> verified live bidirectional `CS-VOICE` (`hw:0,2`) session bring-up on ADSP CVD `2.4` with 0 errors across all 15 ADSP commands.
     - Installed `q6voiced` (`hw:0,2`), `/usr/lib/firmware/qcom/q6voice-*.bin`, `VoiceCall.conf` UCM, `kebab-call-route.service`, `plasma-dialer`, and `spacebar`.
     - `/usr/local/bin/clubs8t-verify-all` passed **52/52 checks (`0 failed, 0 skipped`)**.

## Pending
- [ ] Optional future hardware enhancements on `Clubs8T` if Master Bo requests: SLPI sensors via `hexagonrpcd-apollo` + `/dev/sda2` (`persist`) factory sensor registry (`/mnt/persist/sensors/registry/registry/`), or rear camera sensors (`IMX586` / `IMX481`).

## Next Session
- [ ] Run `/recap` and check `ψ/focus.md`
- [ ] Verify `Clubs8T` status with `ssh 8t-ts '/usr/local/bin/clubs8t-verify-all'` (expect `52 checks passed, 0 failed`)

## Key Files
- `/Users/admin/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/kernel/APKBUILD` (`pkgrel=29` -> `#30`)
- `/Users/admin/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/kernel/sm8250-oneplus-kebab.dts`
- `/Users/admin/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/kernel/0026-drm-panel-amb655x-default-60hz-and-hs-backlight.patch`
- `/Users/admin/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/kernel/0027-ASoC-qcom-qdsp6-add-q6voice-support-for-sm8250-sdx55.patch`
- `/Users/admin/oneplus-8t-prep/tools/linux-postmarketos-qcom-sm8250-7.2.0-r29.apk` & `boot-r29.img`
- `8t-ts:/usr/local/bin/clubs8t-verify-all` & `8t-ts:/usr/local/bin/kebab-voice-topology`
