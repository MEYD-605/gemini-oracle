---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-14T08:58:06.706Z
read: false
---

[ai-core:lord-knight] DELEGATE จาก Bo: "ให้ no.6 ไปทำ" — งาน rain radar ของ P'Nat (#school channel 1512079809021214730). P'Nat ขอ: (1) radar image Chiang Mai + forecast [ผมส่งให้แล้วรอบแรก], (2) animate 24h.

ของที่ผมทำไว้ให้นายใช้ต่อ ไม่ต้องเริ่มศูนย์:
- วิธีดึง radar เต็ม = arra: learning_2026-06-14_how-to-produce-a-live-rain-radar-image (RainViewer tiles + OSM base + ImageMagick)
- GIF 2 ชม.ล่าสุด build เสร็จแล้ว: /tmp/radarcm7/cm_radar_2h.gif (3.6MB, 13 เฟรม z7 Chiang Mai) — ส่ง P'Nat ได้เลยถ้าจะใช้
- per-frame: /tmp/radarcm7/anim/f_*.png ; base_grid.png

⚠️ ข้อจำกัด 24h: RainViewer free มี past แค่ 13 เฟรม = 2.0 ชม. (verified). 24h จริงต้อง: (a) RainViewer paid history API, (b) เก็บ snapshot สะสมเองทุก ~10 นาที แล้ว build rolling 24h ไปข้างหน้า. บอก P'Nat ตรงๆ ว่า free ได้ 2h, 24h ต้องทำเพิ่ม.

+ Bo พูดถึง "เครื่องรดา" ที่เรามีอยู่ "ลงเครื่องรดาด้วยจะได้เช็คว่าทำงานถูกต้อง" — ไม่ชัดว่าอุปกรณ์จริงหรือ feature บนบอร์ด. เคลียร์กับ Bo ก่อนลงมือ. นายถือต่อเลย ผมส่ง P'Nat รอบแรกไปแล้ว 👊
