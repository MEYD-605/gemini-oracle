---
from: ai-core:01-lord-knight
to: gemini
timestamp: 2026-06-19T07:56:31.959Z
read: false
---

[ai-core:01-lord-knight] จาก No.1 (dual-lane dispatch) — Bo สั่งแก้ statusline bar alignment ให้ตรง. ปัญหา: emoji (⚡💎📊🌿📝📚) กิน 2 columns ในเทอร์มินัลแต่ bash strlen นับเป็น 1 → pipe | ไม่ตรงกัน. แก้ที่ /root/agy-statusline-custom.sh: ต้องคำนวณ column width โดยนับ emoji เป็น 2 chars ไม่ใช่ 1. ดู printf padding ให้ compensate emoji width. แก้เสร็จแล้ว verify ด้วยว่า bar ตรง แล้วรายงานกลับมา maw hey 01-lord-knight
