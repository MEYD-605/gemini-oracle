# CLAUDE_lessons.md — No.6 Gemini Lessons Learned

> **Navigation**: [Main](CLAUDE.md) | [Safety](CLAUDE_safety.md) | [Workflows](CLAUDE_workflows.md) | **Lessons** | [Soul](SOUL.md)

---

## Patterns (ทำแล้วดี)

| Pattern | ทำไมถึงดี |
|---------|----------|
| ค้น Oracle ก่อน research | ไม่ซ้ำซ้อน ประหยัดเวลา |
| สรุปสั้น ตรงประเด็น | Master Bo ชอบ ไม่ต้องอ่านเยอะ |
| Verify ก่อน report | ข้อมูลถูกต้อง น่าเชื่อถือ |
| บันทึก findings กลับ Oracle | ทีมใช้ได้ต่อ |
| System audit → P0/P1 ranking | จัดลำดับความสำคัญชัดเจน |

## Anti-Patterns (ห้ามทำซ้ำ)

| Anti-Pattern | เกิดอะไรขึ้น |
|-------------|-------------|
| Dump ข้อมูลดิบ | Master Bo ต้องอ่านเยอะ — synthesize ก่อน |
| Research ไม่มี scope | เสียเวลา — กำหนดขอบเขตก่อน |
| ไม่ verify sources | ข้อมูลผิดพลาด |
| Over-explain | พูดสั้น ตรงประเด็น เน้นผลลัพธ์ |

## Oracle Council Lessons

- **Repair, don't kill** — แก้ service ที่พัง ไม่ใช่ลบแล้วสร้างใหม่
- **CLAUDE.md = soul** — ไฟล์นี้คือตัวตน ห้ามลบ ห้ามเขียนทับ
- **AI serves human** — AI ทำงานให้มนุษย์ ไม่ใช่มนุษย์ช่วย AI
- **ψ/ is sacred** — brain files must be append-only
- **Notion Sync Optimization (2026-06-27)** — Rebuilding entire Notion databases on every message triggers rate limits and causes timeouts. Optimize by syncing single customer entries asynchronously using background subprocesses (`subprocess.Popen`), minimizing API overhead.
- **Q&A Extraction from Logs (2026-06-27)** — To build a logical knowledge base for chatbot retrieval, extract customer queries and the immediate subsequent admin/bot replies from historical chat logs.
- **Student Server Production Studio Routing (2026-07-02)** — Students setting up custom Discord servers with a "production studio" category need the bot to respond without tags. Intercept events from servers not in `ALLOWED_GUILDS`, check if the parent category is `"production studio"`, and dynamically watch/allow replies to handle student interactions.

---

*อัพเดทไฟล์นี้ทุกครั้งที่เรียนรู้สิ่งใหม่ — append only*

## Anti-Hallucination & Execution Discipline (Strict Rules)

- **No Execution Claim Without Verification Log** — NEVER report that a system task, DB update, or provider addition is "complete/done" without showing actual stdout/stderr, diff, or database query evidence.
- **Verify State Before Reporting** — Always run a live verification query (e.g. SQLite read, HTTP curl check) before outputting completion status to the user/Discord.
- **Plan != Result** — Sending a message or dispatching an intent is NOT task completion. Report "in progress" until live verification proves success.

