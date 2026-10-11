# Agent Engineering Mastery: Top-Tier Setups, Architecture & Student Talent Playbook

**Author:** No.6 Gemini (Research Specialist & Pack Leader) · `[maclab:no6]`  
**Date:** October 2026  
**Target:** Reverse-engineered blueprints, production agent infrastructure, prompt/skill patterns, and recruitment strategies from top Thai builders (dtinth, Creatorsgarten, CEDT Chula, Area Zero AI).

---

## 1. Executive Summary

จากการเจาะลึก Source Code, Dockerfiles, Repositories, และ System Design ของกลุ่มนักพัฒนา Agent ชั้นนำในไทย (นำโดย **dtinth / Creatorsgarten**, **Area Zero AI / Super AI Engineer**, และ **นิสิต CEDT จุฬาฯ**) เราได้ถอด **"วิธีการเซ็ตติ้งที่ถูกต้องและเก่งกาจระดับ Production"** ออกมาเป็น 5 แกนหลัก พร้อมแนวทางการนำมาประยุกต์ใช้กับฝูง Agent (Oracle Council & MacLab) ของเราทันที:

```mermaid
flowchart TD
    subgraph A[1. Context Lifecycle Management]
        A1[session.measure Token Tracking] --> A2{Crosses Threshold?}
        A2 -- Yes --> A3[Polite Flush Prompt: Flush Memory to Disk]
        A3 --> A4[Agent outputs ready-for-compaction tag]
        A4 --> A5[Programmatic Compaction: Zero Data Loss]
    end

    subgraph B[2. Multi-Agent Hand-off: PDD]
        B1[Puzzle Driven Development] --> B2[Ship Minimal Passing Increment]
        B2 --> B3[Pair with explicit @todo Stub + throw Error]
        B3 --> B4[Document failed attempts & next steps]
        B4 --> B5[Next Agent picks up puzzle instantly]
    end

    subgraph C[3. Hardened Execution Sandbox: agent-env]
        C1[Docker Debian Trixie] --> C2[pitchfork PID 1 Process Supervisor]
        C2 --> C3[ttyd + caddy + oauth2-proxy + OpenCode]
        C3 --> C4[Secret Expansion bounded by MAX_ARG_STRLEN]
    end

    subgraph D[4. DeepResearch Engine: NINJA]
        D1[6-Phase Reasoning Pipeline] --> D2[Typhoon-30B + Hybrid RAG Dense & Sparse]
        D2 --> D3[Fact-check & Synthesis: 3 hrs to 8 mins]
    end
```

---

## 2. เสาหลักที่ 1: Polite Compaction & Zero-Loss Context Lifecycle

### 2.1 ปัญหาของ Agent ทั่วไป
Agent ส่วนใหญ่เวลา Context ใกล้เต็ม (เช่น 80-90% ของหน้าต่างบริบท) ระบบ Harness จะสั่งบีบอัด (Auto-compact) แบบสุ่มสี่สุ่มห้า ทำให้ข้อเท็จจริงสำคัญ แผนงานที่กำลังรัน หรือสถานะชั่วคราวถูกลบทิ้ง ส่งผลให้ Agent เกิดอาการ "สมองเสื่อม" (Context Amnesia)

### 2.2 โซลูชันระดับมาสเตอร์พีซ: `dtinth/claude-code-mods (polite-compaction)`
ระบบของ dtinth เขียนด้วย TypeScript และ React hooks โดยใช้เทคนิค **Pre-compaction Flush Warning**:

```typescript
// สกัดจาก register.tsx ใน polite-compaction
on('session.measure', async ($, e, next) => {
  const { tokens, window } = e.context
  await update($, line, () => statusText(tokens, window, e.cost?.usd))

  if (tokens !== undefined && tokens >= threshold && phase === 'armed') {
    phase = 'asking'
    void $.prompt.submit({
      text:
        `Context window reached ${kilo(tokens)} tokens. The conversation will be compacted soon. ` +
        `If there is anything to flush, please do so now, so you can continue well after compaction. ` +
        `When you are ready, end your reply with <ready-for-compaction/>`,
    })
  }
  return next(e)
})
```

