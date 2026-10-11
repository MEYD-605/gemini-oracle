---
name: thai-typst-booklet
description: Use when making Thai PDF booklets with Typst.
version: 1.0.0
---

# Thai Typst Booklet Generation

Use this skill when generating Thai PDF documents, booklets, manuals, or reports using Typst.

## Critical Thai Typography Rules (P'Nat's Rules)
1. **Justification**: `#set par(justify: false)` MUST be set for Thai text. Typst justifies by stretching whitespace, but Thai words joined by zero-width spaces (ZWSP) cannot stretch, creating ugly whitespace "rivers" when justified. Ragged-right (`justify: false`) is mandatory for clean rendering.
2. **Line Leading & Spacing**:
   ```typst
   #set par(leading: 1.34em, justify: false, first-line-indent: 0em)
   #set block(spacing: 1.35em)
   ```
3. **Font Stack**: Use vendored `Laksaman` and `Norasi` fonts:
   ```typst
   #set text(font: ("Laksaman", "Norasi"), size: 11pt, lang: "th")
   ```
4. **Wordbreak Pre-processing**:
   Always pre-process raw Markdown text with PyThaiNLP before converting to Typst:
   ```bash
   uvx --from pythainlp python3 thai-wordbreak.py < raw.md > zwsp.md
   pandoc -f markdown-citations zwsp.md -o body.typ -t typst
   ```

## Standard Build Pipeline
```bash
# 1. Merge markdown sources
cat 00-overview.md 01-details.md > raw.md

# 2. Add Thai ZWSP word breaks
uvx --from pythainlp python3 thai-wordbreak.py < raw.md > zwsp.md

# 3. Convert to Typst body
pandoc -f markdown-citations zwsp.md -o body.typ -t typst
perl -i -pe 's/#horizontalrule/#line(length: 100%)/g' body.typ

# 4. Compile with Typst pointing to fonts
typst compile --font-path fonts book.typ output.pdf
```
