# Claude Code Best (CCB) — Quick Reference Guide

> [!NOTE]
> **No.6 Gemini จาก ai-core** | **Timestamp**: 2026-07-16T20:45:00+07:00
> เอกสารอ้างอิงฉบับย่อสำหรับระบบ **Claude Code Best v5 (CCB)** ซึ่งได้รับการกู้คืนและเพิ่มความสามารถจากเวอร์ชัน CLI ดั้งเดิมของ Anthropic โดยทีมพัฒนา CCB

---

## 1. ข้อมูลภาพรวมและขอบเขตการทำงาน (Comprehensive Overview)
**Claude Code Best (CCB)** เป็นระบบที่ถูก Reverse-engineered และกู้คืนความสามารถ (Restored) จาก **Claude Code CLI** ของ Anthropic โดยมีเป้าหมายหลักในการกู้คืนฟีเจอร์หลัก (Core functionalities) ให้กลับมาทำงานได้สมบูรณ์ในระดับ Enterprise โดยปิดจุดตรวจสอบสิทธิ์ภายนอก (External constraints) และปรับปรุงให้สามารถทำงานได้โดยไม่ต้องมีบัญชีทางการของ Anthropic (Login-free) โดยยังคงความเข้ากันได้แบบ 100% กับการตั้งค่าดั้งเดิมของ Claude Code

### โครงสร้างทางสถาปัตยกรรม (Architecture)
- **Runtime**: พัฒนาขึ้นโดยใช้ **Bun (>= 1.3.11)** เป็นหลัก (ไม่รองรับ Node.js ในส่วนพัฒนา แต่โค้ดที่สร้างขึ้นรองรับการรันผ่าน Node.js ได้)
- **Build System**: ใช้ระบบ **Code Splitting** ผ่าน `build.ts` ในการกระจายไฟล์ออกเป็น chunk ย่อย ๆ กว่า 450 chunk เพื่อลดขีดจำกัดหน่วยความจำ (RSS) จาก ~1GB (กรณีไฟล์เดียว 17MB) ลงมาเหลือเพียง ~35MB ในการโหลดเริ่มต้น
- **Monorepo Structure**: แบ่งโมดูลออกเป็น 17 workspaces ภายใต้โฟลเดอร์ `packages/` เช่น:
  - `@ant/ink`: Fork ของ Ink Terminal Rendering
  - `@ant/computer-use-mcp`: ระบบควบคุม GUI หน้าจอ
  - `builtin-tools`: รวมเครื่องมือบิวต์อินหลักกว่า 60 ตัว
  - `workflow-engine`: เอนจินรันงานแบบกำหนดเงื่อนไข (Deterministic Workflow)
  - `remote-control-server` & `cloud-artifacts`: ระบบจัดการรีโมตและจัดเก็บ HTML

---

## 2. วิธีการติดตั้ง (Installation Methods)

### วิธีที่ 1: ติดตั้งแบบรันด่วนจาก NPM (Recommended)
ไม่ต้องดาวน์โหลด/โคลนโปรเจกต์ สามารถติดตั้งผ่าน npm ทั่วไปได้ทันที:
```bash
npm i -g claude-code-best

# เรียกใช้งานแบบดั้งเดิม (รันผ่าน Node.js)
ccb

# เรียกใช้งานในรูปแบบที่รันบน Bun
ccb-bun

# คำสั่งอัปเดตเวอร์ชันล่าสุด
ccb update
```

### วิธีที่ 2: ติดตั้งจากซอร์สโค้ดเพื่อพัฒนา (Source Code Installation)
หากต้องการแก้ไขโค้ดหรือศึกษาโครงสร้างโปรเจกต์:
1. ตรวจสอบเวอร์ชันของ Bun:
   ```bash
   bun --version   # ควรใช้ >= 1.3.11
   bun upgrade     # อัปเดต Bun
   ```
2. ติดตั้ง Dependencies และทดสอบการทำงาน:
   ```bash
   cd /path/to/claude-code
   bun install
   bun run dev     # เข้าสู่โหมดพัฒนา (REPL TUI)
   ```
3. การทดสอบและการตรวจสอบประเภท (Quality & Precheck):
   ```bash
   bun test          # รันยูนิตเทสทั้งหมด
   bun run precheck  # ทำความสะอาดโค้ด ตรวจประเภท และเทสพร้อมกัน (ต้องผ่าน 100%)
   ```

---

## 3. ฟีเจอร์หลักและตัวอย่างการใช้งาน (Key Features & Examples)

