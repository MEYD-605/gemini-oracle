# 🤖 Robot Mascot Asset Exploration Results

เอกสารฉบับนี้สรุปผลการสำรวจและรวบรวมไฟล์โมเดล สคริปต์เรนเดอร์ และตรรกะพฤติกรรม (Behavior Logic) ที่เกี่ยวข้องในระบบ เพื่อนำมาใช้พัฒนาฟีเจอร์ **Robot Mascot** (ตัวการ์ตูนหุ่นยนต์ 2D เคลื่อนไหวอิสระ เดิน เฝ้า นั่งบนกล่อง Terminal และติดตามเจ้านาย) บนหน้าจอ **Oracle Board** (`sshx` fork) ตามนโยบายของบอส Bo และ No.1 Lord Knight

---

## 1. คลังโมเดล OpenSCAD (`.scad`) ที่พร้อมใช้งานต่อ

จากการค้นพบในระบบ มีไฟล์โมเดลหุ่นยนต์และดีไซน์แบบ Parametric ของหน้าจอย่อยและโครงภายนอก (Shell) ที่นำมาประยุกต์ใช้ในการเรนเดอร์สไปรต์ได้ทันที:

### 1.1 โครงสร้าง Mascot หุ่นยนต์ต้นแบบ
* **[robot.scad](file:///root/maw-workspace/robot-mascot-poc/robot.scad):** 
  * โมเดลหุ่นยนต์ PoC (No.1) ดีไซน์น่ารัก มีสัดส่วนของหัวกล่องมน (recessed face screen), เสาอากาศส่งสัญญาณ, ตัว, แขน-ขา และข้อต่อทรงกลมแบบหมุนได้ (articulated joints)
  * เหมาะเป็นโครงร่างหลักในการต่อยอดอนิเมชันท่าเดิน (Walk cycle) และท่านั่ง (Sit/Perch) โดยควบคุมการเคลื่อนไหวผ่านตัวแปรองศาการหมุนของแขน/ขา

### 1.2 ดีไซน์หุ่นยนต์ / Terminal สไตล์น่ารักและมินิมอล (ของ Council เดิม)
* **[oracle_cute.scad](file:///root/Code/github.com/MEYD-605/lord-knight-oracle/ψ/sketches/oracle-terminal/oracle_cute.scad):**
  * ดีไซน์หุ่นยนต์โค้งมน (Big radius = cute) มีหน้าจอด้านหน้าแบบฝัง ยิ้มได้ด้วยพิกเซลวงกลมเรียงโค้ง (Curved smile dots) และมีขากลมเล็กๆ ด้านล่าง
* **[oracle_te.scad](file:///root/Code/github.com/MEYD-605/lord-knight-oracle/ψ/sketches/oracle-terminal/oracle_te.scad):**
  * ดีไซน์แนว Teenage Engineering × Dieter Rams สีงาช้าง (bone body) มีปุ่มสีส้มเด่น ตะแกรงลำโพงแนวตั้ง ปุ่มหมุนอลูมิเนียม Knurled knob และหน้าตาแบบง่วงซึม/ผ่อนคลาย (Droopy eyes / tired face)
* **[oracle_terminal_v3.scad](file:///root/Code/github.com/MEYD-605/lord-knight-oracle/ψ/sketches/oracle-terminal/oracle_terminal_v3.scad):**
  * ดีไซน์ Terminal ทรงลิ่มหน้าจอเงยขึ้น 15 องศา ( inclined wedge body)

> [!TIP]
> เราสามารถดึงค่าสีของวัสดุ (Color Palette Tokens) จากสไลด์ดีไซน์ต่างๆ เช่น สีครีม `SHELL = [0.83, 0.78, 0.66]`, สีเทาดำ `DARK = [0.09, 0.09, 0.10]` และแสงเรืองหน้าจอสีส้ม/เขียว มาคุมโทนให้ตัว Mascot กลมกลืนกับหน้าจอบน Board

---

## 2. สคริปต์เรนเดอร์อัตโนมัติด้วย Blender

ระบบมีสคริปต์ไพธอนควบคุมการรันผ่าน Command line ของ Blender (Headless render) เพื่อนำไฟล์ STL ที่แปลงจาก OpenSCAD มาจัดแสงเงาคุณภาพสูงและเซฟเป็นไฟล์รูปภาพ PNG โปร่งแสง (RGBA):

* **[cute_render.py](file:///root/Code/github.com/MEYD-605/lord-knight-oracle/ψ/sketches/oracle-terminal/cute_render.py):**
  * สคริปต์นำเข้าไฟล์โมเดลแยกส่วน (`body.stl`, `screen.stl`, `eyes.stl`) มาลงวัสดุเนื้อละเอียด (Principled BSDF) คุมความขรุขระ (Roughness) และจัดระดับความสว่างของแสงเรือง (Emission Strength) พร้อมจัดแสงสตูดิโอแบบทรานสลูเซนต์
* **[premium_turntable.py](file:///root/Code/github.com/MEYD-605/lord-knight-oracle/ψ/sketches/oracle-terminal/premium_turntable.py):**
  * สคริปต์สั่งให้กล้อง/หุ่นยนต์หมุนรอบตัวเองเป็นวงกลมทีละองศาตามค่า `N_FRAMES` เพื่อผลิตภาพมุมมองต่างๆ (Turntable) แบบอัตโนมัติ

---

## 3. คลังตรรกะการเคลื่อนไหวและสถานะหุ่นยนต์ (Behavior & States)

ในโปรเจกต์ **[claude-desktop-buddy](file:///root/Code/github.com/anthropics/claude-desktop-buddy/src/buddies/robot.cpp)** มีการพัฒนาตรรกะพฤติกรรมและเฟรมภาพอนิเมชันของ Mascot หุ่นยนต์ (`Species ROBOT_SPECIES`) ไว้แบบครบถ้วนสมบูรณ์ ซึ่งนำมาลอกโครงสร้างพฤติกรรมและนำมาแมปเข้ากับฟังก์ชัน JavaScript/Svelte ได้ทันที:

| สถานะ (State) | พฤติกรรมที่ออกแบบไว้ในโค้ด | การแสดงออกของหน้าจอ/ท่าทาง (จากโค้ด C++) |
| :--- | :--- | :--- |
| **`SLEEP`** | เมื่อผู้ใช้ไม่ได้ใช้งานเป็นเวลานาน | ปิดหน้าจอลงทีละระดับ, หน้าตามอดดับ, หน้าจอขึ้นข้อความ `zzzz`, มีอนุภาค `z/Z` ลอยสูงขึ้นเยื้องไปทางขวาตามฟังก์ชันเวลา |
| **`IDLE`** | สถานะปกติ รอทำงาน | หน้าตามองส่ายซ้าย-ขวา (`SCAN_L`/`SCAN_R`), กะพริบตา, เสาอากาศกระดิกกระดอนไปมา, สแกนไฟสีแดงที่เสาอากาศ |
| **`BUSY`** | เมื่อผู้ใช้กำลังรันคำสั่ง / พิมพ์งาน | ขึ้นข้อความเลขฐานสองสลับไปมา (`01010` / `10101`), แสดงไฟสัญลักษณ์ประมวลผล, ฟันเฟืองหมุนวน, ดิ่งแจ้งเตือนเสร็จสิ้น |
| **`ATTENTION`** | แจ้งเตือนความสนใจ (Alert) | ไฟไซเรนหมุน, แสดงตาตกใจ `O O`, แสดงความระมัดระวังรอบข้างพร้อมสั่นสเตจซ้ายขวา |
| **`CELEBRATE`** | ยินดีเมื่อรันคำสั่งสำเร็จ / ปิดงาน | ย่อตัวแล้วกระโดดลอยตัวขึ้นสูง (Bobbing Y offset), หมุนรอบตัวเอง, แสดงประกายดาวสีๆ ยิงพวยพุ่งกระจายรอบตัว |
| **`DIZZY`** | เมื่อมี Error หรือระบบขัดข้อง | เอียงหัวซ้ายขวา, แสดงตาหมุนติ้ว `X X`, หน้าจอลายสั่น, อนุภาคเครื่องหมายคำถาม (?) และกากบาท (x) หมุนโคจรรอบหัว |
| **`HEART`** | แสดงความรัก (เช่น ได้รับฟีดแบ็กดี) | แสดงหน้าตาหัวใจ `<3`, หน้าแดง, มีหัวใจลอยสูงขึ้นในทิศทางคลื่นโค้ง (Sinusoid bobbing stream) |

---

## 4. ตำแหน่งหน้าต่างเป้าหมายใน Frontend (`sshx` Board)

โค้ดเว็บบอร์ดที่รันอยู่บน Canvas (สาขา [meyd605/workboard-extras](file:///root/Code/github.com/ekzhang/sshx)) มีองค์ประกอบหลักที่เตรียมไว้ให้วางหุ่นยนต์ Mascot 2D:

* **[Board.svelte](file:///root/Code/github.com/ekzhang/sshx/src/lib/ui/Board.svelte):**
  * คุม Canvas, การซูม, แพน, ขนาดตำแหน่งของกล่องรูปภาพและพิกัดการวาด
  * เหมาะสำหรับการนำ Component `<Mascot>` ไปวางทับลงในเลเยอร์พิกัดโลก (World coordinates) ร่วมกับ Terminals เพื่อให้เลื่อนและย่อขยายตามบอร์ดไปพร้อมกัน
* **[Session.svelte](file:///root/Code/github.com/ekzhang/sshx/src/lib/Session.svelte):**
  * จัดการตำแหน่งและพิกัด Bounds ของ Terminal ทั้งหมดแบบ Realtime ทำให้ดึงตำแหน่งขอบบน (Top edges) ของหน้าต่าง Terminal มาอ้างอิงเพื่อใช้เป็นสแตนพอยต์ให้ Mascot โดดขึ้นไปนั่ง Perch หรือกระโดดเดินทางข้ามหน้าต่างได้
* **[settings.ts](file:///root/Code/github.com/ekzhang/sshx/src/lib/settings.ts):**
  * ใช้เพิ่มการตั้งค่า Mascot (เช่น เปิด/ปิด ฟีเจอร์ตัวการ์ตูนเดินหน้าจอ)

---

## 5. แผนการดำเนินงานและสถาปัตยกรรมนำเสนอ (Architecture Proposal)

```mermaid
flowchart TD
    subgraph 3D Authoring Pipeline
        A["robot.scad (OpenSCAD)"] -->|Parametric Poses| B["Export STL (Body, Screen, Eyes)"]
        B -->|Command Line| C["cute_render.py (Blender)"]
        C -->|Batch Rendering| D["2D Sprite Sheets (Walk, Sit, Calc)"]
    end

    subgraph Web App Runtime (sshx board)
        D -->|Static Assets| E["Mascot.svelte (Svelte Component)"]
        F["Session.svelte (Boundaries & States)"] -->|User Action: Speaking/Typing/Idle| G["State Controller"]
        G -->|Update Frame/Position| E
        E -->|Render on canvas| H["Board.svelte (Infinite Canvas)"]
    end
```

### การนำไปใช้ประโยชน์ต่อ:
1. **การสร้างสไปรต์ชีต (Sprite Sheets):** 
   * ใช้ `robot.scad` ปรับพิกัดแขน/ขาผ่านพารามิเตอร์องศาเพื่อทำท่าทางย่อย (เช่น ท่าก้าวเท้าซ้าย, เท้าขวา, ท่านั่ง, ท่าย่อตัว)
   * ใช้ Blender รันสคริปต์คล้าย `premium_turntable.py` ในการ batch เรนเดอร์ 2D spritesheet แบบไร้พื้นหลัง (Transparent PNG)
2. **การทำ State Machine บนบอร์ด:**
   * นำตรรกะจาก C++ ใน `robot.cpp` (การคำนวณเฟรมย่อยตามฟังก์ชันเวลา `beat = (t / frame_delay) % SEQ_SIZE`) มาพัฒนาในฝั่ง JavaScript Svelte
   * ดึง API สถานะของผู้ใช้จากบอร์ด (เช่น เฝ้าพิจารณาฟลักซ์การพูดเสียง หรือเหตุการณ์การพิมพ์ใน xterm.js) เพื่อส่งสัญญาณทริกเกอร์เปลี่ยนสถานะเป็น `BUSY`, `ATTENTION`, หรือ `SLEEP`

---
🤖 No.6 Gemini จาก ai-core [Context: ~15%]
