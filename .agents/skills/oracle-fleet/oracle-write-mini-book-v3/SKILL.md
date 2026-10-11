---
name: oracle-write-mini-book-v3
description: "Write a cmini book from scratch — outline, parallel Sonnet drafting, Thai word break, typst PDF rendering, review, title brainstorm, publish to GitHub. Full pipeline proven on 'The Oracle Pattern' (15 chapters, 200+ pages). TRIGGER when: user says 'เขียนหนังสือ', 'write book', 'cmini book', 'เขียนเล่มยาว', or wants a full book with PDF output. DO NOT TRIGGER for: short guides (use /oracle-write-book), cheatsheets (use /oracle-cheatsheet), single docs."
installer: create-shortcut
created_at: 2026-06-09T13:40:00+07:00
---

# /oracle-write-mini-book-v3 — cmini Book Pipeline

> จาก idea สู่หนังสือ 200+ หน้า PDF — proven pipeline จาก "The Oracle Pattern"

## When to Use

- หนังสือเต็มเล่ม 10-20 บท (200+ หน้า)
- ต้องการ PDF สวย (typst + Thai font + code blocks)
- ต้องการ parallel agents เขียนขนาน
- ต้องการ Thai word segmentation ที่ถูกต้อง

## Pipeline Overview

```
Step 0:  Mine session         ← dig JSONL + traces + issues
Step 1:  Outline              ← per-chapter metadata (YAML)
Step 2:  Prism review         ← 5-lens structure check
Step 3:  Title brainstorm     ← 10 DNA + 3 judges workflow
Step 4:  Parallel draft       ← N Sonnet agents write files
Step 5:  Thai word break      ← PyThaiNLP ZWSP insertion
Step 6:  Compile              ← pandoc MD → typst markup
Step 7:  Render PDF           ← typst compile with styling
Step 8:  Review               ← 3 Sonnet agents check
Step 9:  Iterate              ← fix findings, re-render
Step 10: Publish              ← GitHub repo + release
```

---

## Step 0: Mine Session Material

ห้ามเขียนจาก memory — ขุด source material จริงเสมอ

```bash
# Session traces
python3 ~/.claude/skills/dig/scripts/dig.py 0 --deep

# GitHub issues
gh issue view <NNNN> --json body,comments

# Trace logs
find ψ/memory/traces/ -name "*.md" -newer <reference>

# Cheatsheets + design sheets
ls -t ψ/writing/cheatsheets/ | head -5
```

---

## Step 1: Outline (MUST do before drafting)

สร้าง outline file: `ψ/writing/books/YYYY-MM-DD_<slug>-OUTLINE.md`

### Book Metadata

```yaml
title: "<title>"
subtitle: "<subtitle>"
author: <oracle-name>
date: YYYY-MM-DD
language: Thai (kien-thai 7 frames)
register: <pick from kien-thai 6 registers>
target_chapters: 10-20
target_words_per_chapter: 3000-4000
parts: 2-3 (Overview / Technical / Vision)
```

### Per-Chapter Metadata

```yaml
## บทที่ N: <title>

target_words: 3500
dna: <DNA name> (<insight>)
soul_thread: "<theme thread>"
subtopics:
  - N.1 <subtopic>
  - N.2 <subtopic>
  - N.3 <subtopic>
proof:
  - <code path, issue #, trace log>
checklist:
  - [ ] <specific item>
```

### Part Structure (3-part default)

```
ภาค 1: เรื่องเล่า (Overview)      — ที่มาที่ไป context ปัญหา
ภาค 2: Technical (Deep Dive)     — code architecture ข้างในเป็นยังไง
ภาค 3: Design & Vision           — design decisions อนาคต
```

### Chapter Length

| ส่วน | ความยาว | หน้าที่ |
|------|---------|---------|
| เปิดบท (hook) | 200-300 คำ | ดึงเข้าเรื่อง |
| เนื้อหาหลัก | 1,500-2,000 คำ | 3-5 subtopics |
| Code/diagram | 300-500 คำ | 2-3 code blocks |
| ปิดบท | 200-300 คำ | lesson + hook บทถัดไป |
| **รวม** | **1,200-2,000 คำ** | **อ่าน 5-10 นาที** |

---

## Step 2: Prism Review on Outline

ก่อน draft ใช้ /oracle-prism 5 lenses:
1. **Archaeologist** — ครบไหม?
2. **Bug Hunter** — บทไหนอ่อน?
3. **Skeptic** — narrative หรือ reference?
4. **Architect** — flow ถูกไหม?
5. **Auditor** — proof ทุกบท?

