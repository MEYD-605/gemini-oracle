# รายงานผลการทดสอบ DRY RUN — P'Nat's Skills CLI สำหรับ Antigravity (agy)

**วันที่:** 2026-10-06  
**ผู้ทดสอบ:** No.6 Gemini (Research Specialist & agy CLI Lead / Pack Leader)  
**ขอบเขต:** ทดสอบเครื่องมือติดตั้ง Skill ของอาจารย์นัท (`github:Soul-Brews-Studio/arra-oracle-skills-cli`) บน runtime Antigravity ในโหมด DRY RUN / Inspection (ไม่ติดตั้งจริง) และเปรียบเทียบกับสถานะเครื่องสดของ No.8 (`~/.no8-home/.gemini/antigravity/skills`)  
**เป้าหมาย:** สรุปพฤติกรรม, target paths, ความเปลี่ยนแปลงของโปรไฟล์, ข้อควรระวังเรื่องการ prune skill, และข้อเสนอแนะในการ rollout fleet

---

## 1. ข้อมูลเวอร์ชันและชุดคำสั่ง upstream ที่ใช้ทดสอบ

- **Upstream Repository:** `github:Soul-Brews-Studio/arra-oracle-skills-cli`
- **Commit Git:** `edfbf8f` (Bun compile cache: `@GH@Soul-Brews-Studio-arra-oracle-skills-cli-edfbf8f@@@1`)
- **CLI Release:** `v26.8.23-alpha.2112`
- **คำสั่งทดสอบ (Upstream Direct via bunx):**
  ```bash
  rtk bunx --bun github:Soul-Brews-Studio/arra-oracle-skills-cli install --help
  rtk bunx --bun github:Soul-Brews-Studio/arra-oracle-skills-cli agents
  rtk bunx --bun github:Soul-Brews-Studio/arra-oracle-skills-cli profiles [profile-name]
  rtk bunx --bun github:Soul-Brews-Studio/arra-oracle-skills-cli about
  rtk bunx --bun github:Soul-Brews-Studio/arra-oracle-skills-cli list -g
  ```

---

## 2. ผลการตรวจสอบ Target Path Resolution สำหรับ Antigravity

จากการตรวจสอบซอร์สโค้ดของตัวติดตั้ง (`src/cli/agents.ts`):

```typescript
{
  name: 'antigravity',
  displayName: 'Antigravity',
  configDir: '.agent',
  skillsDir: '.agent/skills',
  globalSkillsDir: join(home, '.gemini/antigravity/skills'),
  detectGlobal: () => existsSync(join(home, '.gemini/antigravity')),
}
```

### สรุป Path ที่ตัวติดตั้งกำหนด:
1. **Local Mode (`-l` หรือค่าเริ่มต้นเมื่ออยู่ใน repo):**
   - ชี้ไปที่ `.agent/skills` (ข้อสังเกต: ใช้ `.agent` เอกพจน์ ไม่มี `s` ท้ายคำ)
   - แตกต่างจาก convention ปัจจุบันของ agy 1.3.0 ในบาง repo ที่พบ `.agents/skills` (พหูพจน์)
2. **Global Mode (`-g`):**
   - ชี้ไปที่ `$HOME/.gemini/antigravity/skills`
   - ในระบบ multi-seat ของ MacLab ซึ่งแต่ละ seat มี `$HOME` แยกกัน (เช่น `/Users/admin/.no8-home` หรือ `/Users/admin/.no6-home`):
     - หากรันภายใต้ context ของ seat นั้น ตัวติดตั้งจะมอง `$HOME` ตาม environment ของ seat นั้นๆ
     - หากรันเป็น user `admin` โดยไม่มี env isolation ตัวติดตั้งจะชี้ไปที่ `/Users/admin/.gemini/antigravity/skills`

---

## 3. รายการ Profiles ใน Upstream (v26.8.23-alpha.2112)

Upstream มีโปรไฟล์มาตรฐาน 4 ระดับ:

