---
name: oracle-write-book
description: "Write a guide from topic → Markdown → PDF → images → Discord in one flow. Use when user says 'เขียนหนังสือ', 'write book', '/oracle-write-book', or wants a shorter guide (not proof-dense booklet or 50K complete book)."
---

# /write-book — Write + Render + Publish a Guide

> จาก topic → Markdown → PDF → รูป → Discord ใน 1 command

## When to Use
- Nat says "เขียนหนังสือ", "เขียน guide", "ทำเป็น PDF"
- มีข้อมูลพร้อมจะรวบรวมเป็นบทความ/คู่มือ

## Steps

### 1. Acknowledge ทันที
```
🌍 กำลังเขียนหนังสือ: [TOPIC]

\`\`\`
[/] รวบรวมข้อมูล
[ ] เขียน Markdown
[ ] Render PDF
[ ] Convert รูป
[ ] ส่ง Discord
\`\`\`
```

### 2. รวบรวมข้อมูล
- Dig session JSONL สำหรับ timeline + proof
- อ่าน relevant files (commits, configs, inbox)
- รวม timestamps จริง (ไม่เดา)

### 3. เขียน Markdown
Path: `docs/<slug>.md`

Template:
```markdown
# [Title]

> [Subtitle — one line]

**Author**: Atlas Oracle [m5:atlas]
**Date**: YYYY-MM-DD

---

## Chapter 1: [Context/Problem]
## Chapter 2: [Solution/Steps]
## Chapter 3: [Real Example]
## Chapter 4: [Troubleshooting]
## Chapter 5: [Checklist]

---

> ท้องฟ้าไม่ร่วง เพราะมีคนแบกอยู่

*Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>*
```

กฎ:
- Timeline ใช้ timestamps จริงจาก JSONL เท่านั้น
- ใส่ code blocks สำหรับ commands
- Checklist ใช้ `[ ]` ไม่ใช่ emoji
- ห้ามใช้ table ใน Discord (render ห่วย) — ใช้ list แทน
- Proof: commit hash, file path, error message

### 4. Render PDF
```bash
cd /tmp && npx -y md-to-pdf docs/<slug>.md
```

### 5. Convert เป็นรูป
```bash
mkdir -p /tmp/<slug>-images
pdftoppm -png -r 200 docs/<slug>.pdf /tmp/<slug>-images/page
```

### 6. Commit + Push
```bash
git add docs/<slug>.md docs/<slug>.pdf
git commit -m "docs: [title]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin alpha
```

### 7. ส่ง Discord
```
reply(chat_id, text, files: [pdf, page-1.png, page-2.png, ...])
```

พร้อม GitHub link สำหรับ render สวยๆ

### 8. อัพเดต status
```
\`\`\`
[X] รวบรวมข้อมูล
[X] เขียน Markdown (N chapters)
[X] Render PDF
[X] Convert รูป (N pages)
[X] ส่ง Discord
\`\`\`
```

## Rules
- Acknowledge ก่อนเริ่มเสมอ (พร้อม TODO)
- อัพเดต Discord ระหว่างทำ (long-task UX)
- Timestamps จริงเท่านั้น (dig JSONL)
- Code block สำหรับ checklist (`[X] [/] [ ]`)
- Commit ก่อนส่ง Discord (GitHub link พร้อม)

## Proven
- Guide 1: Team Spawn (343 lines, 10 chapters, 7 pages) — 3 min
- Guide 2: Design Partner + Codex Team (393 lines, 6 chapters, 7 pages) — 2 min
