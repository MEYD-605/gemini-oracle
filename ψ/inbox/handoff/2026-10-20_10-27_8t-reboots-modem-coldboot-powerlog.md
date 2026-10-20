# Handoff: 8T reboots traced to No.4, modem cold-boot service, 7-day powerlog

**Date**: 2026-10-20 10:27 (GMT+7)
**Previous handoff**: ψ/inbox/handoff/2026-10-19_20-30_mp2762a-r35-and-imx586-camera.md (r35 / IMX586 still open)

## What We Did
- **"Screen/phone off" this morning, root cause found in the 8T journal:** the 3 reboots (09:58 cold, 10:01 warm, 10:05) were `systemctl reboot` issued by No.4 MIMO over ssh from 100.83.0.1 while testing a modem fix. Not a display fault, not a brownout. The later blank screens at 10:13 and 10:18 were Bo pressing the power key ("Power key pressed short"). Told Bo and No.4.
- **Modem (SDX55):** last night after a warm reset Sahara sent only 2 images and then `Recovery failed: -25`. PCI remove/rescan did not bring it back. No.4's theory (a warm reset leaves SDX55 half-alive; only a cold reboot power-cycles it) matches. After the 10:05 boot the modem is up (`/dev/wwan0qmi0`, ModemManager Modem/0).
- **No.4 installed `clubs8t-modem-coldboot.service` (enabled):** if wwan is missing 60 s after boot and dmesg shows a PCIe "Recovery failed", it reboots the phone itself (loop guard: at most once per 20 min). **Bo has not decided whether to keep it.** I touched nothing.
- **Installed `clubs8t-powerlog.service` (mine, enabled):** `/usr/local/sbin/clubs8t-powerlog.sh` writes `/var/log/powerlog/power-YYYYMMDD.log` every 10 s (VBAT/IBAT/SoC/temp, charger online, VSYS/VBUS/IBUS from the MP2762A ADC, CPU/GPU freq, backlight, load). It also writes `procs-YYYYMMDD.log` (top 7 every 60 s) and deletes logs older than 7 days. Verified it is writing. Bo asked for 7 days of history.
- **Backlight unlocked at Bo's request:** removed my `chmod 0444` from `/usr/local/sbin/clubs8t-power-cap.sh`. The backup is `~/clubs8t-power-cap.sh.bak-bl-unlock-0027` on 8T. Brightness is user-writable again. The DSI error (`cmd dma tx failed type=0x37 ret=-110`) still appears about 130 s after every boot, and the screen stays on after it. Root cause not fixed.
- **GmAtom changes seen on 8T:** `/usr/local/bin/clubs8t-screen-off` (dpms off and backlight 0) was created 06:13 on 10-20, and `~/.config/powerdevilrc` was edited 06:37. I found nothing that calls screen-off on a schedule.
- **Corrections I made to Bo this session (avoid repeating):** I first said Waydroid was "installed". It had been removed (only `/var/cache/apk/waydroid-*.apk` remains). I said the sdx55m firmware was missing because I looked at the wrong path. It is in `/usr/lib/firmware/sdx55m/`, intact.
- **Comet browser:** Perplexity ships Mac/Windows/iOS/Android only, with no Linux build. I offered Chromium (in repo) or the Android app via Waydroid (would need reinstalling). Bo did not pick one.

## Pending
- [ ] Bo decision: keep or disable No.4's clubs8t-modem-coldboot auto-reboot. I asked No.4 to notify before any auto/manual reboot of 8T.
- [ ] Find why the DSI DCS read fails ~130 s after boot (type 0x37 = set max return packet size, ret -110). Likely a panel driver `get_brightness`/DCS read path (0001 amb655x patch `samsung_amb655x_bl_get_brightness` calls `mipi_dsi_dcs_get_display_brightness_large`). Not confirmed.
- [ ] Use powerlog data to answer Bo's "why does it eat battery". It needs some hours or days of samples first.
- [ ] Carried from the previous handoff: r35 MP2762A (REG0F) not flashed or verified, and the IMX586 rear camera has no patch yet.
- [ ] Hardware-100% list for Bo: modem stability across warm resets, the rear camera, the DSI boot error, and battery drain.

## Next Session
- [ ] Read `/var/log/powerlog/` on 8T and summarize battery draw by state (screen on/off, game, idle) with the top processes.
- [ ] Look at the AMB655X backlight `get_brightness` DCS read as a suspect for the ~130 s DSI error (read-only first).
- [ ] Ask Bo about modem-coldboot, then follow up on r35 and IMX586 with No.4.

## Key Files
- 8T: /usr/local/sbin/clubs8t-powerlog.sh, /etc/systemd/system/clubs8t-powerlog.service, /var/log/powerlog/
- 8T: /usr/local/sbin/clubs8t-modem-coldboot (No.4), /usr/local/bin/clubs8t-screen-off (GmAtom), /usr/local/sbin/clubs8t-power-cap.sh
- maclab: ~/oneplus-8t-prep/r35-stage/, ~/oneplus-8t-prep/backup-boot-20261019/boot_b-r32.img
