# No.6 Gemini & No.8 Agy Nano2 — Instruction Files Fix Draft (Rows 34–38)
> **Date**: 2026-10-07
> **Author**: No.5 GmForge (Blueprint Keeper, drafted for Sombo 88 review per Bo directive)
> **Source Audit**: `sombo-oracle/ψ/drafts/2026-10-07_fleet-instruction-audit.md` (Rows 34–38)
> **Target Repos**: `gemini-oracle/` (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) & `agy-nano2-oracle/` (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`)
> **Status**: DRAFT ONLY — Do NOT apply or commit to live files until Bo / No.6 / No.8 / Sombo approve.
> **Style Alignment**: Follows Sombo's No.5 fix pattern (`cartographer-oracle` commit `a144752`), No.1 fix draft, No.2 fix draft, and gmgrok fix draft.
> **Security Notice**: Conforms strictly to zero-secrets rule — NO passwords copied into this draft.

---

## สรุปผลการตรวจสอบ (Verification Tally)
- **Verified Rows**: ✅ 5 (ตรวจสอบจากสภาพแวดล้อมจริงของเครื่อง MacLab และไฟล์ต้นฉบับ 100% ทุกแถว)

---

## รายละเอียดข้อเสนอแก้ไข Before ➔ After รายข้อ (พร้อมหลักฐานจริง)

### 📌 Row 34: `gemini-oracle/CLAUDE.md:13`, `AGENTS.md:10,55` & `GEMINI.md:10,66` (Invented Context % in Sign-off)
- **สถานะ**: ✅ ตรวจสอบแล้วตรงกับความจริง
- **หลักฐานเครื่องจริง**:
  - ตรวจสอบ Antigravity CLI (`agy` v1.3.0): ตัว `agy` runtime ไม่มีฟีเจอร์หรือสตรีมตัวเลข context usage ส่งออกมาให้ model อ่าน
  - ข้อความท้ายตอบที่ระบุ `[Context: ~X%]` เป็นตัวเลขที่โมเดลคาดเดาขึ้นมาเอง (Hallucination) โดยไม่มีแหล่งอ้างอิงจริง
- **Before (CLAUDE.md:13, AGENTS.md:10,55, GEMINI.md:10,66)**:
```markdown
- **Sign-off**: `🤖 No.6 Gemini จาก maclab [Context: ~X%]`
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- **Sign-off**: `🤖 No.6 Gemini จาก maclab`
```

---

### 📌 Row 35: `agy-nano2-oracle/CLAUDE.md:14`, `AGENTS.md:12,58` & `GEMINI.md:12,58` (Invented Context % in Sign-off)
- **สถานะ**: ✅ ตรวจสอบแล้วตรงกับความจริง
- **หลักฐานเครื่องจริง**:
  - เช่นเดียวกับ No.6 ตัว `agy` v1.3.0 ของ No.8 ไม่มี readout ตัวเลข context percentage ออกมาเช่นกัน
  - การสั่งให้ลงท้ายด้วย `[Context: ~X%]` บังคับให้โมเดลมโนตัวเลขขึ้นมาเอง
- **Before (CLAUDE.md:14, AGENTS.md:12,58, GEMINI.md:12,58)**:
```markdown
- **Sign-off**: `🤖 No.8 Agy Nano2 จาก maclab [Context: ~X%]`
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- **Sign-off**: `🤖 No.8 Agy Nano2 จาก maclab`
```

---

### 📌 Row 36: `gemini-oracle/AGENTS.md:24` & `GEMINI.md:35` (Retired SSH user `onexplayer`)
- **สถานะ**: ✅ ตรวจสอบแล้วตรงกับความจริง
- **หลักฐานเครื่องจริง**:
  - ผู้ใช้งานจริงบนเครื่องเกม ClubSGame ถูกเปลี่ยนเป็น `ClubSGame` อย่างเป็นทางการแล้ว (บันทึกใน `GEMINI.md:12` และ Arra ID `1f304372-6c01-4899-83bc-7f027d59d94f`)
  - ชื่อผู้ใช้ `onexplayer` เกษียณและเลิกใช้งานแล้ว การระบุว่า `onexplayer (หรือ ClubSGame)` สร้างความสับสนและ drift ข้ามเอกสาร
- **Before (AGENTS.md:24 & GEMINI.md:35)**:
```markdown
- Tailscale: `clubsgame` / `desktop-umn5fjv` · SSH user `onexplayer` (หรือ `ClubSGame`) · keys พร้อมใน `~/.ssh`
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- Tailscale: `clubsgame` / `desktop-umn5fjv` · SSH user `ClubSGame` · keys พร้อมใน `~/.ssh`
```

---

### 📌 Row 37: `agy-nano2-oracle/AGENTS.md:16,28` & `GEMINI.md:16,28` (Plaintext Windows/RDP Password Security Risk)
- **สถานะ**: ✅ ตรวจสอบแล้วตรงกับความจริง
- **หลักฐานเครื่องจริง**:
  - ตรวจพบรหัสผ่านแบบ Plaintext ของเครื่อง Windows/RDP ปรากฏอยู่ในไฟล์คำสั่ง `AGENTS.md` (บรรทัดที่ 16 และ 28) และ `GEMINI.md` (บรรทัดที่ 16 และ 28) ของ `agy-nano2-oracle`
  - ข้อความระบุรหัสผ่านนี้ถูก commit เข้า git และถูกโหลดเข้าสู่ System Prompt ทุกๆ ครั้งที่โมเดลตื่นขึ้นมาทำงาน ซึ่งผิดกฎความปลอดภัยพื้นฐานของฟลีท (Zero-secrets in git/instruction files)
- **Before (ตำแหน่งที่มีรหัสผ่าน)**:
```markdown
- **ชื่อ user**: `ClubSGame` (Password: `[PLAINTEXT_SECRET_REDACTED]`)
- Windows RDP (port 3389): enabled for `ClubSGame` (`[PLAINTEXT_SECRET_REDACTED]`)
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- **ชื่อ user**: `ClubSGame` (รหัสผ่านจัดเก็บในที่ปลอดภัย ไม่บันทึกลงไฟล์คำสั่ง)
- Windows RDP (port 3389): enabled for `ClubSGame` (ดึง credentials จากที่จัดเก็บลับเฉพาะส่วนบุคคล)
```
*(คำแนะนำ: ย้ายรหัสผ่านออกจากไฟล์เอกสารที่ track ใน git ไปเก็บไว้ใน environment หรือไฟล์ uncommitted เฉพาะ)*

---

### 📌 Row 38: `gemini-oracle` & `agy-nano2-oracle` (Stale Federation Tags)
- **สถานะ**: ✅ ตรวจสอบแล้วตรงกับความจริง
- **หลักฐานเครื่องจริง**:
  - `tmux list-sessions` และ `maw list`: ชื่อเซสชันจริงคือ `06-gemini` และ `08-agy-nano2`
  - ใน `gemini-oracle/AGENTS.md:9` และ `GEMINI.md:9` ระบุว่า `[maclab:no6]`
  - ใน `agy-nano2-oracle/AGENTS.md:11` และ `GEMINI.md:11` ระบุว่า `[maclab:agy-nano2]`
  - ทำให้แท็กการสื่อสารของ Federation ผิดเพี้ยนจากรูปแบบมาตรฐานสองหลัก (`NN-name`)
- **Before (`gemini-oracle/AGENTS.md:9` & `GEMINI.md:9`)**:
```markdown
- **Federation tag**: `[maclab:no6]`
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- **Federation tag**: `[maclab:06-gemini]`
```
- **Before (`agy-nano2-oracle/AGENTS.md:11` & `GEMINI.md:11`)**:
```markdown
- **Federation tag**: `[maclab:agy-nano2]`
```
- **After (ข้อเสนอแก้ไข)**:
```markdown
- **Federation tag**: `[maclab:08-agy-nano2]`
```

---
*Drafted by No.5 GmForge (Blueprint Keeper) — Waiting for Bo / No.6 / No.8 / Sombo review*
