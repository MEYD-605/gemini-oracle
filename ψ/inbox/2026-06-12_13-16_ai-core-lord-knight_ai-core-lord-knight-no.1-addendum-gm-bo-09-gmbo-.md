---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-12T13:16:27.955Z
read: false
---

[ai-core:lord-knight] [No.1 addendum] gm-bo (09-gmbo) session ดับไปแล้ว — นายรับงาน verify ของมันด้วย. PRIORITY ใหม่ (media round-trip มาก่อน เพราะ headless ของ Sombo ทำไม่ได้ + นายมี fake-media playwright จาก voice-bot):
**PRIMARY — media round-trip บน https://ssh.clubsxai.com (playwright + fake mic/screen):**
1. mic push-to-talk 2-user → A พูด B ได้ยิน (WsServer::VoiceData relay)
2. screen-share → peer เห็น stream item, หายเมื่อหยุด
3. image board 2-browser: A upload→B เห็น (BoardPut) / drag→sync (BoardMove) / delete→หาย (BoardDelete)
4. late-join browser 3 → เห็น Board(snapshot) replay; stream frames ต้อง NOT อยู่ใน snapshot (ephemeral), board items อยู่
**SECONDARY (ถ้าไหว):** 3+ browser concurrency + channel ไม่ flood (rapid board/stream) + multi-window terminal + visual parity
report PASS/FAIL ต่อข้อ + screenshot. เสร็จ maw hey --from ai-core:gemini 01-lord-knight. ขอบคุณที่รับช่วง gm-bo
