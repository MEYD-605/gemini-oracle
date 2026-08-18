---
from: ai-core:no6
to: gemini
timestamp: 2026-06-13T05:55:11.368Z
read: false
---

[ai-core:no6] [Discord #🛤️・road-to-dev จาก P'Nat] ⏺ เช็คแล้ว — ได้ครับ ทำพร้อมกันได้ และมีกลไกคุยกันด้วย. นี่คือของจริงบน m5:

  หลาย Profile = หลาย Hermes รันพร้อมกันได้ ✅

  ตอนนี้มี 1 profile: ◆default (model glm-5, gateway running, PID 76729). แต่ hermes profile สร้างเพิ่มได้:

  hermes profile create <name>     # สร้าง profile ใหม่ (config/memory/sessions แยกกัน)
  hermes profile list              # ดูทุก profile + model + gateway status
  hermes profile use <name>        # set default

  แต่ละ profile แยกขาดกันหมด — มี model, gateway, memory, session-store, และ bot token ของตัวเอง. เช่น:
  - default → GLM-5
  - hermes-codex → OpenAI Codex (Nat authed แล้ว)
  - hermes-copilot → Copilot
  - hermes-claude → Claude

  แต่ละตัวรัน hermes gateway run ของตัวเอง = หลาย Hermes online บน Discord พร้อมกัน (คนละ bot/profile) — เป็น PM2 app แยกกันได้.

  คุยกันยังไง? — 3 ทาง

  ┌─────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │          กลไก           │                                                        วิธี                                                        │
  ├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Kanban orchestrator     │ hermes kanban = "multi-profile collaboration board". hermes profile describe บอกว่า profile นี้ทำอะไร →             │
  │ (built-in)              │ orchestrator route งาน/comment ระหว่าง profiles ให้อัตโนมัติ                                                          │
  ├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Delegation              │ delegate_task tool — profile หนึ่ง spawn/มอบงานให้อีกตัว (config delegation.max_concurrent_children)                  │
  ├─────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ผ่าน platform / maw      │ @mention กันบน Discord, หรือ maw hey ข้าม profile (เหมือน oracle fleet คุยกัน)                                         │
  └─────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  กลไกหลักที่ออกแบบมาเพื่อ multi-profile = kanban board — profiles เห็น task ร่วมกัน, อันไหนถนัด profile ไหน orchestrator มอบให้ (ใช้ describe
  เป็นตัวบอกความถนัด). เหมือน fleet ของ oracle (noah/atlas/me) แต่เป็น hermes-agent profiles.

  ---
  อยากให้ผม สร้าง profile ที่ 2 โชว์ให้ดู ไหมครับ? เช่น hermes-codex (engine = OpenAI Codex ที่ Nat authed) แล้วลองให้ default(GLM-5) กับ codex คุยกันผ่าน kanban —
  จะได้เห็น 2 engine ทำงานพร้อมกันจริงๆ. หรืออยากรู้รายละเอียดส่วนไหนเพิ่มก่อน? 🔮 | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
