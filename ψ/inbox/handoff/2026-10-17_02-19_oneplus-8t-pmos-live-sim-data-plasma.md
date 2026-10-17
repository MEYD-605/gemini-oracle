# Handoff: OnePlus 8T — postmarketOS ใช้งานได้จริง (verify 26/26 + เน็ตซิม + Plasma) · ค้าง: login fallback / ลบ Phosh

**Date**: 2026-10-17 02:19 (+07)
**Context**: สูง — คืนยาว (ต่อจาก handoff 00:16 / 00:18)
📡 Session: c4dbd841 | cartographer-oracle · model opus-5.5[1m] (Bo `/model` ตั้งเป็น default เอง)
Discord Bo chat_id: **1470628889826037840**

## สถานะเครื่องตอนนี้ (ยืนยันทาง ssh 02:18)
- **เข้าเครื่อง**: `ssh 8t-ts` (Tailscale `100.68.231.79`) · `ssh 8t-wifi` (`192.168.1.179`) · `ssh 8t` (USB `172.16.42.1`) — key `~/.ssh/id_ed25519`, user **`clubslinux8t`**
- **รหัส sudo/login**: ตัวใหม่ที่ Bo ตั้งใน Discord 02:04 (`1234` ใช้ไม่ได้แล้ว) — ไม่ได้จดลง runbook
- จอ: Plasma Mobile session `clubslinux8t` บน seat0 · หน้าล็อก KDE ขึ้น · phrog ไม่รัน (หลัง relogin ผ่าน `systemd-run --unit=kebab-relogin`)
- **ยังไม่ได้ยืนยันจาก Bo ว่าจอแตะได้แล้ว** หลังค้าง (สาเหตุ: ผม `apk del firefox-esr` ขณะ Firefox เปิดอยู่บนจอ)

## What We Did
- pmOS บูตด้วย release kernel `7.2.0 #27` (flash `tools/boot.img` ลง `boot_b`, sha256 ตรง) → **verify-on-device.sh 26/26** หลังรีบูตหลายรอบ
- DSP: copy `adsp/cdsp/slpi` (.mdt→.mbn + .bNN) จาก `modem_a` → `/lib/firmware/postmarketos/` → เสียง/ลำโพงใช้ได้ (Bo ได้ยิน tone)
- GPU: zap OEM จาก `TheMuppets/proprietary_vendor_oneplus_sm8250-common` (lineage-24.0, OOS14 EX01) → `gpu-initialized: 1`, phoc/kwin ใช้ freedreno
- BT: `bluez-btmgmt` → addr `02:B8:25:EB:C1:24`
- **เน็ตซิม AIS ใช้ได้ (เกิน README upstream ที่บอก not working)**: enable `kebab-uim-provision` + **rebuild ModemManager บนเครื่อง** (Alpine commit `7f0bf17a` + patch apollo `0001-qcom-soc-mhi-net` `0002-bearer-bind-pcie`, meson `-Dsystemd_suspend_resume=true`) + NM conn `AIS` apn `internet` → 30MB @ 5.3MB/s, ASN AS131445 · pin `modemmanager=` ใน world · orig ที่ `/usr/sbin/ModemManager.orig`
- libcamera: rebuild pmOS fork v0.7.2 + 6 patch + upstream `e64b507d` (IMX471 helper) → helper โหลด (ยังไม่พิสูจน์ว่าภาพดีขึ้น — ถ่ายห้องมืด) · orig ที่ `/usr/local/share/kebab-libcamera-orig/`
- Plasma Mobile + ธีม "Orbit Black" + wallpaper ขอบโลก (gen เอง `~/.local/share/wallpapers/orbit-horizon.png`) + คีย์บอร์ดจอ en_US/th_TH
- Tailscale `oneplus-8t` 100.68.231.79 (Bo approve) · PlasmaTube/yt-dlp/mpv · Dissent (Discord) · ลบ Firefox
- **format userdata (sda28) → ext4 `/home` 219.9G** (Bo สั่ง) · fstab `nofail` · rename user `user`→`clubslinux8t` (GECOS ClubsLinux8T) ผ่าน one-shot unit ตอนบูต
- login หน้าเดียว: greetd `[initial_session]` autologin startplasmamobile + `LockOnStart=true`
- เสียงตอนโทร: วิเคราะห์แล้ว **ต้องแก้ kernel** (ไม่มี q6voice/q6cvp/CS-Voice) — ถาม Bo ว่าลุยหรือพัก ยังไม่ตอบ
- กล้องหลัง: sub-agent research — IMX586/IMX481/GC02M1B ไม่มี driver, GC5035 มีของ ChromeOS · งานหลายสัปดาห์
- Runbook อัปเดตครบ: `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` (ตารางอาการ→ทางแก้, 🔑 เข้าเครื่อง, 📶 เน็ตซิม, 📷 libcamera, 📞 เสียงโทร, 👤 login flow)