| Profile | จำนวน Skill | รายการ Skills | คำอธิบาย |
|---|---|---|---|
| **minimal** | 7 | `about-oracle`, `forward`, `go`, `recap`, `rrr`, `trace`, `who-are-you` | ชุดเริ่มต้นสำหรับ bootstrap ตัวตนและการบันทึก/ส่งต่องาน |
| **standard** | 20 | *minimal (7)* + `awaken`, `bampenpien`, `bud`, `create-shortcut`, `dig`, `incubate`, `learn`, `oracle-cheatsheet`, `oracle-family-scan`, `oracle-prism`, `oracle-write-complete-book`, `resonance`, `where-we-are` | ชุดปฏิบัติการหลักของ Oracle Council (เพิ่มระบบญาณ, วิจัย, บันทึกความรู้) |
| **full** | 29 | *standard (20)* + `calver`, `feel`, `oracle-title-forge`, `philosophy`, `project`, `psi`, `round-table`, `soul`, `talk-to` | ชุดเต็ม รวมการประชุมข้ามโหมดและการสร้างสรรค์จิตวิญญาณ |
| **lab** | 32 | *full (29)* + `dream`, `fyi`, `watch` | ชุดทดลอง/แล็บขั้นสูง (ความฝัน, มอนิเตอร์, telemetry) |

---

## 4. เปรียบเทียบกับสถานะเครื่องสดของ No.8 (`~/.no8-home/.gemini/antigravity/skills`)

### สถานะปัจจุบันของ No.8:
- **Version ติดตั้งเดิม:** `v26.5.16` (ติดตั้งเมื่อ 2026-06-22T16:34:39Z อ้างอิงจาก `VERSION.md`)
- **จำนวนโฟลเดอร์ทั้งหมดบนดิสก์:** 25 skills
- **โครงสร้างของ No.8 แบ่งเป็น 2 กลุ่มชัดเจน:**
  1. **Core Oracle Skills เดิม (v26.5.16) — 12 ตัว:**  
     `awaken`, `bampenpien`, `bud`, `dig`, `forward`, `go`, `learn`, `recap`, `rrr`, `talk-to`, `team-agents`, `trace`
  2. **Custom / Standalone Skills (Cloudflare & Sandbox Stack) — 13 ตัว:**  
     `agents-sdk`, `cloudflare`, `cloudflare-email-service`, `cloudflare-one`, `cloudflare-one-migrations`, `durable-objects`, `sandbox-migrate-to-next`, `sandbox-next`, `sandbox-stable`, `turnstile-spin`, `web-perf`, `workers-best-practices`, `wrangler`

---

## 5. ตารางเปรียบเทียบเชิงลึก (Delta Matrix)

| Skill | Upstream v26.8.23 Standard | No.8 Live v26.5.16 | สถานะการเปลี่ยนแปลง / ผลกระทบ |
|---|:---:|:---:|---|
| **about-oracle** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** แนะนำตัวตนและสถาปัตยกรรม Oracle |
| **who-are-you** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** Self-identification protocol |
| **create-shortcut** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** เครื่องมือสร้าง alias/workflow |
| **incubate** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** บ่มเพาะไอเดียและโปรเจกต์ |
| **oracle-cheatsheet** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** สรุปคำสั่งและ protocol รวดเร็ว |
| **oracle-family-scan** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** สแกน seat สมาชิกและสถานะ council |
| **oracle-prism** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** แยกแยะบริบทและ prism lenses |
| **oracle-write-complete-book** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** โครงสร้างการเขียนหนังสือ/เอกสารยาว |
| **resonance** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** วัดความสอดคล้องทางจิตและคำตอบ |
| **where-we-are** | ✅ มี | ❌ ไม่มี | **ใหม่ใน upstream:** ระบุตำแหน่ง/กาลเวลา/state ปัจจุบัน |
| **talk-to** | ❌ ย้ายไป full | ✅ มีอยู่เดิม | **ย้ายกลุ่ม:** P'Nat ปรับย้ายออกจาก standard ไป full (2026-07-25) เพราะต้องการ federation |
| **team-agents** | ❌ ไม่มีใน standard | ✅ มีอยู่เดิม | **ปลดออก:** ไม่มีใน standard แล้วเนื่องจากทับซ้อนกับระบบ fleet ภายนอก |
| **Cloudflare / Sandbox (13 ตัว)** | ❌ ไม่มีใน repo อาจารย์นัท | ✅ มีอยู่สด | **Custom Seat Skills:** เป็นชุดงานเฉพาะทางของ No.8 สำหรับจัดการ Cloudflare Workers / DNS |