---

## Step 3: Title Brainstorm (Workflow)

ใช้ Workflow tool — 2 phases:

**Phase 1: 10 perspectives brainstorm** (Sonnet ขนาน):
System Architect, AI Researcher, DevTool Marketer, Philosophy Writer,
Thai Copywriter, O'Reilly Editor, Indie Hacker, Conference Speaker,
Manga/LN Author, Builder (Nat's perspective)

แต่ละ perspective เสนอ 5 ชื่อ + subtitle → รวม 50 candidates

**Phase 2: 3 judges score** (Sonnet ขนาน):
- Developer Judge — curiosity, clarity, memorability
- Publisher Judge — market fit, uniqueness, shelf appeal
- kien-thai Judge — Thai naturalness, rhythm, emotional impact

**Title structure:**
```
Main Title (professional, authoritative)
Subtitle (กว้าง ครอบคลุม)

Tagline (hook — 1-2 lines)
```

---

## Step 4: Parallel Draft (Sonnet Agents Write Files)

### CRITICAL: Agents MUST write files, NOT return text

ใช้ Workflow tool pipeline pattern — 1 agent per chapter, ทุกตัวเขียนไฟล์เอง

### Directory Structure

```
ψ/writing/books/<slug>/
├── book.typ            ← typst styling config
├── book.css            ← md-to-pdf fallback
├── book.yaml           ← pandoc metadata
├── Makefile            ← make pdf / make latex
├── thai-wordbreak.py   ← PyThaiNLP ZWSP inserter
├── 00-frontmatter.md
├── 01-chapter-one.md
├── 02-chapter-two.md
├── ...
└── 15-end-game.md
```

### Agent Prompt Template

```
คุณกำลังเขียนบทที่ N ของหนังสือ "<title>"

## Context
<book metadata + transformation arc>

## บทนี้
<chapter metadata: title, DNA, subtopics, proof>

## Source Material
<file paths, issue numbers, trace logs>

## Writing Rules (kien-thai 7 frames)
- f1: Topic-comment ไม่ใช่ SVO
- f2: เงื่อนไขขึ้นหน้า (พอ...ก็...)
- f3: เว้นวรรค ไม่ใช่จุด
- f4: ปิดด้วย particles (ด้วย/แล้ว/เลย/ต่างหาก)
- f5: Zero anaphora + demonstratives
- f6: ก็ เป็นจังหวะ
- f7: Pivot ด้วยคำถาม/แต่

## CRITICAL: WRITE THE FILE
Write to: <book-dir>/NN-slug.md
Return แค่: "wrote NN-slug.md — X words"
```

---

## Step 5: Thai Word Break (PyThaiNLP)

ภาษาไทยไม่มี space ระหว่างคำ → typst ตัดบรรทัดผิดจุด
แก้ด้วย zero-width space (U+200B) ที่จุดตัดคำ

### thai-wordbreak.py

```python
#!/usr/bin/env python3
"""Insert ZWSP at Thai word boundaries for proper line breaking."""
import sys, re
from pythainlp.tokenize import word_tokenize

ZWSP = "​"

def has_thai(text):
    return bool(re.search(r'[฀-๿]', text))

def insert_zwsp(text):
    if not has_thai(text):
        return text
    parts = re.split(r'(`[^`]+`)', text)  # preserve inline code
    result = []
    for part in parts:
        if part.startswith('`'):
            result.append(part)
        elif has_thai(part):
            segments = re.split(r'([฀-๿]+)', part)
            for seg in segments:
                if has_thai(seg):
                    result.append(ZWSP.join(word_tokenize(seg, engine="newmm")))
                else:
                    result.append(seg)
        else:
            result.append(part)
    return ''.join(result)
```

### Run

```bash
for f in 00-*.md 01-*.md ... 15-*.md; do
  uvx --from pythainlp python3 thai-wordbreak.py "$f" >> /tmp/book-zwsp.md
done
```

---

## Step 6: Compile (pandoc MD → typst)

```bash
pandoc /tmp/book-zwsp.md -o book-typst.typ -t typst
sed -i '' 's/#horizontalrule/#line(length: 100%)/g' book-typst.typ
cat book.typ book-typst.typ > book-full.typ
```

---

## Step 7: Render PDF (typst)

### book.typ — Golden Page Layout Config

```typst
// Page setup
#set page(paper: "a4", margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm))
#set text(font: "Sarabun", size: 12pt, lang: "th")
#set heading(numbering: none)
#set par(leading: 1.6em, justify: false, first-line-indent: 0em)
#set block(spacing: 2.5em)

// Chapter headings — page break before
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  set text(size: 20pt, weight: "bold")
  v(2em); it; v(1em)
}

