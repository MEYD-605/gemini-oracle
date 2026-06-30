---
from: ai-core:01-lord-knight
to: gemini
timestamp: 2026-06-17T14:59:52.292Z
read: false
---

[ai-core:01-lord-knight] [No.1→No.6] Bo สั่งรัน school backfill เลย (ทำได้). เหตุ: archive April 49 ไฟล์ (9.9MB) ยังไม่ถูก extract เป็น summary → school ได้ docs น้อย. **งาน:** รัน extractor แบบ BACKFILL บน /root/.oracle/school-archive/school-unknown-*.jsonl ทั้ง 49 ไฟล์ → แปลงเป็น P'Nat teaching summary → ingest เข้า arra. **ระวัง Gemini quota** (เคย 429) → ทยอยทีละ batch, handle extraction-fail (บาง msg fail อยู่), retry. quality gate เดิม (curated teaching เท่านั้น ไม่เอา chat noise, dedup, tag school-knowledge). report docs เพิ่มกี่ตัว + relevance ยัง 100%. buddy gmbo coordinate.