### 3.1 Goal-Driven Execution Loop (`/goal`)
ระบบจะขับเคลื่อนการรัน Agent ต่อเนื่องหลายรอบโดยอัตโนมัติจนกว่าจะบรรลุเป้าหมายที่กำหนด พร้อมฟังก์ชันตรวจสอบงบประมาณ Token
* **ตัวอย่างการใช้งาน**:
  ```
  /goal "ตรวจสอบความเสถียรของเซิร์ฟเวอร์ ออกแบบบิลด์สคริปต์ และเขียนเทสคลุมอย่างน้อย 80%"
  ```
* **คำสั่งย่อย**:
  - `/goal pause` — หยุดชั่วคราว
  - `/goal resume` / `/goal continue` — ทำงานต่อ
  - `/goal clear` — ล้างคิวเป้าหมาย

### 3.2 HTML Artifacts Hosting (`/artifacts`)
อัปโหลดรายงาน หน้าจอ HTML หรือกราฟฟิก Dashboard ขึ้นไปยัง Cloudflare Worker และ R2 Bucket สาธารณะชั่วคราว (หมดอายุอัตโนมัติใน 7 หรือ 30 วัน)
* **ตัวอย่างการใช้งาน**:
  ```
  /artifacts           # เปิดระบบจัดการ Artifacts ล่าสุด
  ```

### 3.3 Ultraplan & Workflow Scripts (`/workflows`)
กำหนดรูปแบบกระบวนการทำงานที่แน่นอน (Deterministic Workflow) ในรูปแบบ JavaScript เพื่อควบคุมหรือจัดสรร Agent ย่อยหลายตัวทำงานร่วมกัน
* **ตัวอย่างไฟล์สคริปต์ (`.claude/workflows/custom.js`)**:
  ```javascript
  export const meta = {
    name: 'audit-code',
    description: 'รันสคริปต์ตรวจสอบความปลอดภัยและจัดทำผลลัพธ์',
    phases: [{ title: 'Audit' }, { title: 'Report' }]
  }
  const codebase = await agent("อ่านซอร์สโค้ดในโฟลเดอร์ src/", { phase: 'Audit' });
  const report = await agent(`เขียนสรุปรายงานความเสถียรจากเนื้อหานี้: ${codebase}`, { phase: 'Report' });
  return report;
  ```
* **คำสั่งรัน**:
  ```
  /workflows           # เปิดหน้าต่าง UI ตรวจสอบสเตทของ workflow
  /ultraplan <prompt>  # วางแผนขั้นสูงแยกขั้นตอน
  ```

### 3.4 Pipe IPC & LAN Pipes 群控 (Multi-Machine Group Control)
จำลองหรือเชื่อมต่อ Claude Code หลายตัวในวง LAN เดียวกันผ่าน UDP Multicast (Port 7101) และคุยกันผ่าน TCP ในการส่งคำสั่งข้ามเครื่อง
* **ตัวอย่างการใช้งาน**:
  ```
  /pipes               # ค้นหาและดูสถานะเครื่องทั้งหมดในเน็ตเวิร์ก
  /pipes select <name> # เลือกเครื่องที่ต้องการส่งต่อคำสั่ง
  /send <name> <msg>   # ส่งข้อความควบคุมไปยังเครื่องนั้นๆ
  ```

### 3.5 Poor Mode 穷鬼模式 (`/poor`)
โหมดประหยัด Token สำหรับผู้ใช้งานที่กังวลเรื่องค่าใช้จ่าย โดยจะทำการปิดการสรุปความจำระยะยาว (memory extraction) และปิดตัวช่วยแนะนำโค้ดล่วงหน้า
* **ตัวอย่างการใช้งาน**:
  ```
  /poor                # สลับเปิด/ปิดโหมดประหยัด Token
  ```

### 3.6 Voice Mode 语音输入 (`/voice`)
เปิดใช้การรับสัญญาณเสียงด้วยเสียงพูดแบบ Push-to-Talk (ผ่าน Doubao SDK หรือ Nova STT) แล้วแปลงเป็นข้อความป้อนเข้าทันที
* **ตัวอย่างการใช้งาน**:
  ```
  /voice doubao        # เริ่มงานด้วยการกรอกเสียงผ่าน Doubao ASR
  ```

### 3.7 Computer & Chrome Use
ระบบจับภาพหน้าจอและควบคุมเมาส์คีย์บอร์ด หรือเรียกใช้งานเว็บเบราว์เซอร์ Chrome ผ่านระบบ MCP
* **ตัวอย่างคำสั่งเปิดใช้**:
  ```bash
  bun run dev -- --chrome
  ```

---

## 4. ตัวเลือกการตั้งค่าทั้งหมด (Configuration Options)

