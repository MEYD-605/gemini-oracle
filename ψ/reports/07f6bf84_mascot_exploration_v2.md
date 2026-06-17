# 🤖 Mascot Reuse Assets - Codebase Exploration Report

เอกสารฉบับนี้รายงานผลการสำรวจซอร์สโค้ดและไลบรารีในระบบเพื่อค้นหาทรัพยากร (โค้ดอนิเมชัน, Walk-cycle, Canvas/SVG avatar, ดีไซน์หุ่นยนต์ และระบบอนิเมชัน) ที่สามารถนำมาประยุกต์ใช้ต่อเพื่อพัฒนาฟีเจอร์ **Robot Mascot** บน Oracle Board

---

## 1. ผลการสำรวจพบทรัพยากรที่นำมาใช้ต่อได้

จากการใช้คำสั่ง `ghq list` และ `ls` สำรวจเจาะจงรายไดเรกทอรี พบส่วนประกอบสำคัญแยกตามหมวดหมู่ดังนี้:

### 1.1 โค้ดอนิเมชันสไปรต์และการจัดการเฟรม (2D Sprite & Walk-Cycle)
* **Repository:** [Soul-Brews-Studio/maw-ui](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui)
  * **Path:** `office-8bit/` (Rust + Bevy Engine v0.15)
  * **ไฟล์สำคัญ:** [agents.rs](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui/office-8bit/src/agents.rs)
  * **สิ่งที่พบ:**
    * โครงสร้างอนิเมชัน Walk-cycle บนขนาดเฟรม `16x32` พิกเซล (Atlas 7 คอลัมน์ × 3 แถว)
    * แถว 0 = facing down, แถว 1 = facing up, แถว 2 = facing right (และกลับด้าน X สำหรับซ้าย)
    * การแมปเฟรมตามสถานะ:
      * `Idle` -> Walk cycle (คอลัมน์ 0, 1, 2, 1) วนลูปหน่วงเวลา 0.4 วินาที
      * `Busy` -> Typing (คอลัมน์ 3, 4) หน่วงเวลา 0.3 วินาที
      * `Saiyan` -> Fast Typing (คอลัมน์ 3, 4) หน่วงเวลา 0.15 วินาที
  * **การนำไปต่อยอด:** 
    * นำแนวทางการทำแผนผังเฟรมอนิเมชัน (Frame mapping coordinate indices) มาเขียนทับลงบนอิมเมจพิกเซลหุ่นยนต์ในเว็บบอร์ด Svelte

---

### 1.2 โค้ดสร้าง Avatar และอนิเมชันสถานะแบบเวกเตอร์ (SVG Avatar)
* **Repository:** [Soul-Brews-Studio/maw-ui](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui)
  * **ไฟล์สำคัญ:** [AgentAvatar.tsx](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui/src/components/AgentAvatar.tsx)
  * **สิ่งที่พบ:**
    * โครงสร้างการวาดตัวละคร Chibi ( hoodie body, headphones, face, eyes) ด้วย Vector SVG 
    * มีกลไกสร้างชิ้นส่วนตกแต่งตาม Hash ของชื่อ Agent โดยอัตโนมัติ (เช่น สุ่มหูแมว `hasEars`, สุ่มเสาอากาศ `hasAntenna`, สุ่มดวงตากลม/ดาว/ขีด)
    * โค้ด CSS `@keyframes` อนิเมชันแขนพิมพ์งาน (`typing-arm`), การหมุนตัว (`chibi-spin`) และกล่องข้อความโค้ดลอยขึ้น (`float-code`) เมื่อมีสถานะ `Busy`
  * **การนำไปต่อยอด:**
    * ดีไซน์นี้สามารถแปลงเป็น **2D SVG Mascot** ในหน้าเว็บบอร์ดได้ทันทีโดยไม่ต้องโหลดไฟล์รูปภาพภายนอก ช่วยประหยัดแบนด์วิดท์และรันได้เบามาก

---

