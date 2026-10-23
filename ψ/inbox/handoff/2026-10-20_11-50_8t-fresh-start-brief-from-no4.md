# 8T fresh start — joint brief No.5 + No.4 (Bo 11:50: "เปลี่ยนเป็น fable 5.1 แล้วทำงานใหม่ … ทำให้ดีกว่ารอบนี้")

Model now: cc/claude-fable-5-1 (desired-state.yaml, pin, settings.json updated by No.4).
Prior detail: ψ/inbox/handoff/2026-10-20_11-43_8t-r36-live-goal-sensors-rearcam.md

## Facts (verified today, evidence in journal)
1. **Modem**: warm reset (PON 0x08c2=0x02, PS_HOLD) → SDX55 dead (`Recovery failed: -25`, Sahara 2 images). Cold `systemctl reboot` (08c2=0x00) → modem OK. 14/14 boots consistent.
2. **Warm resets today** were triggered by live experiments (actual_brightness DCS read on r35, rear cam cam -c/i2c, SLPI remoteproc). r36 (#37 running) removed get_brightness → actual_brightness read 5x = dsi_err 0.
3. **Boot green/noise flash** = ABL→kernel handoff, `DSI PLL(0) lock failed` @0.39s every boot. Vertical lines = known HW, don't touch.
4. **Black after boot with DSI On / bl=1500 / dsi_err 0**: woken by `/usr/local/bin/clubs8t-screen-on` (11:4x, Bo: จอติด). Unknown WHICH step wakes it (kscreen-doctor --dpms on / bl_power=0 / brightness 1000→1500).
   - No.4 review: patch 0032 (enable() → backlight_update_status) is likely a NO-OP: drm_panel.c:255-262 drm_panel_enable() already calls backlight_enable() right after funcs->enable(). Don't ship 0032 as "the fix".
   - Suspects: powerdevil ("Handle button events action could not check for screen configuration" every boot), desktop-restore.service runs `kscreen-doctor -o` before KWin → ABRT core every boot @~13s. Bo pressed power 3x at 11:41 (each press toggles screen).

## Rules (both seats)
- One owner on the phone at a time: **No.5 drives the 8T; No.4 = reviewer/verifier only** (read-only ssh, never actual_brightness, never reboot).
- Before ANY reboot/install: post plan to No.4 (oracle main) + Bo, wait for No.4 ack.
- No live experiments that can warm-reset (rear cam, SLPI, remoteproc). Offline/VM only.
- Every claim to Bo needs command output. Bo: Thai, short, no raw logs.
- Reboot = cold only (`echo cold > /sys/kernel/reboot/mode; systemctl reboot`).

## Plan (in order, stop after each and verify)
1. Black-screen root cause (highest priority, Bo-visible):
   a. Add debug dev_info in r37: samsung_amb655x_on/_off/prepare/unprepare + bl_update_status (value, ret) → see who turns panel off/on at boot. Build in VM; No.4 reviews diff before install.
   b. Fix desktop-restore ordering (After=plasma-kwin_wayland.service / wait for wayland socket) — userspace, no reboot needed to stage.
   c. Next cold reboot: if black → run screen-on steps ONE at a time, ask Bo after each → know the real trigger.
2. Boot noise: reserve cont_splash in DT + keep ABL PLL (don't reset PHY) → r37/r38 candidate, offline first.
3. Modem after warm reset: Bo still deciding on clubs8t-modem-coldboot (disabled). Don't enable without Bo.
4. Then sensors (SSC registry writable copy), rear cam (offline), GPS/SMS/call (need Bo).

## Verify gate after every boot (No.4 runs it)
uptime · uname -v · 08c2 · `dmesg | grep -c dsi_err_worker` = 0 · /dev/wwan0mbim0 · DSI dpms · spectacle frame size · Bo confirms screen lit.
