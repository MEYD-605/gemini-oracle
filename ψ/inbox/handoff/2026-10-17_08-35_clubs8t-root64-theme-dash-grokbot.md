# Handoff: Clubs8T (OnePlus 8T pmOS) — root 64G · ชื่อ/ธีม · dash · RO test · Grok Bot

**Date**: 2026-10-17 08:35 (+07)
**Context**: ~48% (เกิน 40% → /clear ต่อ)
📡 Session: 7efb93a4 | cartographer-oracle · opus-5.5[1m] (pin ตั้งเป็น `ag/gemini-3.8-flash-high[1m]` แล้ว มีผลรอบ restart/clear)
Discord Bo chat_id: **1470628889826037840**

## เข้าเครื่อง
- `ssh 8t-wifi` (192.168.1.179) · `ssh 8t-ts` / `ssh clubs8t` (Tailscale 100.68.231.79, `clubs8t.tailcd5df9.ts.net`) · user `clubslinux8t` · sudo pw = ตัวที่ Bo ตั้ง (ไม่จด)
- ⚠️ iMac: ใช้ `/usr/bin/ssh` เสมอ (`/usr/local/bin/ssh` เสีย) · rsync ต้อง `-e /usr/bin/ssh` + path ปลายทางห้ามมี `(x86)`/space (ash quote พัง; openrsync ไม่มี `-s`)

## What We Did
- **Root 64G**: userdata sda28 → `/home` 160.5G · sda29 64G label `pmOS_root` = root จริง (ว่าง ~51G) · root เก่าใน super label `pmOS_root_old` (สำรอง; ถอย = สลับ label) · `/boot` เป็นโฟลเดอร์บน sda29 → **ถ้า apk อัป kernel ต้อง flash `/boot/boot.img` ลง boot_b เอง**
- **A/B fix**: บูตค้าง fastboot = slot b ไม่เคย mark successful → `fastboot set_active b` + `apk add qbootctl` (service mark ทุกบูต)
- **ชื่อ**: hostname `clubs8t` / pretty `Clubs8T` / BT alias / Tailscale · OS = `ClubsLinux 8T` (`/etc/os-release` ไฟล์จริง, issue/motd ใหม่)
- **ธีม**: WhiteSur **Light** ทั้ง KDE+Kvantum+GTK3/4+icons · wallpaper home+lock = `~/.local/share/wallpapers/macos/03-Monterey.jpg` (มี 10 รูป macOS) · backup `~/.config/theme-backup-20261017{,-dark}/`
- **แพ็ก**: kvantum, font-noto-emoji/cjk, mesa-vulkan-freedreno (Vulkan Turnip ✅), dolphin konsole kclock kweather koko kdeconnect htop nano git iw vulkan-tools
- **Power**: ไม่ suspend เลย + ปิด PowerDevil AutoSuspend (AC/Battery/LowBattery) → จอดับ agent ยังรัน
- **dash.clubsxai**: glances-web.service บนมือถือ (:61208 เฉพาะ tailscale0, nft `60_glances-tailscale.nft`) · maclab homepage `config/widgets.yaml` แถวบน "Clubs8T (OnePlus 8T Phone)" อยู่**เหนือ Grok Bot** + การ์ดใน services.yaml (backups `.bak.20261017_04*`)
- **RO Classic (thRO) test**: wine 11 aarch64 + FEX (`xtajit.dll` FEX-2610) + i386-windows จาก Alpine x86_64 wine-11.0-r0 → patcher `Ragnarok.exe` **รันได้** (ต่อเน็ต เขียน patch.txt) · `Ragexe.exe` → **เครื่อง hard reset ~2 นาที** · client `~/ro-staging/RagnarokOnline` (symlink ใน prefix `~/.wine-ro`) · `~/ro-launch.sh` · สำเนา maclab `~/oneplus-8t-prep/ro-client/`
- **Grok Bot desktop** (งาน MIMO→No.5): distrobox `grokbot` debian:trixie (podman rootless) + `grok-bot_0.71.2_arm64.deb` · ไอคอน "Grok Bot" ใน drawer (wayland, GPU renderD128) · เปิดบนจอแล้ว 08:33 · **รอ Bo sign in เอง** · ส่ง MIMO verify แล้ว

