# Handoff: 8T r36 installed, /goal active, sensors + rear camera next

**Date**: 2026-10-20 11:43 (GMT+7)
**Previous**: ψ/inbox/handoff/2026-10-20_10-27_8t-reboots-modem-coldboot-powerlog.md
**Goal file (ACTIVE, Stop hook enforces)**: ψ/goals/2026-10-20_11-30_clubs8t-*.md · checks: `~/oneplus-8t-prep/goal/check.sh <name>` (uses host `8t-wifi`, because tailscale `clubs8t` dies when the clock resets to 1970 after a warm reset)

## ⚠️ Rules learned the hard way today (Bo was furious)
- **Screen black but DSI On → run `ssh 8t-wifi /usr/local/bin/clubs8t-screen-on` FIRST.** Reboots do not fix it. It is now also a user service `clubs8t-screen-on.service` (WantedBy plasma-workspace.target, sleep 8). It should run on its own after boot, but no reboot has tested that yet.
- **Do NOT experiment on the live 8T with the rear camera (cam -c IMX586 + i2c reads) or SLPI remoteproc stop/start/strace.** Each one caused a silent warm reset (11:02, 11:37). A warm reset kills the modem (SDX55), and only a cold `systemctl reboot` brings it back.
- Bo says the vertical lines on the screen are known hardware, so don't fix them. Green/noise during boot = ABL→kernel handoff, `DSI PLL(0) lock failed` @0.38s on every boot (No.4's lead: reserve cont_splash + don't reset the PHY PLL) → r37 candidate.
- Talk to Bo in Thai only.

## Done
- r36 kernel (#37) **installed + verified**: 0030 removes the amb655x get_brightness DCS read (r35 Image has the symbol, r36 doesn't). actual_brightness read 5x → dsi_err 0. 0031 reverts the FIFO sw_reset part of 0025. Rollback: `/root/r36-rollback/{boot_b-r34.img,boot.img-r34,world-r34}`. Install method: remove the `linux-postmarketos-qcom-sm8250><Q1…` pin from /etc/apk/world → `apk add --allow-untrusted` → `dd /boot/boot.img → /dev/disk/by-partlabel/boot_b` → cold reboot.
- Rotate tile: `~/.local/share/plasma/quicksettings/org.clubs8t.quicksetting.rotate` + `~/.local/bin/clubs8t-rotate` (Bo: works). Docked mode stays (Bo).
- Dock: `[Containments][1|4][Folio]` delegateIconSize=40, showFavoritesBarBackground=false, showFavoritesAppLabels=false (note US spelling "Favorites"). plasmamobilerc autoHidePanelsEnabled=true, statusBarScaleFactor=0.8. Scale 2.6 (Bo's).
- GmAtom fixed powerdevilrc PowerButtonAction=8 (lock), no idle dim/off, clubs8t-tv scale 2.6.
- `mnt-vendor-persist.mount` (sda2, **ro**) enabled + hexagonrpcd-sdsp drop-in Requires/After it. Mount verified after cold boot.
- check.sh dsiclean no longer reads actual_brightness.

## /goal status (11:43)
✅ r36 no DCS blackout · ✅ 4G (after cold boot) · ❌ auto-rotate · ❌ rear cam · ❌ GPS · ❌ SMS · ❌ call audio · ❌ modem survives warm reset

## Next
1. **Real sensors (auto-rotate):** `kebab-sensors` IIO in 0028 is a STUB (hardcoded accel 0,-1000,0, lux 250); remove it in r37. Real path = SSC: svc 400 on QRTR node 9 is up, but `ssccli --sensor accelerometer` → "No 'accel' sensor available". sns_reg.conf says `output=/mnt/vendor/persist/sensors/registry/registry`, and persist already has 728 files there. Suspect: the registry gets generated/written and persist is mounted **ro**. Try an overlay or a writable **copy** (do NOT write the real persist partition, it holds calibration). Point hexagonrpcd-kebab `-R` root's persist symlink at the copy, then **cold reboot** (do not restart remoteproc live).
2. **Rear camera:** sensor streams (0x0100=1, frame_count increments) but CSID0 gets 1 IRQ only. Suspect IMX586 PLL/OP regs copied from IMX471 (0x030d/e/f) vs 200MHz link-freq, or CSIPHY0 lane map. Need the stock `com.qti.sensormodule.semco_imx586.bin` (odm.img /lib64/camera) for laneAssign/settle; KEBAB_WORKDIR is not found on maclab, ask No.4. Fix offline only, test in r37.
3. SMS / call: need Bo to place a test SMS/call. GPS: needs to be outdoors. Modem warm reset: No.4's coldboot service is disabled (Bo hasn't decided).
4. Tell No.4 before any reboot/install. Ask Bo what "ไอคอนรีสตาร์ท" means (power menu tile?).
