# Handoff: Clubs8T cap audit → full performance unlock; reset triggers identified; UEFI assessed

**Date**: 2026-10-22 00:20 (+07)
**Context**: 40% (395k / 1M) → /forward → /clear
📡 Session: 1dbe32d3 | cartographer-oracle | ~1h05m (23:16 → 00:20)
**Model**: cc/claude-fable-5-1 (Bo switched No.5 from Opus 5.5 at 23:1x)

## Context
**Oracle**: No.5 GmForge · **Human**: Bo (พี่โบ, he/him) · Discord DM `1470628889826037840`
**Device**: Clubs8T = OnePlus 8T KB2003 (kebab, SM8250) on pmOS edge, kernel 7.2.0 r5x, Plasma Mobile. ssh alias `clubs8t`. Sombo (88) owns 8T config since 10-20 13:27; Bo tonight: **8T is No.5's lab, like No.0 Paladin's VM 101** (memory `clubs8t-is-a-lab-like-no0-vm101`).

## What We Did
- **Bo's question "cap ทำให้เครื่องดับจริงไหม" → NO.** Both 10-21 resets (10:51:12, 11:31:16) = PS_HOLD warm reset ≤1 s after `imx586: rails up` at load 0.2–0.7, Vsys 8.2–8.35 V, VBUS 4.9 V/3 A, thermal ≤44 °C, cooling states 0, no panic in ramoops. Evidence: `/var/log/powerlog/power-2026102x.log`, `/var/log/clubs8t-pon.log` (0x8C2=02/0x8C4=40 = warm), `journalctl --list-boots` (25 boots since 10-19).
- **Cap script bugs found** (No.4's 10-19 `/usr/local/sbin/clubs8t-adaptive-cap.sh`): HIGH tier == MID tier (big 1171200/prime 1305600/GPU 400M; comment promised 1.6G/1.8G/490M) → phone at ~46% of spec 24/7; GPU min pinned == max (never idled); no hysteresis (15 flips/5 min at 8.30 V). `clubs8t-power-cap.sh` wrote governor `msm-adreno-tz` which does not exist on mainline (only `simple_ondemand`).
- **Bo GO 23:54 "Gogogo"** → installed fixed script: PLUG tier (charger online) = hw max 2419200/2841600/587M; HIGH ≥8.30 V = 1670400/1862400/490M; MID/LOW unchanged; 100 mV hysteresis; GPU min 305M. msm-adreno-tz line commented out. Backups `*.bak-20261021-2355`. Verified cpu7 `scaling_cur_freq=2841600` under 6 s burst, 37 °C.
- **Bo 00:11 "ปลดล็อคประสิทธิภาพให้เต็มระบบ"** (RO running, device handed live) → script sha `068331d4…`: on USB GPU min=max=587 (devfreq saw 0 ms at 587 over 5 s while RO rendered on freedreno — ondemand blind to FEX GL load), UFS min 300 MHz; on battery floors release (305/37.5). `~/.fex-emu/Config.json` Multiblock 0→1 (backup `.bak-20261022-0015`, applies next RO launch; RO pid 20348 started before the change). Under RO: f7 2.84 GHz, GPU 587, cpu7 65–72 °C, GPU 47 °C, battery 38.4–39.8 °C (passive trip 45). Bo: "เออรู้สึกเครื่องแรงขึ้นเลย".
- **Reset 00:02 was MY fault**: ran Antigravity IDE (Electron glibc 190 MB) inside distrobox `rofex` with screen ON → SIGSEGV 00:01:59 → coredump → PS_HOLD. Rails/clocks healthy at that minute. Told Bo. Partial copy `~/apps/antigravity-ide` removed. Last ramoops lines: `dwc3 a600000.usb: end transfer failed: -110 / failed to clear STALL on ep1in` (also seen 22:39:56 that boot, so not the trigger).
- **PS_HOLD now has 2 known triggers** with no voltage/thermal signature: camss/IMX586 rails-up; large process crash + coredump. Common factor likely memory/IOMMU/firmware path. Root cause still open.
- **Waydroid**: purged 10-19 12:31 (`apk del plasma-mobile-waydroid waydroid … lxc gbinder`, 15 pkgs; not via sudo log, author unknown). Images `/etc/waydroid-extra/images/{system,vendor}.img` 2.3 G and all 5 apks in `/var/cache/apk/` intact (tar-tested OK); `99-unmanaged-waydroid.conf` still present; kernel has BINDER_IPC=y (binderfs not set, matches 10-18 working config).
- **Antigravity IDE** `/opt/antigravity-ide` (installed 10-19 01:15, unknown seat): needs `ld-linux-aarch64.so.1` (glibc) — pmOS host is musl → never ran. Inside rofex (Ubuntu 24.04) loader works; installed `libnss3 libnspr4` there, ldd now clean. Binary must be under `/home` (rofex binds /home, not /opt).
- **UEFI assessment**: edk2-msm has `Platform/Qualcomm/sm8250` + `Platform/Oneplus/sm8250/instantnoodlep` (8 Pro only, last commit 2023-03-04); nabu (Pad 5) port is active (2025-12). kebab port = copy instantnoodlep dsc/fdf, FB 1080×2376→2400, use our `sm8250-oneplus-kebab.dtb`, rewrite DSDT, flash to boot_a (boot_b stays pmOS). 2–3 days to boot menu; Windows ARM on 8T has no driver work anywhere — unknown. Boot slots: both boot_a/boot_b currently hold pmOS images (a: no cma=256M, older).
- **On-device services** (Bo asked HAOS/Mattermost): Mattermost official image is amd64-only (checked registry, 11.5.2 too); Rocket.Chat, matrix-conduit, homeassistant/home-assistant:stable, postgres:17, mongo:7 all have arm64. HAOS itself has no 8T build → HA Container in podman (podman 6.1.4 rootless, graphRoot on /home 120 G free).
- **Sombo transcript read** (Bo asked): 10-20 12:00–12:53 Bo asked base OS (pmOS+Plasma+Waydroid), Waydroid lag, venus.mbn research, pmOS porting manual → Sombo wrote `sombo-oracle/ψ/learn/pmos-porting-guide/2026-10-20_official_pmos_smartphone_porting_manual.md`. Afternoon = Z Flip 5.
- **Fleet**: start-no5.sh:54 `ANTHROPIC_DEFAULT_HAIKU_MODEL` → `cc/claude-haiku-5-5` (226f563) per No.1/No.2 drift note. Sombo ack'd both cap changes; added HA `sensor.oneplus_8t_battery_temp` (847c3265). No.1 rule ack'd: no heavy/crash-prone work on 8T with screen ON; crash experiments on rofex elsewhere first; no UEFI/firmware without Bo GO.
- **Records**: sombo-oracle `fleet/desired-state.yaml` block `clubs8t_power` (07c4abdc → 49a79c3e), `ψ/decisions.md` 8df34e9a; Arra memories 1691415a (audit), 5153bf79 (cap lift), c7bc845f (full unlock); v4 learnings O-zNIj_rYPqrJQwyi7T1c, qOLucXDWTZSNp5G0rLJDi; memory files `clubs8t-cap-not-cause-of-resets.md`, `clubs8t-is-a-lab-like-no0-vm101.md`, `clubs8t-heavy-work-screen-off-only.md` (updated).

## Authorization trail (No.1 asked 00:20)
- Cap lift 23:55 ← Bo DM 23:54 "Gogogo" (msg 1562509418178941001), replying to my proposal 23:4x (msg 1562505920271884319).
- Full unlock 00:13 (GPU pin 587, UFS 300, FEX Multiblock) ← Bo DM 00:11 "มึงแตะได้เลย ได้เปิดค้างไว้ให้มึงทดสอบ" (msg 1562513613162549372) + "ปลดล็อคประสิทธิภาพให้เต็มระบบเลย" (msg 1562513651011813507).
- Waydroid + YouTube ← Bo DM 00:20 (msgs 1562515813326528594, 1562515882335281194). Not started yet.
- Sombo (8T config owner) ack'd both cap changes via MQTT (00:0x, 00:14). No.1 ack'd the pattern 00:20.

## Addendum 00:25 — third reset 00:17, GPU faults found
- Reset #3 at 00:17:05–00:17:11 (boot -1 → 0), I touched nothing after 00:13. Journal tail: kwin `GameGuard Error : 114` window at 00:17:05 (RO dying) → PS_HOLD ~10 s later. powerlog 00:15–00:17: Vsys 8.14–8.30 V, VBUS 4.75–4.95 V, ibus 0.9–1.4 A, battery 38.4–39.0 °C, cpu7 2.84 GHz, GPU 587 — healthy.
- ramoops of that boot: `adreno 3d00000.gpu: gpu fault ring 0 status 00800005` + `hangcheck recover!` at 00:11:30 (offending wined3d_cs / Ragexe.exe) and 00:11:58 (offending kwin_wayland). Both BEFORE the 00:13 GPU pin, when GPU sat at 305 MHz under ondemand with CPU already uncapped. Kernel recovered both. Boots -2…-12 show 0 gpu faults (whether RO ran in them: checking). hangcheck_period_ms=250.
- Pattern now 3-for-3: large process death/teardown (Electron SEGV 00:02, RO/GameGuard exit 00:17) or camss rails-up → PS_HOLD, never a power/thermal signature, never a kernel panic in ramoops → suspect TZ/SMMU-side fault on big GPU/IOMMU unmap or firmware path. Candidate experiments (screen OFF, Bo not using): watch `/sys/kernel/debug/dri/0/` + `dmesg -w` over ssh while `ro-kill.sh`; try `hangcheck_period_ms` larger; compare with GPU floor 305 vs 587; check TZ log via `qcom_stats`/`/sys/kernel/debug/qcom_stats` if exposed.
- RO relaunched by Bo on boot 0 (pid 3965) — first run with FEX Multiblock=1. Monitor `bpd18ylyf` (sh-fixed) armed to ~00:50.

## Addendum 00:30 — reset #4 at 00:22 + black screen = lock screen
- Reset #4 00:21:46→00:22:03 (boot -1 → 0) while Bo played RO; Bo: "RO โดน GameGuard เตะ แล้วเครื่องดับตาม" — same pattern as #3. powerlog 00:21: Vsys 8.1–8.3 V, batt 39 °C, cpu7 2.84 GHz, GPU 587, load 2.5. That boot's ramoops: no gpu fault, no panic. PON warm. **4 resets tonight, 2 during RO.** Bo now just wants to see if it dies again — I am hands-off, monitor only (bpd18ylyf).
- Black screen after boot 00:22 (Bo "จอไม่กลับมาเลย"): sysfs dpms=On, bl 365, dsi_err 0, RO not running (my earlier "RO pid" was my own ssh shell matching pgrep -f — use `ps -o pid,args | grep -E "\.exe|wineserver"` instead). Journal shows `kscreenlocker_greet` (kwin_wayland_wrapper[3120]) up at 00:23:33–39 with PAMAuthenticatorModel → **lock screen was showing**, despite kscreenlockerrc LockOnStart=false/Autolock=false/Timeout=0 and pam_permit. `sudo loginctl unlock-session c1` at 00:24:48 → Bo saw the screen come back. Bo: "เราเคยเอารหัสล็อคหน้าจอออกไปด้วยซ้ำ" — the lock still appears after a warm reset. **Found 00:31:** journal 00:23:28 and 00:23:29 `systemd-logind: Power key pressed short` (Bo pressing power to wake the black panel) → 00:23:31 `plasmashell raiselockscreenplugin: Initialized overlay` → 00:23:33 `kscreenlocker_greet` (mobileshell lockscreen Keypad.qml). So: panel black after warm reset → Bo presses power → Plasma Mobile treats power key as lock/toggle → lock screen (which Bo may also see as black/dark) → my `loginctl unlock-session` cleared it. Same mechanism as 10-20 (PowerButtonAction=128 toggle, Sombo set PBA=128 back 10-20 13:27). Two layers: (a) why the panel is black right after a warm reset before any key press (dpms=On, bl_power=0, dsi_err=0 — the unexplained 10-20 12:43 class), (b) power key → lock. Checking powerdevilrc + mobileshell source next. Note `kscreen-doctor output.DSI-1.disable` is refused ("disabling all outputs not allowed") — not a usable re-init path.
- RO launched by Bo himself at ~00:25 (DM 00:26 "กูเปิด ragnarok เอง"); FEX Multiblock=1 is live for this run.

## Addendum 00:32 — sustained thermal under RO with full unlock
- Monitor alert 00:28:41: cpu7-top 83 °C → 85 °C by 00:29, prime pinned 2841600 continuously (wine/FEX single-thread), big 65–73 °C, GPU 52 °C, battery 38.7–39.5 °C, cooling states still 0 (kernel passive trip at 90 °C, 95 °C second, 110 °C critical). Told Bo 00:29 with the option: PLUG tier prime 2.84 → 2.42 GHz (≈−10 °C, FPS nearly unchanged). **Hands-off until Bo answers** (his 00:26: "กูแค่อยากรู้จะดับอีกไหม"). If Bo says yes: edit `HP`/PLUG prime in `/usr/local/sbin/clubs8t-adaptive-cap.sh` → 2419200, restart service, note in desired-state. If no answer: kernel throttles itself at 90 °C; no reset risk from heat (resets so far never had a thermal signature).
- Black screen = power-key → Plasma Mobile lock (PowerButtonAction=128 in powerdevilrc for AC/Battery/LowBattery, Sombo's 10-20 setting). After a warm reset the panel is dark before any key, Bo presses power, lock overlay comes up, `loginctl unlock-session c1` clears it. Proposed fix for Bo later: PowerButtonAction=32 (lock screen → no; that was 10-20's "32") — better: leave PBA, and give Bo a one-tap unlock, or find why the panel is dark post-reset (10-20 12:43 class). Not changed tonight.

## ⚡ Bo GO 00:20 (DM): "ดูดิว่าพวก app android จะลงได้ไหม ลง YouTube ก่อนเลย … ตัวไม่ติดโฆษณาก็ได้"
→ **DO NEXT SESSION, when Bo says RO is done** (screen OFF, RO killed via `~/ro-x86/ro-kill.sh`):
1. `sudo apk add --cache-dir /var/cache/apk waydroid waydroid-systemd waydroid-nftrules waydroid-pyc plasma-mobile-waydroid` (deps lxc, lxc-libs, lxc-systemd, libgbinder, gbinder-python, iptables from edge repo). Cached apks tar-tested OK.
2. `sudo waydroid init -i /etc/waydroid-extra/images` (system.img 1.99 G + vendor.img 0.42 G already there, 10-17). Keep `/etc/NetworkManager/conf.d/99-unmanaged-waydroid.conf` (routewrangler/4G fix, v4 pY7Jr2TpczuKxTBUwsWuj).
3. `sudo systemctl start waydroid-container` → `waydroid session start` as clubslinux8t → wait `sys.boot_completed=1` (launcher `/usr/local/bin/clubs8t-waydroid-launch` has the loop). Heavy step — screen OFF.
4. YouTube ad-free without GMS: **NewPipe** (github.com/TeamNewPipe/NewPipe releases, arm64 apk) or **ReVanced** (needs MicroG). Start with NewPipe: download on maclab, scp, `waydroid app install NewPipe.apk`.
5. Test playback; venus hw decode is blacklisted (`/etc/modprobe.d/blacklist-venus.conf`, SoC reset risk) → software decode; expect 720p OK, 1080p60 maybe choppy. Report to Bo with screen back on.
Prior Waydroid notes: v4 pY7Jr2TpczuKxTBUwsWuj (routewrangler, PairIP), handoff 2026-10-18_21-50 (Waydroid boot fix). Waydroid was purged 10-19 12:31 by an unknown seat; the 10-18 "Waydroid auto-freeze" cap note is obsolete.

## Pending
- [ ] Bo GO 00:20 (see above): reinstall Waydroid from cache + NewPipe/YouTube (`apk add --cache-dir /var/cache/apk waydroid waydroid-systemd waydroid-nftrules plasma-mobile-waydroid` + lxc/gbinder deps; images already in place) — ~2 min, screen OFF
- [ ] Bo GO: Antigravity IDE via rofex — copy `/opt/antigravity-ide` → `~/apps/`, `apt install` remaining GUI libs (libgtk-3-0 libasound2t64 etc. — dry-run said only nss/nspr missing for ldd, but runtime may need more), `distrobox-export --app`, launch with `--no-sandbox --ozone-platform=wayland`. **Screen OFF only, Bo not using device.**
- [ ] Watch battery temp under RO with GPU pinned (monitor `bltazmnmy` armed to 00:48; alerts at ≥43 °C / cpu7 ≥80 / GPU ≥78 / reset). If battery ≥43 °C → drop GPU floor (set gmin 305 in PLUG tier) and tell Bo.
- [ ] Confirm FEX Multiblock effect when Bo relaunches RO (check `/proc/<Ragexe pid>/environ` or FEX log).
- [ ] Root cause of PS_HOLD (camss rails-up / coredump) — needs screen-off session; candidates: SMMU fault path, TZ, dwc3. Not tonight.
- [ ] UEFI kebab port on boot_a — only if Bo asks; 2–3 days.
- [ ] Sombo: fold `clubs8t_power` into fleet-drift-check if desired.

## Next Session
- [ ] `/recap` → read this handoff → check monitor result / `journalctl --list-boots` on clubs8t for any reset after 00:20 and `sudo tail /var/log/clubs8t-adaptive-cap.log`
- [ ] DM Bo "กลับมาแล้ว" + current 8T temps (cpu7/GPU/battery) in one line
- [ ] If Bo GOed Waydroid/IDE while I was away → do them screen-off, verify `waydroid status` / IDE window, report once

## Key Files
- clubs8t: `/usr/local/sbin/clubs8t-adaptive-cap.sh` (sha 068331d4), `.bak-20261021-2355`; `/usr/local/sbin/clubs8t-power-cap.sh` (+ .bak); `/var/log/clubs8t-adaptive-cap.log`; `/var/log/powerlog/power-YYYYMMDD.log` (10 s telemetry); `/var/log/clubs8t-pon.log`; `~/.fex-emu/Config.json` (+ .bak-20261022-0015); `~/stage-no5-20261021/` (staged copy); `~/ro-x86/run-ro-light.sh`, `ro-kill.sh`
- maclab: `/Users/admin/oneplus-8t-prep/staged/clubs8t-adaptive-cap.sh` (source of truth for the script)
- sombo-oracle: `fleet/desired-state.yaml` `clubs8t_power`; `ψ/decisions.md` 2026-10-21 23:55 entry
- cartographer-oracle: `ψ/focus.md` (00:18), `start-no5.sh` (haiku 5.5)

## Next Session: Pick Your Path

| Option | Command | What It Does |
|--------|---------|--------------|
| **Continue** | `/recap` | Read this handoff, check 8T state, resume Waydroid/IDE if Bo GOed |
| **Clean up first** | commit `SOUL.md` diff or revert; drop `*.bak.*` strays | then `/recap` |
| **Fresh start** | `/recap --quick` | Minimal context |

### Cleanup Checklist
- [ ] `SOUL.md` modified, uncommitted (pre-existing, not from this session — check diff before committing)
- [ ] Untracked strays: `.claude/mcp.json.bak.20261012`, `CLAUDE.md.bak.20261001`, `app/`, `appliance-prototype/oracle-gateway/bun.lock`, `start-no5.sh.bak.*` — pre-existing