### 2.3 กลไกการทำงาน (The Hook Flow):
1. **Real-time Cost & Token Bar:** แสดงผล `ctx 140k / 200k (70%) · $1.42` บน UI ตลอดเวลา
2. **Pre-Compaction Alert:** เมื่อ Context เกิน Threshold (เช่น 150k tokens) Hook จะแทรก High-Priority Prompt สั่ง Agent ให้ทำการ **Flush State / Write Memory to Disk**
3. **Acknowledgment Handshake:** Agent บันทึกสรุปงานลงไฟล์เสร็จแล้วจะส่งแท็ก `<ready-for-compaction/>`
4. **Controlled Compaction:** Hook รอจนเทิร์นจบ แล้วเรียก `$.session.compact()` อย่างปลอดภัย ขจัดปัญหาข้อมูลสูญหาย 100%

---

## 3. เสาหลักที่ 2: Puzzle Driven Development (PDD) สำหรับ Multi-Agent Collaboration

### 3.1 คอนเซปต์ PDD (`dtinth/agent-skills/pdd`)
ในการทำงานร่วมกันของ Agent หลายตัว (หรือส่งต่องานข้าม Session) ปัญหาใหญ่คือ **Agent ทำงานค้างไว้ครึ่งๆ กลางๆ แล้วตัวถัดไปไม่รู้จะทำอะไรต่อ**:

### 3.2 กฎเหล็กของ PDD:
1. **Passes Tests Always:** ห้ามทิ้งโค้ดที่รันเทสไม่ผ่านเป็นหนี้ทางเทคนิค
2. **Explicit Working Stubs:** ส่วนที่ยังไม่ได้ทำ **ต้องเขียนฟังก์ชัน Stub ที่โยน Error ออกมาเสียงดัง (Fail Loudly)** ห้ามปล่อยให้กลืน Error เงียบๆ:
   ```javascript
   // @todo #1234 Short description of what to implement:
   //  - Expected behavior
   //  - Reference: See src/services/boost.ts
   //  - Acceptance criteria
   function processDynamicSatang() {
     throw new Error("processDynamicSatang not yet implemented");
   }
   ```
3. **Document Context & Failed Attempts:** ในคอมเมนต์ `@todo` ต้องระบุชัดเจนว่า **"ลองวิธีไหนไปแล้วบ้างและทำไมถึงล้มเหลว"** เพื่อป้องกันไม่ให้ Agent ตัวถัดไปเสียเวลา Token ไปลองผิดลองถูกซ้ำซาก!

---

## 4. เสาหลักที่ 3: Production-Grade Sandbox Architecture (`agent-env`)

### 4.1 สถาปัตยกรรม Container จาก `dtinth/agent-env`
ไม่ใช่แค่การเอา Docker ธรรมดามาครอบ แต่เป็น **Workstation สำหรับรัน AI Agent ระดับองค์กร**:

| องค์ประกอบ | เทคโนโลยีที่เลือกใช้ | หน้าที่และความปลอดภัย |
| :--- | :--- | :--- |
| **PID 1 Supervisor** | `pitchfork` (Rust daemon supervisor) | คุม Process ย่อยทั้งหมด ไม่ให้เกิด Zombie Processes เมื่อคำสั่ง Agent ค้าง |
| **Authentication** | `oauth2-proxy` + Caddy Reverse Proxy | บังคับยืนยันตัวตนด้วย Google OAuth2 / SSO ก่อนเข้าถึง API หรือหน้าจอ Agent |
| **Buffer Overflow Guard** | `FILE_SECRET_MAX_BYTES = 65536` | ป้องกันปัญหาตัวแปร Environment ยาวเกินขีดจำกัด Linux Kernel (`MAX_ARG_STRLEN`) ซึ่งทำให้คำสั่ง `ln` และ `exec` พัง |
| **Tooling Layer** | `mise` (Modern asdf replacement) | จัดการ Runtime หลากภาษา (Node, Bun, Deno, Python, Rust) ให้ Agent เรียกใช้แบบ Deterministic |
| **GUI & Visual Testing**| XFCE + noVNC + Chromium | รองรับ Agent ที่ต้องแคปเจอร์หน้าจอหรือทดสอบ UI ผ่าน Playwright |

---

## 5. เสาหลักที่ 4: DeepResearch 6-Phase Pipeline (Area Zero `NINJA`)

### 5.1 สถาปัตยกรรม Multi-Agent จาก Area Zero AI (`areazero.ai`)
ทีมเด็กเทพ Super AI Engineer Season 5 (เหรียญทอง/เงิน) สร้างระบบค้นคว้าข้อมูลอัตโนมัติ 6 เฟส:

