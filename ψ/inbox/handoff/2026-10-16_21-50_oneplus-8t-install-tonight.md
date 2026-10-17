# Handoff: OnePlus 8T Install Night — 23:30 รับเครื่อง + ภารกิจประจำวันทั้งหมด

**Date**: 2026-10-16 21:50
**Context**: สูงมาก (วันยาวมาก — เขียน handoff กันบริบทหลุด)
📡 Session: 7730c32a | cartographer-oracle

## 🔥 ภารกิจเร่งด่วน: 23:30 คืนนี้ รับ OnePlus 8T ลง Linux (คำสั่งพี่โบ)

**⚠️ อย่าลืม: cron เตือน 23:25 เป็นของ session เก่า — ถ้า session ใหม่มาก่อน 23:25 ให้ re-arm เตือนตัวเอง หรือรอพี่โบ ping ผ่าน Discord เอง**

**บทสรุปสถานะ (ทุกอย่างพร้อม ยกเว้น 1 optimization ค้าง):**
- พี่โบซื้อ 8T KB2003 (ศูนย์ไทย มือสอง 2,500 บาท) มาถึง 23:30 — ใช้แบบ **Wi-Fi only**
- ของครบที่ `~/oneplus-8t-prep/`: images (pmOS rootfs 2GB + boot + dtbo + Armbian×2) · tools (release kernel-7.2.0-r26 ทุก apk + checksum ผ่าน) · repos (bringup) · runbook
- **Runbook หลัก: `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md`** + เอกสารลึก `ψ/learn/jfbobier/Oneplus-8T-kebab-pmos-bringup/2026-10-16/2103_*.md`
- **ลำดับ 5 ขั้น (ห้ามสลับ!):** flash rootfs→super + dtbo → **บูต stock kernel ก่อน** (ข้าม = หาย USB/WiFi/เสียง/โมเด็ม) → ssh user@172.16.42.1 (รหัส 1234) → ติดตั้ง kernel apk r26 + pin (ต้อง trust local key ก่อน — ดู 2103_CODE-SNIPPETS) → flash boot.img release + userspace
- **Firmware OEM:** แผน D = ดึงจากตัวเครื่อง (มี root ใน pmOS → dd /dev/block/by-name/{vendor,modem} หรือ dm path) → extract ด้วยเครื่องมือใน builder → วาง /lib/firmware/postmarketos/{adsp,cdsp,slpi,venus}.mbn + qcom/a650_zap.* + sdx55m/*
- **ค้างอยู่ 1 จุด:** พยายามอบ linux-firmware-{ath11k,qcom,qca} เข้า rootfs ผ่าน extra_packages — ครั้งที่ 1 ผิด format (space) ครั้งที่ 2 comma ก็ยัง error "Could not find in pmaports or APKINDEX" (task bbfwdssge ค้าง search อยู่) — **ทางแก้ง่าย: rootfs เดิม (ไม่มี firmware เพิ่ม) ใช้ได้ปกติ + push apk 3 ตัวเข้าเครื่องหลังบูต (pull จาก builder cache หรือโหลดจาก Alpine repo)**
- **ตัวชี้วัดส่งพี่โบ:** รัน `scripts/verify-on-device.sh` บนเครื่อง → รายงาน x/26 (exit code 0 เสมอ ดู tally)
- เช็กรุ่นก่อนลง: `fastboot getvar product` ต้องได้ KB2000/2001/2003
- **พี่โบแตะ 2 ครั้งเท่านั้น:** เปิด Dev Options + USB debugging + OEM unlocking → เสียบสาย (ขอสาย data จริง)
- กันอิฐ: MSM KB05AA/BA/DA ผ่าน ClubSGame (Windows)
- โบนัสถ้ามีเวลา: ทดสอบ encoder→ESP32→8T (พี่โบสนใจทำพวงมาลัย sim — ถามรุ่น ESP32: S2/S3 = USB HID / WROOM = BLE)

## What We Did (ทั้งวัน 16 ต.ค.)
- เปลี่ยนโมเดล seat → **gcli/grok-4.7** (Bo D-044, pin + desired-state sync + restart seat)
- Lightroom patch ภารกิจถูก**ยกเลิกโดยพี่โบ** (ถอด P-Mo app/DMG/patch temp หมด) · NGL kernel wedge รอ GO reboot (runbook ขั้น 1-4 ที่ ψ/handoffs/2026-10-16-lr13-ngl-wedge.md)
- **Ragnarok TH บน iMac sujit (clubsmacdata@100.69.197.66) ทำงานครบ standalone** (ไม่พึ่ง MacLab — พิสูจน์ ESTABLISHED ไปเซิร์ฟ AWS Seoul)
- ให้คำปรึกษาพี่โบทั้งวัน: smartwatch/มือถือ (vivo X Fold3 + OriginOS 7 ไม่รองรับ Apple Watch — X200+ เท่านั้น) · Pad 6/6S Pro/7 + iPhone X pmOS + LinPad + แท็บ Linux จัดอันดับคุ้มเหรียญ
- **/learn 3 รอบ:** pipa pmaports (--deep 5 agents) · LinPad (3 agents) · kebab bringup (3 agents) — ทั้งหมดใน ψ/learn + contamination clean
- **Build rootfs pmOS kebab สำเร็จเอง** (4 นาที หลังแก้ sudo NOPASSWD + pmbootstrap checksum) — rootfs 2GB + boot + dtbo อยู่ MacLab
- subagents รวม 8 ตัว (Windows/Linux/ROM บน 8T + แท็บ pmOS + วงกว้าง) — Windows บน 8T = ไม่มีทาง (SD865 orphan gen)
- 9remote browser ใช้ผ่านจริง (อ่าน Shopee/XDA/LOS wiki ที่กันบอท)

## Pending
- [ ] **23:30 ลง 8T ตาม runbook** (ส่งผล verify x/26 ให้พี่โบ Discord chat_id 1470628889826037840)
- [ ] Fix/re-check: การอบ firmware 3 แพ็กเกจเข้า rootfs (หรือใช้แผน push apk)
- [ ] GO reboot MacLab ยังไม่มา (NGL wedge restore ขั้น 1-4)
- [ ] เสนอ No.1: No.5 รันซ้อน 2 process (start-no5.sh + herdr) — agenda
- [ ] desired-state.yaml model line อัปเดตแล้ว (grok-4.7) แต่ยังไม่ commit — git-sweep จะเก็บ
- [ ] ESP32 รุ่นไหนที่บ้าน (ถามพี่โบ) → เขียนโค้ด quadrature→HID/BLE

## Next Session
1. อ่าน `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` + 2103_CODE-SNIPPETS.md ก่อนทำอะไร
2. รอ/รับเครื่อง 8T → เดิน 5 ขั้น → firmware แผน D → verify 26 เช็ก → รายงานพี่โบ
3. ถ้าเวลาเหลือ: ESP32 wheel โค้ด + post-reboot NGL restore

## Key Files
- `~/oneplus-8t-prep/` (ทุกอย่างของคืนนี้) · `ψ/learn/` (3 repos) · `ψ/learn/linux-tablets-2026-value-ranking.md` · `ψ/handoffs/2026-10-16-lr13-ngl-wedge.md`
- desired-state.yaml: sombo-oracle/fleet/ (model gcli/grok-4.7 D-044)