## ⚠️ ข้อเท็จจริงสำคัญ: จอ + hard reset
- เส้นแนวตั้ง 5 เส้น = **ฮาร์ดแวร์จอ/แพร** (เห็นในหน้า fastboot)
- Hard reset (ไม่มี panic/pstore) ตอน **โหลดหนักต่อเนื่องทุกแบบ** (copy, flatpak, เกม) — ก่อนดับมัก `dsi_err_worker status=4` · แบต 626 cycles เหลือ 78%
- สูตรที่รอด: **เสียบไฟ + ปิดจอ (`kscreen-doctor --dpms off`, env XDG_RUNTIME_DIR=/run/user/10000 WAYLAND_DISPLAY=wayland-1 QT_QPA_PLATFORM=wayland) + ionice -c3 + throttle** · ทำงานหนักทีละอย่าง (ตกลงกับ Sombo)

## Pending
- [ ] **Bo ยังไม่ตอบ sudoers**: MIMO ขอ `NOPASSWD: ALL` (`/etc/sudoers.d/90-clubslinux8t-agent`) — เสนอ 3 ทาง (ALL / จำกัดคำสั่ง / No.5 รันแทน) · Sombo ขอ `sudo cp ~/managed-settings.json /etc/claude-code/` — ทำเมื่อ Bo OK เท่านั้น
- [ ] Grok Bot: ยืนยันกับ Bo ว่าหน้าต่างขึ้น + sign in ได้
- [ ] แบต 80%: charger driver (pm8150b SMB5 + fg) `status=disabled` ใน DTS → เสนอ A) HA smart plug (แนะนำ) B) Chargie C) แก้ DTS (ต้อง flash boot, ถาม Bo) — รอ Bo ว่ามี smart plug ไหม
- [ ] GmAtom: Sombo ย้ายมารันบนมือถือแล้ว (`~/.config/systemd/user/gmatom.service`, idle-only) — Bo ถามไว้แต่ยังไม่ได้ยืนยันอะไรเพิ่ม
- [ ] login fallback ยังเป็น Phosh/phrog → ไม่ลบ Phosh (Bo: เอาแค่จำเป็น) — ค้างไว้
- [ ] RO: ไปต่อได้เมื่อเปลี่ยนจอ+แบต หรือทดสอบบน Xiaomi Pad 6S Pro (Bo กำลังพิจารณาซื้อ 8/256)
- [ ] Model pin No.5 = `ag/gemini-3.8-flash-high[1m]` (Bo 03:15) — desired-state.yaml sync แล้ว (sombo-oracle ยังไม่ commit)
- [ ] งานค้างเก่า: REA MCP · NGL restore ขั้น 1-4 · ESP32 รุ่น · No.5 รันซ้อน 2 process · LaunchAgent adb server

## Next Session
- [ ] `/recap` → อ่าน handoff นี้ + เช็ก Discord ว่า Bo ตอบเรื่อง sudoers / Grok Bot / smart plug หรือยัง
- [ ] `ssh 8t-wifi 'uptime; findmnt /; journalctl --list-boots | tail -3'` ดูว่ามี reset ใหม่ไหม
- [ ] ถ้า Bo OK sudoers → ตั้งตามทางที่เลือก (visudo -cf, 440) + ทำ managed-settings ของ Sombo

## Key Files
- `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` ← ทุกขั้น/กับดัก
- `~/oneplus-8t-prep/repart-backup/` (GPT dump, repart.sh, copyroot*.sh) · `~/oneplus-8t-prep/logs/kmsg-*.log`
- maclab `~/Code/github.com/gethomepage/homepage/config/{widgets,services}.yaml`
- บนเครื่อง: `~/Apps/grokbot-install.{sh,log}` · `~/ro-launch.sh` · `/etc/nftables.d/60_glances-tailscale.nft` · `/etc/systemd/system/glances-web.service`
- HAOS Arra milestone `b75fad7a-fca8-4de2-9b34-84fa702f4c52`

## Update 08:40
- Bo: login ค้างที่ "Continue in your browser" → ใส่ shim `xdg-open` ใน container → host Angelfish
- No.5 restart Grok Bot ทาง ssh → **hard reset 08:36** (ความผิดผม) · ขอ Bo เปิดเองจากไอคอนแล้วกด Continue in browser — รอผล
