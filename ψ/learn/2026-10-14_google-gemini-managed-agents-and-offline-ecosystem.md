# Learning Synthesis: Google Managed Agents (Interactions API / Antigravity Cloud) & Offline Edge Agents

**Date**: 2026-10-14 13:29 +07  
**Author**: No.6 Gemini (Research Specialist & Pack Leader · Subagent `flash`)  
**Trigger**: Directive from Master Bo (`borde9902`) — *"มึงดูเรื่อง agent Gemini อีกรอบดิ เขาวางแผนว่ายังไงบ้างแล้วปกติต้องใช้ทำอะไรบ้างไปอ่าน/learn มา ส่งsub ตัวไม่แพงไปนะ"* + *"หมายถึงตัวใหม่ที่มันออฟไลน์มาให้เราคุยกันนะ"*

---

## 1. Executive Summary

Google กำลังเปลี่ยนผ่านจากยุค **Model API แบบไร้สถานะ (Stateless `generateContent`)** เข้าสู่ยุค **Agent-First Runtime** โดยวางยุทธศาสตร์ไว้ 2 แกนหลักที่ตอบโจทย์คำว่า "ออฟไลน์/ออนไลน์มาให้เราคุยกันได้":
1. **Cloud Managed Agents (`Interactions API` + `Agents API` + `Antigravity Cloud Sandbox`)**: ระบบ Serverless Agent บนคลาวด์ของ Google ที่ทำงานในตู้ Linux Sandbox แยกส่วน (gVisor) **แม้เครื่องคอมพิวเตอร์หลักของเราจะปิดหรือออฟไลน์อยู่** ก็ยังสามารถคุยและสั่งงานผ่าน Discord / HAOS Webhook / โทรศัพท์มือถือได้ตลอด 24 ชม.
2. **Offline / On-Device Agents (`Gemini Nano` + `LiteRT-LM` + `Chrome Built-in Prompt API`)**: โมเดลขนาดกะทัดรัดที่ฝังอยู่ในเบราว์เซอร์ Chrome และอุปกรณ์พกพา รันในเครื่องแบบ **Offline 100% (ไม่ต้องต่อเน็ต)** ความหน่วงศูนย์ และไม่เสียค่า Token

---

## 2. เขาวางแผนว่ายังไงบ้าง? (Google's Roadmap & Architecture)

### A. ฝั่ง Cloud Managed Agents (เมื่อเครื่องเราออฟไลน์ แต่ Agent ออนไลน์บนคลาวด์)
1. **แยก Control Plane (`Agents API`) ออกจาก Runtime Plane (`Interactions API`)**:
   - **Control Plane (`Agents API`)**: ใช้สร้างตัวตนถาวรให้ Agent (คล้ายการใส่ `AGENTS.md`, `SKILL.md`, กฎ และรายการ Tools) แล้วบันทึกเป็น Agent ID ถาวรบน Google Cloud
   - **Runtime Plane (`Interactions API`)**: ยุบรวมลูป `คิด ➔ วางแผน ➔ เรียก Tool ➔ รันคำสั่ง ➔ ตรวจผล ➔ ตอบกลับ` ไว้ในคำสั่งเดียว (`client.interactions.create`) รองรับทั้งโหมดรอผลทันทีและโหมดรันเบื้องหลัง (`background=True`)
2. **Ephemeral Linux Sandbox (ตู้คอนเทนเนอร์ใช้แล้วทิ้ง)**:
   - เมื่อมีคำสั่งเข้ามา Google จะเสกตู้ Linux Container (พร้อม Bash, Python, Node.js, Filesystem และ Headless Browser) ขึ้นมาทำงาน
   - รองรับการจำสถานะข้ามเทิร์น (`previous_interaction_id` / `environment_id`) และบีบอัดความจำอัตโนมัติ (Context Compaction ที่ 135k tokens)
   - เมื่อจบงานหรือหมดเวลา (TTL) ตู้จะยุบตัวคืนทรัพยากรทันที ไม่ต้องเปิด VM แช่ทิ้งไว้
3. **Managed Credentials Proxy (เกราะป้องกัน Token รั่ว 100%)**:
   - ไม่ต้องใส่ API Key หรือรหัสผ่านไว้ใน `.env` ในตู้ Sandbox
   - Google เก็บความลับไว้ที่ Proxy ส่วนกลาง และฉีด Authorization Header ให้ตอนที่ Agent ยิงคำขอออกนอกตู้ ทำให้โมเดลไม่มีทางเห็น Plaintext Token และกัน Prompt Injection ขโมยคีย์ได้เด็ดขาด
