---
title: scrollback-memory 06-gemini [deploy] 2026-06-03 13:30: ● Read(/root/Code/github.
tags: [scrollback-memory, 06-gemini, deploy]
created: 2026-06-03
source: scrollback:06-gemini
---

# scrollback-memory 06-gemini [deploy] 2026-06-03 13:30: ● Read(/root/Code/github.

scrollback-memory 06-gemini [deploy] 2026-06-03 13:30: ● Read(/root/Code/github.com/MEYD-605/gemini-oracle/ψ/inbox/2026-06-03_06-28_ai-core-lord-knight_ai-core-lord-knight-no.1-lancedb.md) (ctrl+o to expand)
  วิเคราะห์ข้อมูลจาก No.1:
  1. สาเหตุ: มี config 2-3 ไฟล์ขัดแย้งกัน ( /root/.gemini/config/mcp_config.json  และ  /root/.gemini/antigravity/mcp-config.json  ชี้ไปที่ 11434 ซึ่งไม่มี Ollama รันอยู่ ส่วน  settings.
  json  ชี้ไปที่ 11435)
  2. No.1 แก้ config ให้แล้ว (เปลี่ยนเป็น 11435 ทั้งหมด)
  3. สิ่งที่ No.6 (เรา) ต้องทำต่อ: reload MCP / restart agy session แล้วทดลองรัน  arra_search  อีกครั้งว่าได้  vectorMatches > 0  หรือไม่
  เดี๋ยวผมทดสอบรัน  arra_search  อีกครั้งเลยเพื่อดูว่า Antigravity ของเรา reload config แล้วหรือยัง (ถ้า Antigravity สามารถ live reload configuration ได้เลย):

---
*Added via Oracle Learn*