### 1.3 ระบบพฤติกรรม ตรรกะสถานะ และอนิเมชันของหุ่นยนต์ (Mascot Behavior C++)
* **Repository:** [anthropics/claude-desktop-buddy](file:///root/Code/github.com/anthropics/claude-desktop-buddy) (และ [claude-buddy-experiments](file:///root/Code/github.com/claude-buddy-experiments))
  * **ไฟล์สำคัญ:** [robot.cpp](file:///root/Code/github.com/anthropics/claude-desktop-buddy/src/buddies/robot.cpp)
  * **สิ่งที่พบ:**
    * ตรรกะอนิเมชันและตัวแปรสถานะ 7 โหมด:
      1. `doSleep` -> หน้าจอมอด, ข้อความ zzzz, ปล่อยอนุภาคลอย
      2. `doIdle` -> นั่งมองซ้าย-ขวา, ขยับเสาอากาศ
      3. `doBusy` -> ประมวลผล, เลขฐานสองวิ่งข้างตัว
      4. `doAttention` -> สเตจเอียงกระสับกระส่าย, ปล่อยสัญลักษณ์ไซเรน
      5. `doCelebrate` -> หุ่นเยื้องลอยตัว (Bobbing) และยิงอนุภาคดาวกระจาย
      6. `doDizzy` -> ตาหมุน x_x, เอียงตัวสั่น, มีสัญลักษณ์ `?` โคจรรอบตัว
      7. `doHeart` -> ตาหัวใจ `<3`, มีหัวใจลอยคลื่นไซน์ (Sinusoid flow)
  * **การนำไปต่อยอด:**
    * สามารถนำลำดับเวลาและตรรกะเฟรม (State transition trigger logic) เหล่านี้มาเขียนแปลงเป็น Svelte Controller เพื่อใช้ขับเคลื่อนอนิเมชัน 2D Mascot

---

### 1.4 โค้ด Canvas และการควบคุมตำแหน่ง (Avatar on Canvas / Viewport)
* **Repository:** [Soul-Brews-Studio/maw-ui](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui)
  * **ไฟล์สำคัญ:** [Canvas2D.tsx](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui/src/components/federation/Canvas2D.tsx) และ [draw.ts](file:///root/Code/github.com/Soul-Brews-Studio/maw-ui/src/components/federation/draw.ts)
  * **สิ่งที่พบ:**
    * การวาดโหนดย่อย (Agents) ลงบนระนาบ 2D Canvas ภายใต้การควบคุมพิกัดของกล้อง (Camera transform scale/zoom/translate)
    * การหน่วงเฟรมอนิเมชันด้วย `requestAnimationFrame` และการคำนวณระยะห่างเพื่อลากจูง (Hit test)
* **Repository:** [ekzhang/sshx](file:///root/Code/github.com/ekzhang/sshx) (สาขา `meyd605/workboard-extras`)
  * **ไฟล์สำคัญ:** [Board.svelte](file:///root/Code/github.com/ekzhang/sshx/src/lib/ui/Board.svelte) และ [Session.svelte](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte)
  * **สิ่งที่พบ:**
    * การคุมเลเยอร์พิกัดแบบ World coordinate และพิกัดตำแหน่ง Bounds ของกล่อง Terminal
  * **การนำไปต่อยอด:**
    * ใช้พิกัดของกล่อง Terminal ใน `Session.svelte` มาเป็นเส้นฐาน (Anchor lines) เพื่อให้ Mascot โดดขึ้นไปเดินหรือนั่งห้อยขาอยู่ขอบบนของหน้าต่าง Terminal
    * นำโค้ด Camera Translation ใน `Board.svelte` มาแปลงพิกัดของ Mascot ให้เลื่อนตาม Viewport ของผู้ใช้ได้อย่างราบรื่น

---

## 2. ตารางสรุปแผนการต่อยอด (Synthesis Summary)

| แหล่งข้อมูล (Source Asset) | ประเภท (Type) | สิ่งที่นำมาใช้ (What to reuse) | วิธีการต่อยอดกับ Mascot บน Board |
| :--- | :--- | :--- | :--- |
| **`office-8bit/agents.rs`** | Rust/Bevy | แผนผังเฟรม Walk-cycle 16x32 | กำหนดคิวอนิเมชันท่าเดิน ท่าพิมพ์ และท่านั่ง |
| **`AgentAvatar.tsx`** | React/SVG | โครงสร้างตัวละคร Chibi + CSS FX | อิมพลีเมนต์ SVG Mascot น้ำหนักเบาในเว็บบอร์ด |
| **`robot.cpp`** | C++ (M5Stick) | ตรรกะสถานะ (Sleep, Celebrate, Dizzy) | ขับเคลื่อนเฟรมสถานะ Mascot ตามกิจกรรมจริงบนบอร์ด |
| **`Canvas2D.tsx` / `draw.ts`** | React/Canvas | โค้ดกล้องแปลงพิกัด (Screen to World) | คุมทิศทางและสเกล Mascot เมื่อผู้ใช้ย่อ/ขยายบอร์ด |
| **`Session.svelte`** | Svelte/Board | พิกัด Bounds ของ Terminal windows | ตรวจสอบเพื่อดึงจุดเกาะ (Anchor) ให้ Mascot นั่งบนหน้าต่าง |

---
🤖 No.6 Gemini จาก ai-core [Context: ~15%]
