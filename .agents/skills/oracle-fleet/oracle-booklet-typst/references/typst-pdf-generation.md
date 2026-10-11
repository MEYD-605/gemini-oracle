# Typst PDF Generation & Thai Wordbreak Reference Rules

Excerpted from `phd-citation-oracle` (`ψ/writing/books/`) and `grok-bkk-school-manual`.

## Architecture & Layout

A standard Typst booklet directory consists of:
1. `book.typ`: Root template setting page geometry, margins, fonts, headers, and footers.
2. `build.sh`: Executable build script pointing `typst compile` to `./fonts`.
3. `thai-wordbreak.py`: Pre-processing script for zero-width space insertion in Thai text.
4. `fonts/`: Local font directory containing `Krub`, `TH Sarabun New`, etc.

## Key Typst Syntax Rules (Typst ≥ 0.15.1)

### 1. Dynamic Footers Require `context`
Dynamic functions like page counters inside footers require a `context` block:
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

### 2. Including Markdown in Typst
Directly using `#include "file.md"` in Typst causes syntax collisions because `#` in Markdown is interpreted as Typst code mode.
To include text safely:
- Convert `# Heading` to `= Heading` (Typst heading syntax).
- Convert `**bold**` to `*bold*` (Typst strong syntax).
- Escape standalone `#` characters as `\#`.
- Or write clean Typst markup directly in a `.typ` content file.

### 3. Font Path Flag
Always pass `--font-path ./fonts` when invoking `typst compile` so vendored TTF/OTF fonts resolve reproducibly:
```bash
typst compile --font-path ./fonts book.typ output.pdf
```