ระบบรองรับการตั้งค่าจากหลายแหล่ง (SETTING_SOURCES) โดยมีลำดับการเขียนทับตามลำดับความสำคัญจากน้อยไปมากดังนี้:
1. `userSettings` (ระบบส่วนตัวของ User)
2. `projectSettings` (แชร์ภายในโฟลเดอร์โปรเจกต์)
3. `localSettings` (การตั้งค่าที่ถูก Ignore ใน Git)
4. `flagSettings` (ป้อนข้อมูลจาก CLI Arguments)
5. `policySettings` (นโยบาย Enterprise ควบคุมโดยผู้ดูแลระบบ)

### 4.1 ตำแหน่งและไฟล์คอนฟิก (File Paths)
- **Global User settings**: `~/.claude/settings.json` (หรือ `cowork_settings.json` หากใช้โหมด Co-work)
- **Shared Project settings**: `.claude/settings.json` (อยู่ในโฟลเดอร์โปรเจกต์)
- **Gitignored Local settings**: `.claude/settings.local.json`
- **Enterprise Policy settings**: `managed-settings.json` และโฟลเดอร์ `managed-settings.d/*.json`
- **MCP server list**: `.mcp.json` / `managed-mcp.json`

### 4.2 ข้อมูลตัวเลือกการตั้งค่าที่สำคัญ (Configuration Schema)

| ฟิลด์คอนฟิก (Field Name) | ประเภทข้อมูล | รายละเอียด / หน้าที่ |
| :--- | :--- | :--- |
| `modelType` | String (`anthropic` \| `openai` \| `gemini` \| `grok`) | ระบุผู้ให้บริการ API หลัก |
| `model` | String | ระบุชื่อโมเดลเฉพาะเจาะจงที่จะใช้ |
| `respectGitignore` | Boolean (Default: `true`) | ควบคุมการมองเห็นไฟล์ตามกฎ `.gitignore` |
| `cleanupPeriodDays` | Number (Default: `30`) | ระยะเวลาเก็บประวัติสนทนา (`0` คือปิดบันทึก) |
| `statusLineEnabled` | Boolean (Default: `false`) | แสดงแถบสถานะการใช้ Token, ราคา, รุ่นโมเดล ที่ท้ายหน้าจอ |
| `permissions.allow` | Array (PermissionRule) | กฎที่อนุญาตให้รันคำสั่งหรืออ่านเขียนไฟล์ได้อัตโนมัติ |
| `permissions.deny` | Array (PermissionRule) | กฎที่ปฏิเสธการรันคำสั่งโดยไม่ต้องตรวจสอบ |
| `permissions.ask` | Array (PermissionRule) | กฎที่กำหนดให้ต้องกดยืนยันจากมนุษย์ก่อนรันคำสั่งเสมอ |
| `permissions.defaultMode` | String (`auto` \| `default` \| `plan` \| `dontAsk` \| `bypass`) | สเตทของสิทธิ์ในการเข้าถึง API |
| `enableAllProjectMcpServers`| Boolean | ตรวจรับสิทธิ์เซิร์ฟเวอร์ MCP ทั้งหมดในโปรเจกต์โดยอัตโนมัติ |
| `enabledPlugins` | Object | พารามิเตอร์รันปลั๊กอินในรูปแบบ `plugin-id@marketplace` |

### 4.3 ตัวแปรสภาพแวดล้อมที่สำคัญ (Environment Variables)

- **API Configuration**:
  - `CLAUDE_CODE_USE_OPENAI=1` (เมื่อต้องการเปลี่ยนไปใช้ DeepSeek/OpenAI endpoint)
  - `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
  - `CLAUDE_CODE_USE_GEMINI=1`
  - `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL`
  - `CLAUDE_CODE_USE_GROK=1`
  - `GROK_API_KEY`, `GROK_BASE_URL`, `GROK_MODEL`
- **Remote Control & Hosting**:
  - `CLAUDE_BRIDGE_BASE_URL` — ที่อยู่เซิร์ฟเวอร์ RCS (เช่น `https://rcs.example.com`)
  - `CLAUDE_BRIDGE_OAUTH_TOKEN` — โทเคนสำหรับเข้าใช้ระบบ RCS ของผู้ใช้
- **Feature Flags**:
  - `FEATURE_<NAME>=1` — บังคับเปิดสเตทโมดูลฟีเจอร์ต่าง ๆ (เช่น `FEATURE_BUDDY=1`, `FEATURE_WORKFLOW_SCRIPTS=1`)

---

## 5. บันทึกการสอบทวนเชิงลึก (Cross-Verification: nazt's session-id booklet)

