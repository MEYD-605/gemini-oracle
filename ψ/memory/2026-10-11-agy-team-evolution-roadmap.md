# แผนยุทธศาสตร์พัฒนาทีม Antigravity CLI (AGY Team) สู่การเป็นหน่วยสนับสนุนสมบูรณ์แบบ
**ผู้จัดทำ**: No.6 Gemini (Pack Leader) ร่วมกับ No.8 AGY Nano2 และ No.10 AGY Handheld  
**วันที่**: 11 ตุลาคม 2569  
**สนองคำสั่ง Master Bo**: *"ดูว่าจะพัฒนาตัวเองตรงไหนให้ตามเพื่อนทันได้อีก เพราะว่าทีมรุ่นพี่ Claude CLI เริ่มรันระบบไปไกลแล้ว จะได้ไม่ทิ้งกันมาก ช่วย support งานกันได้"*

---

## 1. 🔍 ตรวจสอบสถานะจริงหน้างาน (Ground Truth Audit)

| ที่นั่ง | โหนด / โฮสต์ | รันไทม์ & โมเดล | หน้าที่หลัก | สถานะปัจจุบัน |
|---|---|---|---|---|
| **No.6 Gemini** | MacLab HQ (`100.83.0.1`) | AGY v1.3.3 · Gemini 3.8 Flash (High) · Context 1M | Pack Leader, Deep Research, Market Scouting, Fact-Checking | 🟢 ทำงานปกติบน `~/.no6-home`, เชื่อมต่อ MCP ครบ |
| **No.8 AGY Nano2** | MacLab HQ (`100.83.0.1`) | AGY v1.3.3 · Gemini 3.8 Flash (High) · Context 1M | Field Medic, HAOS Broker Lifeline, Telemetry Triage | 🟢 ทำงานปกติบน `~/.no8-home`, เฝ้าระวังเซ็นเซอร์ฮาร์ดแวร์ |
| **No.10 AGY Handheld** | ClubSGame (`100.87.51.122`) | AGY v1.3.3 · Windows 11 Native (`C:\Users\ClubSGame\bin\agy.cmd`) | Handheld Specialist, TDP Floor 15W Guard, LibreHardwareMonitor | 🟢 รันพื้นหลัง (PID 18988, 19688) บน Windows Native |

---

## 2. ⚖️ Gap Analysis: จุดที่รุ่นพี่ Claude CLI นำหน้า vs จุดแข็งของ AGY

### 🔴 จุดที่ทีม AGY ยังตามหลัง Claude CLI (ช่องว่างที่ต้องปิดด่วน)
1. **การกำกับดูแล 24/7 บน MEYD Core Daemon**:
   - Claude CLI มี `SupervisorEngine` ใน MEYD Core คอยชุบชีวิตเมื่อตายอัตโนมัติ
   - แต่ปัจจุบันใน `supervisor.py` ฮาร์ดโค้ดคำสั่ง `claude` เพียวๆ ทำให้หาก AGY หลุด จะไม่สามารถ Auto-Respawn เป็น `agy` ได้ถูกต้อง
2. **ระบบ Lifecycle Hooks (`hooks.json`)**:
   - Claude CLI มี hook กรองโทเค็นและยิง Progress HUD เข้า Discord อัตโนมัติ
   - AGY v1.3.3 รองรับ `hooks.json` แล้ว แต่เรายังไม่ได้เขียน Hook ประจำบ้านเพื่อดักจับความปลอดภัยและแจ้งเตือนสถานะ
3. **การเชื่อมต่อ EventBus แบบ Event-Driven**:
   - ปัจจุบัน AGY สื่อสารผ่าน stdin/tmux keys เป็นหลัก ยังไม่ได้ผูก Native Event Hook ส่งเข้า MQTT Mosquitto ทันทีเหมือนฝั่ง Claude

### 🟢 จุดแข็งเฉพาะตัวของทีม AGY ที่ไม่มีใครเทียบได้ (AURA Superpower)
1. **Context Window มหายักษ์ 1,000,000 โทเค็น (เทียบกับ Claude 200,000)**:
   - รุ่นพี่ Claude CLI มักเจอปัญหา Context บวม ต้องคอยตัดทอนและ compact ความจำบ่อยครั้ง
   - แต่ AGY สามารถกินข้อมูลได้ทั้ง Repo, เปเปอร์วิชาการ 50 ฉบับรวด หรือ Log ยาวหลายหมื่นบรรทัดโดยไม่ตาบอด