4. **Remote MCP & WebMCP Integration**:
   - เชื่อมต่อกับ MCP Server ภายนอกผ่าน HTTP/SSE ได้โดยตรง และใช้ **WebMCP** (`navigator.modelContext`) คุยกับหน้าเว็บยุคใหม่ได้โดยไม่ต้องใช้ Vision เดาปุ่มกด

### B. ฝั่ง Offline / On-Device Agent (เมื่อไม่มีอินเทอร์เน็ต)
1. **Gemini Nano + LiteRT-LM**: เอนจินรันโมเดลขนาดเล็กบน NPU/GPU ของเครื่องโดยตรง
2. **Chrome Built-in AI (`window.ai` / Prompt API)**: เปิดให้เว็บแอปเรียกใช้ Gemini ในเบราว์เซอร์ได้แบบ Offline 100% ฟรี ไม่เสียโควตา API
3. **Hybrid Edge-to-Cloud**: ใช้ตัวเล็กในเครื่องทำหน้าที่กรองงานเบื้องต้น (Triage) และส่งงานหนักขึ้นไปให้ Cloud Managed Agent

### C. แผนเชื่อมต่อกับบ้านเรา: HAOS 24/7 Master Daemon + Cloud Brain
- ให้ **HAOS (Hyper-V `192.168.1.161`)** ที่เปิดกินไฟต่ำตลอด 24 ชม. ทำหน้าที่เป็น **"หู-ตา-เส้นประสาท"** คอยดักฟัง Discord / MQTT / เซ็นเซอร์
- เวลาเครื่อง MacLab ปิดหรือบอสอยู่นอกบ้าน แล้วมีงานซับซ้อนเข้ามา ➔ HAOS ยิง Webhook / `rest_command` ไปปลุก **Google Managed Agent (เช่น No.7 Professor / Stratos)** บนคลาวด์ให้เปิดตู้ Linux คิดและรันโค้ด แล้วส่งคำตอบกลับเข้า Discord ทันที

---

## 3. ปกติต้องใช้ทำอะไรบ้าง? (Standard Use Cases)

1. **Autonomous Coding & Bug Fixing บนคลาวด์ (สไตล์ Devin)**:
   - สั่งให้โคลน Repo จาก GitHub เข้าไปในตู้ Sandbox, รันเทสต์, แก้บั๊ก, รันเทสต์ซ้ำจนเขียว แล้วเปิด PR กลับมาโดยที่เราปิดคอมนอนได้เลย
2. **24/7 Background Webhook Worker & ยามเฝ้าระบบ**:
   - คอยรับ Alert จากระบบ (เช่น เซ็นเซอร์ HAOS ผิดปกติ, เซิร์ฟเวอร์แจ้งเตือน, หรือบอสทัก Discord ตอนดึก) ตื่นมาเช็ก Log วิเคราะห์สาเหตุ และส่งรายงานสรุปเข้าห้องแชท
3. **Data Analysis, ETL & สร้างรายงานอัตโนมัติ**:
   - โยนไฟล์ CSV/JSON หรือข้อมูลยอดขายเข้าไป ให้มันเขียน Python (`pandas`, `matplotlib`) พล็อตกราฟและสรุปเป็นไฟล์รายงาน PDF/HTML ส่งกลับมาให้ดาวน์โหลด
4. **Automated QA & Headless Web Testing**:
   - ให้มันเปิดเบราว์เซอร์ในตู้ Sandbox เข้าไปเทสต์หน้าเว็บ กดปุ่ม กรอกฟอร์ม และแคปหน้าจอมาตรวจความเรียบร้อยหลัง Deploy
5. **Cloud Subagent Swarm (แบ่งเบาภาระเครื่องหลัก)**:
   - เวลาต้องรันงานหลายมุมมองพร้อมกัน 5–10 ตัว แทนที่จะรันบน MacLab หรือ ClubSGame จนเครื่องร้อน ก็สั่งแตกหน่อให้ไปรันใน Cloud Sandbox ของ Google พร้อมกัน 10 ตู้แล้วส่งผลสรุปกลับมารวมกัน
6. **งานกรองข้อมูลหน้าด่านแบบ Offline (สำหรับ Gemini Nano)**:
   - สรุปข้อความแชท, กรองข้อมูลส่วนตัว (PII), หรือร่างข้อความตอบกลับเร็วๆ ในเครื่องโดยไม่ต้องต่อเน็ตและไม่เสียค่า Token
