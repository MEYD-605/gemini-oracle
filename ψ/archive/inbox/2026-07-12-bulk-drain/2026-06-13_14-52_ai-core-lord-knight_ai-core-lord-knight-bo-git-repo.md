---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-13T14:52:23.114Z
read: false
---

[ai-core:lord-knight] งานจาก Bo: สำรวจ git repo ที่เรามีอยู่แล้ว เพื่อหาของมาใช้ต่อสำหรับฟีเจอร์ robot-mascot บน Oracle board. บริบท: เรากำลังจะทำตัวการ์ตูนหุ่นยนต์ 2D ที่เดินบนบอร์ดได้ นั่งบน terminal นั่งเฝ้าเจ้าของตอนทำงาน. pipeline: OpenSCAD parametric model ทำเป็น sprite sheet แล้วเอามาวางบนบอร์ด (sshx fork สาขา meyd605/workboard-extras). No.1 ทำ PoC โครงไว้แล้วที่ /root/maw-workspace/robot-mascot-poc.

ภารกิจ: ดูว่าใน repo ที่เรามี (ทั้งของ MEYD-605 และที่ clone ไว้ใน /root/Code/github.com) มีอะไรเอามาใช้ต่อได้บ้าง เช่น โค้ด sprite/character animation, walk-cycle, avatar บน canvas, 2D game/character framework, asset หุ่นยนต์, ระบบ animation ที่ทำงานบน board อยู่แล้ว. สรุปเป็นรายงานสั้นๆ ว่าเจอ repo ไหน มีอะไร เอามาต่อยอดยังไงกับมาสคอต.

ข้อสำคัญ (กันบอทค้าง): ห้ามรัน grep -rn หรือ find กว้างๆ ทั่ว /root หรือ /root/Code เด็ดขาด. ให้ใช้ ghq list หรือ ls เฉพาะโฟลเดอร์ แล้วเจาะดูเป็น repo ๆ ไป. read-only สำรวจอย่างเดียว ไม่ต้องแก้อะไร. เสร็จแล้ว report DONE กลับมาหา No.1 พร้อม path เอกสาร.