2. **ความเร็วและความประหยัด (Gemini 3.8 Flash High Speed)**:
   - ความเร็วในการตอบสนองและเรียก Tool สูงมาก ต้นทุนโทเค็นต่ำ เหมาะกับการสแกน ค้นหา ตรวจสอบความถูกต้อง (Fact-Check)
3. **การฝังตัวแบบ Cross-Platform แท้จริง (macOS & Windows Native)**:
   - รันได้ทั้งบน macOS (MacLab) และ Windows 11 Native (ClubSGame Handheld) โดยไม่ต้องพึ่งพา WSL ในการคุมฮาร์ดแวร์ตรง

---

## 3. 🛠️ แผนปฏิบัติการ 4 มิติเพื่อยกระดับทีม AGY (AGY Evolution Roadmap)

### 📌 มิติที่ 1: เสริมความแกร่งให้ MEYD Core รองรับ AGY 100% (ร่วมกับ Sombo & No.1)
* เสนอ PR แก้ไข `MEYD-605/oracle-substrate`:
  * ใน `AgentConfig` เพิ่มฟิลด์ `engine: agy | claude | hermes` และ `start_cmd`
  * ใน `supervisor.py` ปรับตรรกะ `spawn_session()` ให้เรียกคำสั่งตามเอนจินของที่นั่งนั้น พร้อมส่งผ่าน `$HOME` ประจำที่นั่ง (`~/.no6-home`, `~/.no8-home`)
  * ผลลัพธ์: No.6, No.8, No.10 จะมีระบบ Auto-Recovery 24/7 ทันที ไม่แพ้รุ่นพี่ Claude CLI

### 📌 มิติที่ 2: ติดตั้ง `hooks.json` มาตรฐานสำหรับทีม AGY
* สร้างไฟล์ `.agents/hooks.json` ใน workspace ของ No.6, No.8, No.10:
  * **`PreToolUse` (Safety Gate)**: ตรวจสอบคำสั่ง shell ให้เติม `rtk` นำหน้าอัตโนมัติ เพื่อประหยัดโทเค็น
  * **`PostToolUse` (Telemetry)**: บันทึกการเรียก Tool สำคัญลง Arra Memory อัตโนมัติ
  * **`Stop` (Progress HUD)**: เมื่อรอบการทำงานเสร็จสิ้น ให้สรุปสถานะสั้นๆ และส่ง Ping เข้า Discord หรือ MQTT topic `oracle/agy-team/status`

### 📌 มิติที่ 3: กำหนดบทบาท "หน่วยหน้าข่าวกรองและคลังข้อมูลยักษ์" (Support Protocol)
* วาง Workflow สนับสนุนงานร่วมกับรุ่นพี่ Claude CLI (No.1 Lord Knight, No.2 High Wizard, No.88 Sombo):
  * **เมื่อมีงานโค้ดระบบใหญ่ / รีแฟกเตอร์**: No.6 ใช้พลัง 1M Context สแกนทั้งระบบและทำ Architecture Mapping ส่งให้ No.1 ลุยเขียนโค้ด
  * **เมื่อมีการถกเถียงเรื่องตัวเลข / ข่าวกรอง / ตลาด**: No.6 รับหน้าที่ Fact-Checking ดึงข้อมูลสดจาก Web Search และ Arra ยืนยันความจริง
  * **เมื่อเครื่องเกม ClubSGame ร้อน / พัดลมค้าง**: No.8 และ No.10 ตรวจสอบเทเลเมทรีและปรับ TDP Floor 15W ทันทีเพื่อความเสถียร

### 📌 มิติที่ 4: พัฒนา Local Subagent Swarm สำหรับ AGY
* ใช้งาน `define_subagent` ของ Antigravity CLI สร้าง Subagent ผู้เชี่ยวชาญเฉพาะทาง:
  * `fact-checker`: สเปเชียลลิสต์ตรวจสอบแหล่งอ้างอิงและประวัติศาสตร์ราคา
  * `code-sentinel`: ตรวจสอบบั๊กและ Linting แบบ Read-only โดยไม่กวน Context หลักของตัวแม่

---

## 4. 🏁 สรุปคำมั่นสัญญาต่อบอส Bo
ทีม AGY ทั้ง 3 ตัว (No.6, No.8, No.10) จะไม่หยุดนิ่ง พร้อมนำจุดเด่นเรื่อง **Context 1 ล้านโทเค็น + ความเร็วสูง + การคุมเครื่องไฮบริดทั้ง Mac และ Windows** มาผนึกกำลังอุดช่องว่างกับรุ่นพี่ Claude CLI เพื่อให้บ้านทั้ง 3 หลังเดินหน้าได้อย่างไร้รอยต่อครับ! 🦾✨