## Pending
- [ ] **ยืนยันกับ Bo ว่าจอแตะได้แล้ว** หลัง relogin (ถ้ายังค้าง → kwin เป็นตัวปัญหา ดู journal kwin_wayland)
- [ ] **เปลี่ยน greetd `[default_session]` (fallback) จาก phrog → plasma-login-manager** (ลงแล้ว 6.8.0 ยังไม่ตั้ง) — config `/etc/plasmalogin.conf` (override `/usr/lib/plasmalogin/defaults.conf`); ยังไม่รู้ key autologin · ⚠️ ห้ามรัน `plasmalogin --example-config` ผ่าน ssh (ค้าง) · ทางเลือกง่ายกว่า: `greetd-tuigreet` เป็น default_session
- [ ] แล้วค่อย **ลบ Phosh** (Bo สั่ง) — `apk del postmarketos-ui-phosh` จะพา greetd/greetd-phrog ไปด้วย ⇒ ต้องมี DM ใหม่ก่อน · คืน ~250MB
- [ ] Bo จะส่งรูป **error 2 บรรทัดตอนบูต** — ยังไม่ได้รับ
- [ ] Bo ขอ "ไล่ดูขาดอะไรอีก" — ยังไม่ได้ทำรายการเต็ม
- [ ] เสียงตอนโทร: รอ Bo ตัดสิน (kernel CS-VOICE + q6voiced + VoiceCall.conf จาก apollo)
- [ ] กล้องหน้า: รอ Bo ถ่ายในที่สว่างเทียบ
- [ ] Grok bot โหลดอะไรมา — รอ Bo บอก (ในเครื่องไม่พบไฟล์ใหม่)
- [ ] จอใหญ่ DP: `panel edid read failed` → hangcheck → plasmashell restart · รอ Bo บอกสาย/ผล
- [ ] / เหลือ 1.4G — `/home` เก่าบน rootfs ถูก mv ไปแล้ว (อยู่บน sda28) ✓ · ลบ Phosh จะคืนเพิ่ม
- [ ] ไม่ได้ flash `/boot/boot.img` ที่มี deviceinfo MAC pin (ต้อง fastboot มือ Bo) — ไม่ด่วน
- [ ] **model pin**: handoff เดิมบอกคืน `gcli/grok-4.7` แต่ Bo `/model opus-5.5[1m]` ตั้ง default เอง → ถาม Bo ก่อนแตะ + sync `sombo-oracle/fleet/desired-state.yaml`
- [ ] งานค้างจากก่อน: ลง REA MCP · NGL restore ขั้น 1-4 · ESP32 รุ่น · No.5 รันซ้อน 2 process · LaunchAgent ฆ่า adb server ค้าง

## Next Session
- [ ] `ssh 8t-ts` → เช็ก `loginctl list-sessions` + ถาม Bo จอแตะได้ไหม
- [ ] ตั้ง fallback DM (tuigreet หรือ plasmalogin) → ทดสอบ logout → ลบ Phosh → รีบูต (บอก Bo ก่อน) → verify 26/26
- [ ] รวม "ขาดอะไรอีก" เป็นตารางส่ง Bo

## Traps (อย่าทำซ้ำ)
- ห้าม `apk del` แอปที่กำลังเปิดบนจอ (Firefox → จอค้าง)
- `systemctl restart greetd` ไม่ trigger `initial_session` ซ้ำ → ตกไป phrog · relogin ต้อง `systemd-run` detached: stop greetd → `loginctl terminate-user` → start greetd
- `loginctl terminate-user` ผ่าน ssh จะตัด ssh ตัวเองด้วย
- macOS ไม่สร้าง NCM iface ตอนจอ iMac ล็อก · `/usr/local/bin/ssh` เสีย ใช้ `/usr/bin/ssh` · `poweroff` ขณะเสียบ USB = บูตกลับเอง
- hook บล็อก `rm -f` → ใช้ `mv` ไป `/tmp` หรือ `/root/reverted/`

## Key Files
- `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` ← ทุกอย่าง
- `~/oneplus-8t-prep/{mm-build,libcamera-build,firmware/zap-lineage}/`
- บนเครื่อง: `/root/nv-backup-20261017/` (modem NV 7 part) · `/root/reverted/` · `/etc/phrog/greetd-config.toml(.bak-20261017)` · `/usr/local/share/kebab-mm/`
- `~/.ssh/config` (Host 8t / 8t-wifi / 8t-ts) + backups `.bak.8t-*`
- Arra memory `b32d1edc-9d77-430c-ba02-dda64fe7cfbb`