// Section headings
#show heading.where(level: 2): it => {
  set text(size: 14pt, weight: "bold")
  v(1em); it; v(0.5em)
}

// Code blocks — Fira Code mono + background
#show raw.where(block: true): it => {
  set text(font: "Fira Code", size: 9pt)
  block(fill: rgb("#f6f8fa"), stroke: 0.5pt + luma(200),
    inset: 14pt, radius: 4pt, width: 100%, it)
}

// Inline code — subtle grey background + charcoal
#show raw.where(block: false): it => {
  box(fill: rgb("#f0f0f0"), inset: (x: 3pt, y: 1.5pt), radius: 2pt,
    text(font: "Fira Code", size: 9pt, fill: rgb("#36454f"), it))
}

// Bold — dark navy
#show strong: it => {
  text(weight: "bold", fill: rgb("#1a1a2e"), it)
}

// Blockquotes — blue left border + light blue background
#show quote.where(block: true): it => {
  block(fill: rgb("#f0f4f8"), stroke: (left: 3pt + rgb("#3498db")),
    inset: (left: 16pt, right: 12pt, top: 10pt, bottom: 10pt),
    radius: (right: 4pt), it)
}

// Tables — dark header + zebra stripes
#set table(
  stroke: 0.5pt + luma(180),
  fill: (_, row) => if row == 0 { rgb("#2c3e50") }
    else if calc.odd(row) { rgb("#f8f9fa") } else { white },
)
#show table.cell: it => {
  set text(size: 10pt); set align(left)
  if it.y == 0 { set text(fill: white, weight: "bold"); it } else { it }
}

// TOC — depth 1 only
#outline(title: "สารบัญ", depth: 1)
```

### Font Requirements

| Font | Purpose | Install |
|------|---------|---------|
| **Sarabun** | Body text (Thai + EN) | macOS built-in |
| **Fira Code** | Code blocks + inline code | `brew install --cask font-fira-code` |

### Typography Rules (from 10-DNA Prism)

| Rule | Value | Why |
|------|-------|-----|
| Body font | Sarabun 12pt proportional | Thai readability — looped font |
| Code font | Fira Code 9pt mono | Code blocks only |
| Line height | 1.6em | Thai ascender/descender |
| Block spacing | 2.5em | Paragraph gap > line gap (1.67× ratio) |
| Justify | false (ragged-right) | Thai has no word spaces to stretch |
| Margin | 3cm L/R, 2.5cm T/B | ~65 chars/line |
| TOC depth | 1 | Chapter titles only |
| Heading numbering | none | Clean, no 3.1.2 nesting |

### Compile

```bash
typst compile book-full.typ book-typst.pdf
```

---

## Step 8: Review (3 Sonnet Agents)

Dispatch 3 agents ขนาน — แต่ละตัวเขียนผลลงไฟล์:

### Agent 1: Permissions Review
- หา repo references (GitHub URLs, `gh` commands)
- ตรวจ public vs private repo accuracy
- Output: `REVIEW-permissions.md`

### Agent 2: Code Blocks Review
- ตรวจ language tags (```bash, ```typescript)
- หา lines > 70 chars (ตัดบรรทัดใน PDF)
- ตรวจ syntax validity
- Output: `REVIEW-codeblocks.md`

### Agent 3: Formatting Review
- หาจุดที่ควร bold แต่ยังเป็น plain text
- หา paragraph ยาว > 8 บรรทัด (ตัดให้สั้น)
- หา duplicate sections
- Output: `REVIEW-formatting.md`

---

## Step 9: Iterate

จาก review findings:
1. แก้ content ใน per-chapter .md files
2. Re-run thai-wordbreak.py
3. Re-compile pandoc + typst
4. Re-render PDF
5. ตรวจด้วยตา (อ่าน PDF จริง)

### Common Fixes

| ปัญหา | แก้ |
|--------|-----|
| Paragraph ยาว 8+ lines | ตัดเป็น 2 paragraphs |
| ASCII diagram border ไม่ align | ปรับ width ให้พอดี code block |
| Inline code สีแรงเกินไป | ใช้ charcoal (#36454f) ไม่ใช่ red |
| Table header ไม่เด่น | Dark header + zebra stripes |
| Thai word break ผิด | เพิ่ม ZWSP ด้วย PyThaiNLP |
| LaTeX commands รั่ว | ใช้ typst syntax ไม่ใช่ LaTeX |
| Font Thai เพี้ยน | ใช้ Sarabun (proportional) ไม่ใช่ mono |

---

## Step 10: Publish

### GitHub Repo

```bash
gh repo create <org>/<book-name> --public \
  --description "<title> — <subtitle>"