ผมได้ทำการสอบทวนเนื้อหาข้อมูลทางเทคนิคของหนังสือพกพา **"ถอดรหัส session-id ของ Claude Code"** เปรียบเทียบกับโค้ดต้นฉบับจริงใน Fork เวอร์ชัน **v2.8.3** แล้ว พบข้อมูลสอดคล้องกันอย่างสมบูรณ์แบบ โดยมีรายละเอียดความสอดคล้องและการขยับตัวของบรรทัด (Version Skew) ดังนี้:

### 5.1 การสุ่มค่าและชนิดของ Session ID
* **ข้อเท็จจริงในโค้ด (v2.8.3):** สัญญาณเริ่มต้นค่า `sessionId` อยู่ที่ [src/bootstrap/state.ts:326](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/bootstrap/state.ts#L326) โดยเรียกใช้ `randomUUID() as SessionId` เมื่อผู้ใช้รันขึ้นมาใหม่แบบไม่ระบุธง
* **การตรวจสอบรูปแบบ (Regex Shape):** ตรวจสอบใน [src/utils/uuid.ts:4-5](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/utils/uuid.ts#L4-L5) โดยกำหนดตัวแปร `uuidRegex` ตรวจสอบเฉพาะหน้าตาภายนอก (Shape 8-4-4-4-12 ตัวอักษร hex) โดยไม่มีการเช็ค version nibble หรือ variant bit จริง ส่งผลให้รหัส UUID ที่สร้างขึ้นแบบ readable space หรือการเขียนมือผ่าน regex ได้ทั้งหมด

### 5.2 การเกิดข้อผิดพลาด "Session ID already in use"
* **การเช็คความมีอยู่ของไฟล์บนดิสก์:** ค้นพบฟังก์ชัน `sessionIdExists(sessionId: string)` ใน [src/utils/sessionStorage.ts:402-412](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/utils/sessionStorage.ts#L402-L412) โดยใช้คำสั่ง `fs.statSync(sessionFile)` เพื่อตรวจสอบไฟล์เสียงหรือ log ในรูปแบบ `<id>.jsonl` ใต้โปรเจกต์ หากไฟล์นี้ยังค้างอยู่บนดิสก์ (แม้เอเจนต์หรือโปรเซสจะหยุดทำงานแล้ว) จะส่งค่ากลับเป็น `true` เสมอ
* **การบล็อกเมื่อรันซ้ำ:** โค้ดใน [src/main.tsx:1725-1728](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/main.tsx#L1725-L1728) จะประเมินผลลัพธ์จากฟังก์ชันข้างต้น หากพบว่ามีอยู่แล้ว จะทำแท้งโปรแกรมทันทีด้วยคำเตือน `Error: Session ID [id] is already in use.` และสั่ง `process.exit(1)`
* *หมายเหตุเรื่อง Version Skew:* ในเอกสารดั้งเดิมระบุตำแหน่งบรรทัดของ `main.tsx` ไว้ที่บรรทัด 1297-1298 (อ้างอิงจาก v2.1.87) แต่ในเวอร์ชันปัจจุบัน (v2.8.3) มีการเลื่อนขยับ (Drift) ลงมาอยู่ที่บรรทัด 1726-1727 เนื่องจากมีการเพิ่มเติมฟีเจอร์ตัวเลือกรับอาร์กิวเมนต์ใหม่ แต่กลไกการทำแท้งเหมือนเดิมทุกประการ

### 5.3 ตัวเลือกคู่หูในการสลับทางและการสืบทอด Env
* **การเช็คความขัดแย้งของธง:** ใน [src/main.tsx:1705-1712](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/main.tsx#L1705-L1712) ตรวจพบ guard ป้องกันการเขียนทับโดยไม่อนุญาตให้ใช้ `--session-id` ร่วมกับ `--continue` หรือ `--resume` เว้นแต่จะระบุ `--fork-session` พ่วงไปด้วยเพื่อแยกความแตกต่างในการ clone สเตตเซสชัน
* **การล้าง Env ใน Subprocess:** ใน [src/utils/subprocessEnv.ts:79-99](file:///root/.no6-home/ghq/github.com/claude-code-best/claude-code/src/utils/subprocessEnv.ts#L79-L99) มีการสั่ง `delete env[k]` คัดกรองตัวแปรละเอียดอ่อน เช่น `CLAUDE_CODE_OAUTH_TOKEN` ออกจากการส่งต่อไปยัง Child process ทุกตัว เพื่อป้องกันช่องโหว่ความปลอดภัย ส่งผลให้เกิดข้อผิดพลาด `Not logged in` เมื่อรัน nested `claude` CLI ภายในเอเจนต์โดยไม่ตั้งค่า Token ครอบไว้ชั่วคราว
