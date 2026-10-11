---
name: typst-thai-pdf-layout
description: "Use when rendering Thai PDFs or booklets via Typst."
---

# Typst Thai PDF Layout & Formatting Rules

Key rules extracted from P'Nat's `phd-citation-oracle` and proven in fleet PDF generation:

## 1. Justification (`justify: false`)
- **CRITICAL:** Always set `#set par(justify: false)` for Thai text in Typst.
- Typst justifies text by stretching whitespace. Thai words are joined using Zero-Width Spaces (ZWSP) which cannot stretch. Setting `justify: true` creates wide whitespace gaps ("rivers") across Thai lines.
- **Ragged-right (`justify: false`) is mandatory for clean Thai typography.**

## 2. Line & Block Spacing
- Paragraph leading: `#set par(leading: 1.34em, justify: false, first-line-indent: 0em)`
- Block spacing: `#set block(spacing: 1.35em)`

## 3. Font Setup & Fallback Prevention
- Always specify font family and vendor TTF fonts explicitly:
  `#set text(font: ("Laksaman", "Norasi"), size: 11pt, lang: "th")`
- Pass local font paths to compiler: `typst compile --font-path fonts ...` to avoid missing font fallbacks that mis-stack Thai tone marks.
- Code blocks formatting:
  ```typst
  #show raw.where(block: true): it => {
    set text(font: "Fira Code", size: 8.5pt)
    set par(leading: 0.66em)
    block(fill: rgb("#f6f8fa"), stroke: 0.5pt + luma(200), inset: 7pt, radius: 4pt, width: 100%, it)
  }
  #show raw.where(block: false): it => {
    box(fill: rgb("#f0f0f0"), inset: (x: 3pt, y: 1.5pt), radius: 2pt, text(font: "Fira Code", size: 9pt, fill: rgb("#36454f"), it))
  }
  ```

## 4. PyThaiNLP Pre-processing & Pandoc Pipeline
- Process Markdown with PyThaiNLP ZWSP insertion before Pandoc:
  ```bash
  uvx --from pythainlp python3 thai-wordbreak.py < raw.md > zwsp.md
  pandoc -f markdown-citations zwsp.md -o body.typ -t typst
  perl -i -pe 's/#horizontalrule/#line(length: 100%)/g' body.typ
  ```

## 5. Pitfalls & Lessons Learned
- **Markdown Header Inclusion Trap:** Avoid including raw Markdown directly into `.typ` via `#include "doc.md"` without converting to `.typ` first; Typst treats raw Markdown `#` as code syntax, breaking compilation. Convert via Pandoc first (`pandoc -f markdown-citations input.md -o body.typ -t typst`).
- **Typst Context Expressions:** In Typst 0.15+, page counters in footers must be wrapped in `context`: `footer: context [ ... #counter(page).display() ]`.
- **Fira Code Font Fallback Warning:** When specifying code block font `font: "Fira Code"`, ensure Fira Code TTF is included in local `--font-path fonts` or system fonts, otherwise Typst will throw `warning: unknown font family: fira code`.
- **9router Remote Auth & Local Binding:** When agents on local nodes (e.g. Note20) invoke local 9router, point `base_url` to `http://127.0.0.1:20128/v1` to bypass 9router remote IP authentication guards (`x-api-key` / `Authorization: Bearer`), avoiding 401 Unauthorized errors across fleet nodes.
- **Claude Sonnet 5 via 9router (`cc/claude-sonnet-5`):** Standardize primary agent execution to `cc/claude-sonnet-5` via 9router (`provider: 9router`, `model: cc/claude-sonnet-5`). Subagents and background tasks should use `ag/gemini-3.6-flash-high` for cost efficiency and speed.