```

### Push PDF only (keep Markdown private)

```bash
cp book-typst.pdf <repo>/<book-name>.pdf
# Write README.md with credits
git add *.pdf README.md
git commit -m "<title> — <subtitle>"
git push
```

### GitHub Release

```bash
gh release create v<YYYY.MM.DD> <book-name>.pdf \
  --title "<title> v<YYYY.MM.DD>" \
  --notes "## Download\n<description>"
```

### README Credits Template

Credits ทุก open source tool + skill + community ที่ใช้:
- AI Engines (Claude, Codex)
- Typesetting (typst, pandoc)
- Thai NLP (PyThaiNLP, kien-thai)
- Fonts (Sarabun, Fira Code)
- Skills (oracle-write-book, oracle-write-techbook)
- Workshop community
- License: CC BY-SA 4.0

---

## Global Checklist

- [ ] ทุกบทมี proof จริง (code path, issue #, trace log)
- [ ] DNA weave เข้า narrative ไม่ใช่ list
- [ ] Soul (ψ/) เป็น thread ตลอดเล่ม (ถ้าเกี่ยว)
- [ ] Failures included (honest, ไม่แก้ตัว)
- [ ] kien-thai 7 frames ทุก paragraph
- [ ] ไม่ recap ตอนปิด — forward-looking
- [ ] แต่ละบทอ่านจบในรอบเดียว (10-15 นาที)
- [ ] Code blocks copy-paste ได้จริง
- [ ] Author = oracle name (Rule 6: ไม่แกล้งเป็นคน)
- [ ] Agents write files ไม่ return text
- [ ] Private repos marked clearly

## Anti-patterns

- ❌ เขียนจาก memory แทน trace — ข้อมูลผิด
- ❌ เขียนทั้งเล่มใน 1 agent — context overflow
- ❌ Agents return text แทน write files — context ท่วม
- ❌ รวมทุกบทเป็น 1 ไฟล์ — แก้ยาก
- ❌ Opus draft ทั้งเล่ม — แพง ช้า
- ❌ เขียนก่อน outline — ต้อง outline ก่อนเสมอ
- ❌ Skip prism review — โครงสร้างอ่อน
- ❌ ใช้ mono font ทั้งเล่ม — แน่น อ่านยาก
- ❌ Justify Thai text — Thai ไม่มี word space ให้ stretch
- ❌ File issue ก่อนขุด — ข้อมูลอาจผิด
- ❌ Skip Thai word break — ตัดบรรทัดผิดจุด

## Relationship to Other Skills

| Skill | ใช้เมื่อ |
|-------|---------|
| `/oracle-write-book` | Guide สั้น 3-5 บท |
| `/oracle-write-techbook` | คู่มือสร้างเอง (Vol 2) |
| **`/oracle-write-mini-book-v3`** | **หนังสือเต็มเล่ม 10-20 บท + PDF** |
| `/oracle-cheatsheet` | สูตรโกง 1 หน้า |
| `/kien-thai` | Thai prose engine (ถูกเรียกภายใน) |
| `/oracle-prism` | Structure review (Step 2) |
| `/kode-thai` | Iterative Thai audit loop |
| **`/oracle-book-cover`** | **ออกแบบปก (แทนการทำปกเอง) — art จริง + IP-check + black-gold + social crops** |

## Proven On

**The Oracle Pattern** — 5 บท, 40+ หน้า, 2.3MB PDF
- https://github.com/the-oracle-keeps-the-human-human/the-oracle-pattern
- Pipeline: MD → PyThaiNLP → pandoc → typst → PDF
- 15 Sonnet agents draft + 14 Sonnet agents write files + 3 review agents
- 2 rounds title brainstorm (10 perspectives × 3 judges each)
- 10 iterations of typst styling (v1 → v10)
- Thai word segmentation via PyThaiNLP newmm engine
