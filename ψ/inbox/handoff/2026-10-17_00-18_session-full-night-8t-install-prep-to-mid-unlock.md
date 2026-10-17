# Handoff: 8T Install Night — จาก review แผน → เตรียมงานครบ → ลงมือถึงคิว unlock → ส่งต่อ Opus 5.5

**Date**: 2026-10-17 00:18 (+07)
**Context**: สูง (คืนยาว 2 ภารกิจต่อเนื่อง) — *ภารกิจ 8T ยังไม่จบ: ดู handoff ปฏิบัติการที่ `ψ/inbox/handoff/2026-10-17_00-16_oneplus-8t-mid-unlock-switch-to-opus.md` ก่อนทำอะไร*
📡 Session: 7730c32a | cartographer-oracle | ~1.5h (หลัง /clear 21:50)

## What We Did
- ประมวลผลรีวิว Opus 5.5 (156k tokens) → จุดตาย: **vendor อยู่ใน super** → แก้ runbook + สลับลำดับ (ดึง firmware ก่อน unlock)
- แก้เครื่องโหลด 20 → 3.9: OrbStack vmgr ค้าง spin 11 cores ตั้งแต่ 23 ก.ย. (สะสม 51 ชม. CPU) — ฆ่าทิ้ง
- แก้ fastboot/adb hang: binary โดน quarantine ทำ dyld ค้าง → copy inode ใหม่ + xattr -c (v37.0.1)
- โหลด firmware apk 4 ตัว Alpine edge 20260916 (ath10k/ath11k/qcom/qca — deps ปิดครบ, WCN6855×19 + a650_zap อยู่ในตัว)
- Rewrite INSTALL-RUNBOOK.md ฉบับคืนนี้ + ตาราง "อาการ→ทางแก้" จาก GitHub issue จริง + REGRESSIONS.md
- เจาะโค้ดเรื่องต่อจอ 3 ชั้น (patch 0014 fallback / 0021 mode-valid / ข้อจำกัดสาย pin C-D-E) รายงาน Bo
- /learn morluto/rea (REA reverse-engineering MCP — 3 docs, contamination-check ผ่าน) — Bo จะลงหลังจบภารกิจ
- **ลงมือจริงกับเครื่อง 8T KB2003** (serial 45a76adf): จับ adb ได้หลังฆ่า adb server ค้าง (port 5038 ค้างมาแต่เสาร์) → fastbootd → พบ `fetch` ไม่รองรับ + **twrp-kebab.img เสีย** (HTML bot-wall) → **scan พิสูจน์ rootfs มี blobs ครบ (adsp/cdsp/slpi/venus/a650_zap) = ตัดขั้นดึง firmware ทิ้งทั้งหมด** → unlock โดนเฉย 2 คำสั่ง → root cause: toggle "OEM unlocking" ยังปิด → รีบูตกลับ Android ให้ Bo เปิด
- Bo สั่งสลับ model กลางภารกิจ → pin = `cc/claude-opus-5-5` + เขียน handoff ส่งต่อ + Arra จด 2 รายการ + focus.md อัปเดต

## Uncommitted Files
- `ψ/focus.md` (M — git-sweep จะเก็บเอง) · ไฟล์ ψ/ ใหม่ทั้งหมด (handoffs/learn/memory — sweep เก็บแล้วส่วนใหญ่)
- ขยะเก่าไม่เกี่ยว: `.claude/mcp.json.bak`, `CLAUDE.md.bak`, `app/`, `start-no5.sh.bak` (ทิ้งไว้ตาม append-only)

## Pending
- [ ] **[ส่งต่อ Opus แล้ว]** 8T: รอ Bo "เปิดแล้ว" → flashing unlock → flash → apk → verify x/26 (ดู handoff 00:16)
- [ ] จบภารกิจ: **คืน pin `gcli/grok-4.7`** + sync `sombo-oracle/fleet/desired-state.yaml`
- [ ] ลง REA MCP (`npx rea-agents setup`) หลังจบ 8T — สำหรับวิเคราะห์ firmware Qualcomm ต่อ
- [ ] GO reboot MacLab → NGL restore ขั้น 1-4 (ψ/handoffs/2026-10-16-lr13-ngl-wedge.md)
- [ ] ถาม Bo รุ่น ESP32 → โค้ด quadrature→HID/BLE พวงมาลัย sim
- [ ] เสนอ No.1: No.5 รันซ้อน 2 process (start-no5.sh + herdr)
- [ ] adb server ค้างเป็นอาการประจำเครื่อง — ควรทำ LaunchAgent เช็ก/ฆ่าทิ้งเป็นระยะ (คืนนี้เจอ 2 รอบ)

## Next Session
- [ ] อ่าน `ψ/inbox/handoff/2026-10-17_00-16_oneplus-8t-mid-unlock-switch-to-opus.md` → ทำ 8T ต่อจน verify x/26 → รายงาน Bo (chat_id 1470628889826037840)
- [ ] จบแล้ว: คืน model pin + desired-state + ลง REA + แจ้ง fleet

## Key Files
- `ψ/inbox/handoff/2026-10-17_00-16_oneplus-8t-mid-unlock-switch-to-opus.md` ← **ตัวปฏิบัติการ**
- `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` + `apks/` (4 apk) + `tools/` (release r26)
- `ψ/learn/morluto/rea/2026-10-16/2247_*.md` (3 เอกสาร REA)
- Pin: `~/.claude/channels/discord-no5/anthropic-model` (ปัจจุบัน cc/claude-opus-5-5)