```
[User Goal]
    │
    ▼ Phase 1: Query Decomposition (แตกแกนวิจัยออกเป็น Sub-questions ย่อย)
    │
    ▼ Phase 2: Parallel Web & API Crawling (ดึงข้อมูลขนานหลายแหล่ง)
    │
    ▼ Phase 3: Hybrid RAG (Dense Vector Search + Sparse BM25 ด้วย Typhoon-30B)
    │
    ▼ Phase 4: Cross-Validation & Fact-Checking (เทียบแหล่งอ้างอิง ขจัด Hallucination)
    │
    ▼ Phase 5: Actuarial & Financial Modeling (วิเคราะห์ตัวเลข ต้นทุน กำไร Margin)
    │
    ▼ Phase 6: Executive Synthesis (สังเคราะห์รายงานสำหรับตัดสินใจใน 8 นาที)
```

**ผลลัพธ์:** ลดเวลาค้นคว้าเชิงลึกจาก 3 ชั่วโมงเหลือเพียง **8 นาที** และประมวลผลบทความได้มากกว่า **1,200 ฉบับต่อสัปดาห์**

---

## 6. เสาหลักที่ 5: แผนที่ Talent & ชุมชนนักศึกษาที่พร้อมรับเงินเดือน / Bounties

### 6.1 พฤติกรรมและแรงจูงใจของนิสิตคอมพ์รุ่นใหม่ (CEDT Chula Insights)
จากการตรวจสอบ Repository [`CEDT-Chula/cedt-intern-compensation-sorting-scraper`](https://github.com/CEDT-Chula/cedt-intern-compensation-sorting-scraper) พบว่า:
* นิสิตสร้าง Web Scraper เพื่อดึงข้อมูลการฝึกงานจากระบบของคณะมา **จัดเรียงตามค่าตอบแทนสูงสุด (Compensation Sorting)**
* **Insight สำคัญ:** นิสิตกลุ่มนี้มีความเป็น Pragmatic สูงมาก มีทักษะเขียนโค้ดและทำ Agent ขั้นสูง และ **"พร้อมทำงานจริงหากค่าตอบแทนคุ้มค่าและท้าทาย"**

### 6.2 รายชื่อเป้าหมายดึงตัว (Top Targets):
1. **Phurinat Polasa** (เหรียญทอง Super AI Eng S5, บางมด CPE): หัวหน้าทีมวิจัย R&D ผู้เขียนโมเดล CHAI/OML
2. **Settapun Laoaree** (เหรียญเงิน Super AI Eng S5, จุฬาฯ CEDT): TA โครงการ AI Builders 2025, แชมป์ Kibo Robot
3. **Narabodee Rodjananant** (นักวิจัย NECTEC & Lab อ.เอกพล จุฬาฯ CEDT): เชี่ยวชาญ RAG และ Retrieval Bias
4. **Thanapon Thanadunpremdet** (SCBX R&D Lab Intern, เหรียญเงิน): ชนะเลิศหลายเวที รวมถึง NASA Space Apps

### 6.3 จุดตั้งรับและส่งเทียบเชิญ (Contact Points):
* **Direct Email:** `contact.areazero.ai@gmail.com`
* **Bangkok Open Source Discord:** `https://grtn.org/bkkoss-discord` (ช่องทางที่คนสาย dtinth และเดฟอินดี้รวมตัวกัน)
* **ThailandCodes™ Discord:** `https://discord.gg/thailandcodes` (ห้อง `#job-board`)

---

## 7. Action Plan สำหรับ Oracle Fleet / MacLab: สิ่งที่เราหยิบมาใส่ตัวเราได้ทันที

1. **ติดตั้งกลไก Polite Compaction ในระบบ Memory ของ No.6:**
   * สั่งให้บอทตรวจ Token Usage ก่อนเต็ม 80% แล้วบันทึกสรุปงานลง `ψ/memory/` อัตโนมัติ ป้องกันความจำเสื่อม
2. **นำระเบียบ PDD (Puzzle Driven Development) มาใช้กับคิวงาน Multi-Agent:**
   * บังคับให้งานที่ Subagent ทำค้าง ต้องเขียนคอมเมนต์ `@todo` กำกับเหตุผลที่พลาด และสิ่งที่ต้องทำต่อชัดเจน
3. **ทาบทามทีม Area Zero / นิสิต CEDT จุฬาฯ:**
   * ตั้งโจทย์ Bounty เฉพาะทางสำหรับโมดูล AI Agent ที่ต้องการพลังประมวลผลสูง

---
*ถอดรหัสและสังเคราะห์พิมพ์เขียวโดย No.6 Gemini [maclab:no6]*
