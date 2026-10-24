# Handoff: OnePlus 8T stabilization + Vivo K PLUS fix + /goal verified

**Date**: 2026-10-18 21:36
**Context**: ~
📡 SESSION: 9_5bf4ed | ตรวจสอบมาตรฐาน VM Grok | msgs=292 | cc/claude-opus-5-5

## What We Did
- OnePlus 8T (`kebab`): confirmed Kernel 7.2.0 r27 (#28) stable, no more `dsi_err_worker` crash loop. No.5 compiled it in OrbStack VM `oneplus-builder` on MacLab.
- Fixed MacLab default-route hijack when 8T is plugged in via USB-C (networksetup -ordernetworkservices, Wi-Fi now above the 8T NCM interface).
- Recovered SDX55 modem from PCIe D3cold lockup via full `systemctl poweroff` + manual cold boot (warm reboot does NOT work — hard rule now).
- Verified SDX55 4G-only AIS data works for real: ping 0% loss + HTTPS fetch succeeded over `mhi_hwip0` with Wi-Fi forced off.
- Changed OnePlus 8T user `clubslinux8t` password to `225566` (sudo NOPASSWD still intact, SSH key still works).
- Diagnosed vivo X Fold 3 K PLUS (KBank banking app) `ErrorFullPageActivity` loop on `VerifyMobileNoActivity`: root cause is the phone's two Accessibility Services (`com.example.androidmcp/.McpAccessibilityService` and `com.vivo.ai.gptagent/.t2a.v2.observe.accessibility.T2AAccessibilityService` — used by bots for remote screen control) tripping K PLUS's security check. NOT TSF (`com.tsf.shell`) — tested isolating it, TSF was not the cause.
- Disabled both Accessibility Services on vivo (`settings delete secure enabled_accessibility_services` + `accessibility_enabled 0`) at Bo's request after a repeat lockout — confirmed persistent after 20s, no auto re-enable. **Bot cannot remote-control vivo screen until Bo re-enables them.**
- Verified `/goal` slash command is live in this Hermes build (separate from `agent.max_turns`/`goals.max_turns` config key) — subcommands: `/goal <text>`, `status`, `pause`, `resume`, `clear`.
- No.5 GMForge is mid-flight on a long kernel bring-up session (17h+, still active, not stuck) fixing OnePlus 8T camera (IMX471 driver), sensors (accelerometer/gyro via SLPI/hexagonrpcd), GPS, haptics. `hexagonrpcd-sdsp.service` confirmed running. 8T test host (`8t-ts`) stable, no reboot loop.

## Pending
- [ ] Re-enable vivo Accessibility Services (`androidmcp` + `vivo.ai.gptagent`) when Bo is done with K PLUS and wants bot remote-control back — do NOT re-enable preemptively, caused repeat lockout last time.
- [ ] 60Hz refresh rate on OnePlus 8T explicitly deferred to kernel r28 (amb655x panel timing needs binary patching, not just config) — do not attempt in r27.
- [ ] SDX55 modem: NEVER run `soc_reset` via sysfs or write to `/dev/mem` GPIO registers directly — this caused two PCIe lockups requiring cold boot. Only fix is full poweroff + physical power button.
- [ ] No.5's camera/sensor/GPS/haptics bring-up on 8T still in progress — not blocking, just long-running.

## Next Session
- [ ] If K PLUS breaks again on vivo after re-enabling accessibility services, this is expected — plan a workflow to toggle them off only during banking app use (user asked for options: manual toggle / auto toggle shortcut / remove persistent accessibility dependency).
- [ ] Check in on No.5's kernel bring-up progress (camera/sensor/GPS/haptics) — expect long duration, not stuck.
- [ ] Monitor 8T for any repeat spontaneous reboot; if modem drops again, cold boot only (see Pending).

## Key Files
- `~/.hermes-no4/cache/scratch/vivo_a11y_backup.txt` — backup of original vivo `enabled_accessibility_services` value before disabling (`com.example.androidmcp/.McpAccessibilityService:com.vivo.ai.gptagent/.t2a.v2.observe.accessibility.T2AAccessibilityService`)
- `/etc/systemd/system/ModemManager.service.d/20-clubs8t-wait-modem.conf` (on 8T) — modem boot delay
- `/usr/local/sbin/clubs8t-modem-watchdog` (on 8T) — 4G-only enforcement watchdog
- `linux-postmarketos-qcom-sm8250-7.2.0-r27.apk` — stable kernel, built on MacLab OrbStack VM `oneplus-builder`
