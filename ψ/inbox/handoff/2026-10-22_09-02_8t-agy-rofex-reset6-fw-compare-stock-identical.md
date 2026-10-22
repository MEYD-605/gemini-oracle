# Handoff: Clubs8T — agy via rofex, reset #6, slow boot traced, firmware == stock

**Date**: 2026-10-22 09:02 (+07)
**Context**: ~42% → /forward --only → /clear
📡 Session: f9210020 | cartographer-oracle | 08:16 → 09:02
**Model**: cc/claude-fable-5-1

## Context
**Oracle**: No.5 GmForge · **Human**: Bo (พี่โบ, he/him) · Discord DM `1470628889826037840`
Previous handoffs (same dir): `2026-10-22_07-57_no5-session2-wrap-…` (pointer) → `2026-10-22_00-20_8t-cap-audit-…` (full night detail, addenda 01:08/01:15/02:55/06:56).

## What We Did
- **Bo 08:18 "8T ถึงไหน / app linux agy ide ทำไมไม่ทำงาน"** → status DM, then diagnosed `agy`: host pmOS is musl, Antigravity IDE 1.1.3 is glibc Electron (29 libs not found). Inside distrobox `rofex` the 00:02 reset had left `libnspr4.so`/`libnss3.so` **0-byte** (`file too short`) → `apt --reinstall`; `native-keymap` needed `libxkbfile1`; IDE spawned host `ash` → `SHELL=/bin/bash`. New `/usr/local/bin/agy-ide` (enters rofex, Wayland env, `ulimit -c 0`, log `~/apps/agy-launch.log`, binary copied to `~/apps/antigravity-ide` because rofex binds /home only; old launcher `.bak-20261022`; `.desktop` → `agy`). Verified 2 clean launches GPU-off, screen off.
- **Bo 08:27 "ลด clock อีกแล้วหรอ"** → showed caps are full (cpu7 2.84 GHz, GPU 587 MHz); flag was only `--disable-gpu` inside the IDE. Tested `AGY_GPU=1`: ran, then **reset #6 08:35:41** while Bo entered it with screen ON. Trail: Firefox GPU process `GraphicsCriticalError` 08:35:26, kwin `Could not create udmabuf: Invalid argument` ×35 in 2 s, then silence; ramoops empty, powerlog rails normal. Antigravity logged nothing. Default reverted to GPU OFF (`AGY_GPU=1` opt-in). Sombo's GPU-client→PS_HOLD reading now 6/6, still unproven.
- **Bo 08:37 "จอขึ้นนานมาก"** → measured 71 s boot-to-lockscreen on 5 boots: `xdg-desktop-portal` starts 22 s, every KDE app "Failed to register with host portal" at 43 s, portal Started 48 s (waits on kwallet Secret backend, `portals.conf Secret=kwallet`), session Startup finished 51 s, lockscreen overlay 71 s. Also `gmatom.service` 10 s on default.target. Fix offered (drop Secret=kwallet / mask plasma-kwallet-pam; gmatom After=graphical-session). **Waiting Bo GO.**
- **Bo 08:31 "เมื่อคืนให้ทำ UEFI + เทียบ firmware เก่า ทำหรือ"** → answered honestly: last night was assessment only, no port, no compare. Then did the compare (Bo 08:44 "หาจากเน็ตก็ได้"): phone = **KB2003 EU** (`param` = KB2003_15_220218), **LPDDR5** (dt `ddr_device_type`=8 → `xbl_lp5` set only; plain xbl = brick). slot_b xbl/aop dated 2023-12-04 ⇔ OOS 13.1.0.583 (KB2003_11.F.70), slot_a 2023-06-12 ⇔ 13.1.0.580 (11.F.67). Found links in XDA thread 4193183 (via r.jina.ai), gauss allawnofs URLs need Android Dalvik UA (403 otherwise), downloaded both full OTAs (4.75 + 4.67 GB), dd'd both slots' partitions read-only, `payload-dumper-go -p`, `cmp -l -n`. **Result: every signed partition byte-identical** (xbl_lp5, xbl_config_lp5, abl, aop, tz, hyp, keymaster, uefisecapp, imagefv, devcfg, cmnlib(64), qupfw, storsec, featenabler, multiimgoem, bluetooth, dsp, vbmeta); only dtbo_b (= our pmos-kebab-dtbo, 284 B) and logo (OTA blank) differ. No firmware drift; nothing to "restore". Reported with table 08:58. Nothing flashed.
- Memory: `clubs8t-agy-antigravity-runs-in-rofex` (+reset #6 addendum), `clubs8t-stock-oos-identity-and-gauss-download`. HAOS c982feb0, 4be2b037. v4 bn7MGJ_sJ7dZC9DhWNwsq, QMmirMJqOZJZu1PVceFWd. Fleet: No.1 08:28/08:51/08:58; Sombo 08:28/08:51/08:58/09:00 (udmabuf: user IS in video, error is EINVAL not EACCES; Sombo recorded 94f95636).
- Git: focus a51cbaa → 26218cb; report 4acf0da (`ψ/data/clubs8t/REPORT-fw-compare-20261022.md` + `compare-fw.sh`). main == origin.

## Pending
- [ ] **Bo decision (asked 08:58)**: slow-boot fix (1 reboot to measure) — GO?
- [ ] **Bo decision**: UEFI kebab port on boot_a (2–3 days, edk2-msm sm8250/instantnoodlep base) now, or PS_HOLD root cause first?
- [ ] PS_HOLD experiments A–D (stress-ng+SIGKILL / glmark2+SIGKILL / GPU floor 305 / waydroid) — Bo GO + screen OFF + dmesg/powerlog streamed
- [ ] Sombo's discriminating test (later, Bo GO, quiet phone): check kwin 6.8 source/env for a udmabuf-disable switch (do NOT guess the name), map IDE+Firefox with it off; resets stop → fallback path implicated, continue → marker only
- [ ] NewPipe (`clubs8t:~/NewPipe.apk`) after PS_HOLD understood
- [ ] D-047 — no action for No.5 (No.1 seq 49)
- [ ] Thermal prime 2.84→2.42 offer unanswered
- [ ] Phone-side `/tmp/fwdump.copied-to-maclab-0849` (273 MB tmpfs) — delete next session or on reboot it's gone

## Next Session
- [ ] `/recap` → read this. `ssh clubs8t 'awk "/^btime/" /proc/stat; uptime'` — if btime ≠ 1792632983: `sudo tail -60 /var/lib/systemd/pstore/console-ramoops-0` FIRST
- [ ] Re-arm 8T monitor (btime-based; the journalctl-boot-id version false-fires)
- [ ] If Bo GO on slow boot: back up `~/.config/xdg-desktop-portal/portals.conf`, drop `Secret=kwallet`, `systemctl --user edit gmatom.service` → `After=graphical-session.target`, reboot, re-measure `journalctl --user -b -o short-monotonic | grep -E "Portal service|Initialized overlay"`
- [ ] If Bo GO on UEFI: start from `~/oneplus-8t-prep/`, clone edk2-msm, boot_a target only, boot_b untouched

## Key Files
- clubs8t: `/usr/local/bin/agy-ide` (+ `.bak-20261022`), `~/apps/antigravity-ide/`, `~/apps/agy-launch.log`, `~/.config/xdg-desktop-portal/portals.conf`, `~/diag/desktop-restore.sh`, `/var/lib/systemd/pstore/{console-ramoops-0,archive/}`, `/var/log/powerlog/`
- maclab: `~/oneplus-8t-prep/stock-ota/` (2 OTA zips, `extract-F70/`, `extract-F67/`, `device-dump/`, `compare-fw.sh`, `REPORT-fw-compare-20261022.md`), `/tmp/8t-agy/agy-ide` (launcher source), `/tmp/8t-agy/user.log` (87 KB journal stream 08:21–08:59)
- cartographer: `ψ/focus.md` (26218cb), `ψ/data/clubs8t/`

## Next Session: Pick Your Path

| Option | Command | What It Does |
|--------|---------|--------------|
| **Continue** | `/recap` | Read this, check 8T btime, re-arm monitor, act on Bo's 2 decisions |
| **Clean up first** | checklist below, then `/recap` | optional |
| **Fresh start** | `/recap --quick` | Minimal context |

### Cleanup Checklist
- [ ] Untracked pre-existing strays (`*.bak.*`, `app/`, `bun.lock`) — leave unless Bo says
- [ ] 19 stale local branches (backup/*, feat/*, fix/*, rescue/*, sweep/2026-10-22-catchup…) — not mine, leave
- [ ] Open PRs #25, #2 — pre-existing, not mine
- [ ] `/tmp/8t-agy/` on maclab (launcher source + 2 journal logs) — harmless
