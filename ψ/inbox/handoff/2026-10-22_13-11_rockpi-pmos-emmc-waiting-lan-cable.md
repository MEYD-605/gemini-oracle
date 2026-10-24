# Handoff: ROCK Pi 4C+ → postmarketOS on eMMC (waiting LAN cable) · D-047 closed · Linux-phone research

**Date**: 2026-10-22 13:11 (+07)
**Context**: 42% of 1M · session cost ~$68
📡 Session: e7bfd248 | sombo-oracle

## ⚡ FIRST THING
1. Ask Bo in DM: "ต่อสายแลน ROCK Pi แล้วหรือยังครับ". The ROCK Pi (rockpi-edge, Tailscale 100.80.0.4, WiFi 192.168.1.185) went OFFLINE ~13:06 when Bo moved the USB cable. Check: `ping 100.80.0.4; ssh root@100.80.0.4 uptime` (root works over Tailscale SSH; rock/radxa/admin don't).
2. When it's up on LAN: `ip -br a` on it → measure throughput first (20 MB test) → full eMMC image to ClubSGame WSL: `ssh root@<lan-ip> 'dd if=/dev/mmcblk0 bs=4M status=none' | zstd -3 -T0 > mmcblk0.img.zst`. Run it from WSL (`ssh ClubSGame` → `wsl -d Ubuntu-26.04 -u root`). WSL's root key can ssh root@100.80.0.4; LAN 192.168.1.185 failed host-key verification. Put done.flag behind `&&`, then `zstd -t` + sha256.
3. Check No.5's reply to my 13:05 heads-up (installing pmbootstrap + rkdeveloptool on clubs8t). No reply yet = don't install.

## Bo's decisions this session (verbatim-ish)
- 12:39 "OS บน rock pi เก่า ก็ backup ไว้ใน wsl ก่อน"
- 12:45 "เหมือน 8t ดิ" → ROCK Pi = postmarketOS; "ดูว่าทำ cluster ได้ดีจริงไหม … ดู os ที่จะลงให้ esp32 ส่ง sub agent ออกไปช่วยด้วย"
- 13:02 "เอาเครื่อง 8t แฟลชได้ไหม" (yes: aarch64 native build) · 13:03 "หรือใช้แม็คแล็บกันตรงกลาง" · **13:04 "ลง emmc"**
- 13:07 "เดี๋ยวต่อสายแลนให้ด้วย"
- Earlier: finish only the 8T as a Linux phone (calls work already), Kali later (GO pending), robot = 3D-printed dock body: 8T face (its own speaker/mic/cam, NO extra speaker), ROCK Pi + ESP32-S3 ×2 dock in, power-bank hub, wheels later, all in a cluster.

## ROCK Pi facts (verified)
- Radxa ROCK 4C+, RK3399-T, 3.8G RAM, Armbian trixie 26.8.0, kernel 6.18.38. OS on **eMMC** mmcblk0 28.9G (has boot0/boot1), one ext4 p1 from sector 32768. microSD slot empty.
- Runs: maw-rs :3456, oracle-board sshx :8051, VNC/noVNC, lightdm, **cloudflared tunnel rockpi.clubsxai.com → :6080**, tailscale. Fleet map: rockpi-edge "idle", ex-99-joker home. All of this is lost on reflash; tell No.1 before writing the eMMC.
- Type-C = power only. Flash port = **upper blue USB 3.0 Type-A (OTG)**, USB-A↔A cable to the iMac. Maskrom: hold the button while powering on → Mac sees 2207:330c. rkdeveloptool is NOT on the Mac yet (build from source); it IS available via apk on clubs8t.
- Bo's first cable went into a HOST port (ROCK Pi saw "Macintosh" Billboard 05ac:166b).

## Backup state (ClubSGame WSL Ubuntu-26.04, /root/backups/rockpi-4cplus-20261022/)
- ✅ boot-area-first16MiB.img sha 716338d6… · partition-table.txt 9e48031e… · inventory.txt
- ❌ rootfs.tar.gz.PARTIAL-wifi-dropped-1306 (1.25 GB, truncated) · done.flag.INVALID-tar-failed
- /root/backups/.aborted-dd-image/ = early partial dd (WiFi 0.4 MB/s). NOT a valid image.
- ⚠️ ssh alias `clubslab` = OLD LXC 100.66.18.111, NOT the WSL.

## Research (all committed)
- ψ/learn/rockpi-cluster/ (ae5b2a49): pmOS on 4C+ = medium, 4–8 h. DTS `rk3399-rock-4c-plus` upstream ✅, U-Boot `rock-4c-plus-rk3399_defconfig` ✅, no pmaports device yet → new device-radxa-rock-4c-plus cloned from rockpro64, plus a firmware pkg for BCM43456 (template firmware-radxa-zero). pmbootstrap: WSL NOT supported; Orb VM oneplus-builder has 3.12.1 (148G free); clubs8t can also build natively. k3s: ROCK Pi = server, 8T = agent, don't run flannel over tailscale0, check kernel config + nftables first. ESP32: ESPHome (+LVGL on the 3.5" board, likely Guition/Sunton ST7796 + GT911).
- ψ/learn/phone-robot/ (3a81369b, ba3b5c5f): OpenBot pattern (has a robot/linux client, verified), dock body + power-bank hub (UGREEN Nexode has low-current mode).
- ψ/learn/linux-phone/ (8eaee36c, db61b8e2, 8dc56597, b66e0b41): brief for No.5 + Flip3 / X Fold3 deep dives.
- ψ/inbox/2026-10-22_idea-3d-printed-robot-body-for-phones.md (e85c9621, d08c0f3c).

## Also done
- D-047 CLOSED 10:39 (d3d87363): no88-sombo isActive=0 → 401; v2 + rdda-zflip5 200; drift guard.
- haos-sensor-sync online fallback (410fc2d4).
- desired-state No.5 → cc/claude-opus-5-5 (2550b974, Bo 12:40 via No.6, Fable 429 until 10-27).
- drift-check: agy seats' HAOS arra bearer row (717e0fec), per No.1. 236 checks · ❌8.
- CadQuery 2.8 installed in ~/.venvs/cad (py3.12, cadquery-ocp 7.9). The OpenSCAD cask is disabled by Gatekeeper.
- No.5 UEFI script SKIP_REBOOT fix verified. Its first run failed on `systemctl reboot bootloader` "Too many arguments" (told No.5).

## Pending
- [ ] ROCK Pi: LAN → full image backup + sha → tell No.1 the services will go → Maskrom + OTG cable → write pmOS
- [ ] Build device-radxa-rock-4c-plus + firmware pkg (clubs8t or Orb VM), after No.5 OK
- [ ] Kali container on 8T: waiting on Bo's GO
- [ ] Bo: the public gemini-oracle branch 042d1925 (dead key, low risk)
- [ ] No.4: confirm rdda on the Z Flip 5 phone uses rdda-zflip5; confirm binary_sensor.oracle_gmguinness_online in HA
- [ ] 10-29: ADR-016 tally + lesson-loop report

## Retro
ψ/memory/retrospectives/2026-10/22/13.10_d047-closed-linux-phones-rockpi-pmos-plan.md (+3 Arra learnings)
