# Handoff: OnePlus 8T install — กลางคิว unlock (สลับ model เป็น Opus 5.5)

**Date**: 2026-10-17 00:16 (+07) · **Session เก่า**: 7730c32a (glm-5.3)
**เหตุ**: Bo สั่งสลับ model ระหว่างช่วงรอ (ถูกจังหวะ — ไม่มีคำสั่งค้างในเครื่อง)
📡 Discord Bo chat_id: **1470628889826037840** · สายเสียบอยู่พอร์ตหลัง iMac (Location 0x14600000)

## สถานะเครื่อง 8T ตอนนี้ (ยืนยันแล้วทุกตัว)
- **KB2003** ✓ serial `45a76adf` · kona · slot **b** · Android 13 (KB2003_13.1.0.583 EX01) · แบต 72%
- **Bootloader ยัง LOCKED** (`fastboot oem device-info`: Device unlocked: false, secure: yes)
- `flashing unlock` + `oem unlock` โดนเฉย (OKAY ทันที ไม่มีจอยืนยัน) = **toggle "OEM unlocking" ใน Dev Options ยังปิด**
- 00:12 สั่ง `fastboot reboot` กลับ Android แล้ว — **กำลังรอ Bo เปิด toggle**: Settings → System → Developer options → **OEM unlocking → เปิด** แล้วเขาจะพิมพ์ "เปิดแล้ว"
- (watch task เก่า bm9xtkq0n รอ adb อยู่ — ถ้า session ตาย มันตายด้วย ไม่มีผล)

## ขั้นต่อไปทันทีที่ Bo บอก "เปิดแล้ว"
1. `adb -s 45a76adf reboot bootloader` → รอ `fastboot devices` เห็น 45a76adf
2. `fastboot flashing unlock` → **คราวนี้จอยืนยันจะขึ้นจริง** → Bo: Vol เลือก UNLOCK → Power ยืนยัน → wipe+รีบูต 1-2 นาที จอดำ **ห้ามถอดสาย**
3. หลัง wipe: USB debugging auth หาย — เข้า fastboot ด้วยปุ่ม (ปิดเครื่อง → **Vol- + Power** ค้าง) · ผ่าน adb ไม่ได้อีก
4. Flash: `cd ~/oneplus-8t-prep && fastboot flash super images/pmos-kebab-rootfs.img && fastboot flash dtbo images/pmos-kebab-dtbo.img && fastboot flash boot images/pmos-kebab-boot.img` → `fastboot reboot`
5. บูต phosh (3-8 นาที) → Mac ได้ NCM interface → `ssh user@172.16.42.1` รหัส `1234` (จอไม่มีอะไรก็เช็ก `ifconfig` หา iface ใหม่ / ตั้ง manual 172.16.42.2/24)
6. `scp tools/linux-postmarketos-qcom-sm8250-7.2.0-r26.apk apks/linux-firmware-*.apk tools/pmos%40local-6a985863.rsa.pub user@172.16.42.1:/tmp/`
7. บนเครื่อง: `sudo cp '/tmp/pmos%40local-6a985863.rsa.pub' /etc/apk/keys/pmos@local-6a985863.rsa.pub` (ชื่อต้อง pmos@local!) → `sudo apk add /tmp/linux-postmarketos-qcom-sm8250-7.2.0-r26.apk /tmp/linux-firmware-*.apk` → `echo "linux-postmarketos-qcom-sm8250=7.2.0-r26" | sudo tee -a /etc/apk/world` → `apk upgrade --simulate | head` (ต้องไม่มี kernel อื่น)
8. Flash boot release: เข้า fastboot อีกรอบ (ssh สั่ง `sudo reboot` แล้วจับจังหวะ Vol- + Power หรือปุ่มล้วน) → `fastboot flash boot tools/boot.img` → บูตใหม่
9. verify: รัน `scripts/verify-on-device.sh` บนเครื่อง → รายงาน Bo **x/26**

## Intelligence สำคัญ (อย่าทำซ้ำ/อย่าลืม)
- **rootfs มี blobs ครบแล้ว**: adsp/cdsp/slpi/venus/a650_zap ยืนยันด้วย scan (firmware-oneplus-instantnoodlep ในตัว) → **ไม่ต้องดึง vendor/modem จากเครื่อง** · modem_a อยู่นอก super — อยากได้ภายหลัง mount `/dev/disk/by-partlabel/modem_a` จากใน pmOS ได้
- firmware Wi-Fi/BT: apks/ มี 4 ตัว (ath10k/ath11k/qcom/qca edge 20260916 — deps ปิดครบ)
- `fastboot fetch` **ไม่รองรับ**บน OxygenOS fastbootd (เช็กแล้ว) · **twrp-kebab.img เสีย** (เป็น HTML bot-wall 5.8KB — ห้ามใช้)
- fastboot/adb บน Mac แก้ hang แล้ว (ใช้ /usr/local/bin ตัวใหม่ v37.0.1 อย่าใช้ .bad-quarantine) · **ถ้า adb มองไม่เห็นเครื่อง: `pkill -f "adb -L"` แล้วรอ 4 วิ** (adb server ค้างเป็นอาการประจำเครื่องนี้) · สายต้องเสียบพอร์ตที่เคยใช้ (พอร์ตอื่นเคยหลวง)
- Bo อ่านรูปให้ผมไม่ได้ (model เก่าตาบอดกับรูปมืด) — จอจีน = fastbootd menu **ห้ามกด** · ใช้ MIMO ช่วยแปลรูปได้
- ห้าม: `pmbootstrap install/export` ซ้ำ (UUID ผูก boot.img แล้ว) · `kebab-build.sh` · `apk upgrade` ก่อน pin · เปิด Venus decode
- Runbook เต็ม: `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` (มีตาราง "อาการ→ทางแก้" ครบ)
- หลังจบ: สลับ model คืนตาม pin · Bo อยากได้ REA MCP (`ψ/learn/morluto/rea/`) ลงหลังจบภารกิจ

## Model pin
- Bo สั่งสลับเป็น Opus 5.5 ชั่วคราว (mid-mission) — pin ที่ `~/.claude/channels/discord-no5/anthropic-model` (เดิม gcli/grok-4.7 D-044) — **จบภารกิจคืนค่าเดิม + อัปเดต desired-state.yaml**