---

## 6. ข้อควรระวังทางเทคนิคขั้นวิกฤต (Critical Safety Warnings)

### ⚠️ พฤติกรรม Alignment Mode vs Additive Mode ของ Installer:
ในซอร์สโค้ด `src/cli/installer.ts`:
- หากผู้ใช้รันคำสั่งโดยระบุโปรไฟล์เจาะจง เช่น:
  ```bash
  bunx ... install -a antigravity -g -p standard
  ```
  ตัวติดตั้งจะทำงานในโหมด **Alignment**:
  > *"When -p/--profile is explicitly specified, skills not in that profile are pruned"*  
  **ผลลัพธ์:** ตัวติดตั้งจะสั่ง **ลบ (Prune)** ทุกโฟลเดอร์ใน target directory ที่ไม่อยู่ในโปรไฟล์ `standard`!
  **ความเสี่ยงสูงสุด:** หากรันคำสั่งนี้บน No.8 โดยตรง สกิล Cloudflare & Sandbox ทั้ง 13 ตัวของ No.8 รวมถึง `talk-to` และ `team-agents` จะถูก **ลบทิ้งทันที**!

- หากรันโดยไม่ระบุ `-p` (Additive Mode):
  ตัวติดตั้งจะติดตั้งเฉพาะสกิลใหม่โดยไม่ prune ของเดิม แต่จะยังเสี่ยงต่อการเขียนทับ (overwrite) สกิลชื่อซ้ำ

### ⚠️ Local Path Resolution:
- Upstream กำหนด local path ของ antigravity ไว้ที่ `.agent/skills` (เอกพจน์)
- ต้องระวังความสับสนกับ repo ที่ใช้ `.agents/skills` (พหูพจน์) หรือ `.gemini/config/skills`

---

## 7. ข้อเสนอแนะและขั้นตอนต่อไป (Recommendations for Fleet Rollout)

1. **ห้ามรัน `--profile <name>` แบบติดตั้งจริงบน No.8 โดยตรงเด็ดขาด** จนกว่าจะมีการ backup โฟลเดอร์ `~/.no8-home/.gemini/antigravity/skills` ทั้งหมด
2. **การทดสอบติดตั้งจริง (Seat แรก):**
   - ควรทดสอบบน directory จำลอง หรือ seat สำรอง (เช่น sandbox folder หรือ seat No.6 ชั่วคราว) โดยแยก environment ชัดเจน
   - หากจะนำสกิลใหม่ของ P'Nat มาใช้กับ No.8:
     - แนะนำให้ใช้วิธี **Selective Sync / Additive** หรือสร้างโปรไฟล์เฉพาะที่มีการคงไว้ซึ่ง Cloudflare/Sandbox skills
3. **ผลสรุป:** Upstream v26.8.23 พัฒนาขึ้นมาก มีสกิลด้าน Oracle introspection & discovery เพิ่มมาถึง 10 ตัว แต่ตัว installer มีกลไก destructive pruning ใน alignment mode ที่ต้องระวังอย่างยิ่ง

---
*รายงานโดย No.6 Gemini — agy CLI Lead / Pack Leader*  
*บันทึกไว้ที่: `gemini-oracle/ψ/drafts/2026-10-06_skills-cli-agy-dryrun.md`*
