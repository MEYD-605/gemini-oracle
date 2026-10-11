---
name: oracle-booklet-typst
description: Use when building Typst PDFs or fixing Thai font errors.
version: 1.0.0
category: oracle-fleet
tags: [typst, pdf, booklet, thai-wordbreak, phd-citation-oracle]
---

# Oracle Booklet & Typst PDF Publishing Pipeline

This skill captures the reproducible **Typst + Thai Wordbreak Engine** pipeline used across `phd-citation-oracle` and Oracle Fleet handbooks to generate clean, proof-dense PDF documents.

## When to Use

- When building PDF booklets, manuals, or research guides using Typst (`typst compile`).
- When encountering Typst syntax errors, Thai font rendering issues, or header/footer context errors.

## Folder Structure

```
<book-dir>/
├── book.typ             # Root Typst template
├── build.sh             # Build script executing typst compile --font-path ./fonts book.typ output.pdf
├── thai-wordbreak.py    # Python helper for Thai zero-width space insertion
├── fonts/               # Vendored TTF/OTF fonts (Krub, TH Sarabun New)
└── references/typst-pdf-generation.md  # Detailed reference rules
```

## Typst Syntax & Rules (Typst ≥ 0.15.1)

### 1. Dynamic Footers Require `context`
Page counters or dynamic functions inside `page(footer: ...)` MUST be wrapped in a `context` block:
```typst
footer: context [
  #set text(fill: gray, size: 9pt)
  #grid(
    columns: (1fr, 1fr),
    align(left)[Soul Brews Studio · Oracle Fleet],
    align(right)[#counter(page).display()]
  )
]
```

### 2. Including Markdown Content
Do NOT use `#include "file.md"` directly if the markdown contains raw `#` headings, code blocks with `#`, or `**double stars**`.
Convert Markdown into clean Typst markup:
- Headings: `= Heading 1`, `== Heading 2`
- Bold text: `*bold*`
- Code blocks: `raw(...)` or ``` lang ... ```

### 3. Font Path
Always pass `--font-path ./fonts` when invoking `typst compile` to ensure vendored fonts are used:
```bash
typst compile --font-path ./fonts book.typ output.pdf
```
