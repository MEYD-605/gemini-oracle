# Thai Typst Layout & Justification Reference (P'Nat Standard)

## The Core Rule: `justify: false` (Ragged-Right)

When rendering Thai language text using Typst, **never set `justify: true`**.

### Why?
Typst justifies text by stretching whitespace between words. In Thai:
1. Words are concatenated continuously without spaces.
2. When Zero-Width Spaces (ZWSP / `\u{200b}`) are inserted via PyThaiNLP for wordbreaking, Typst cannot stretch ZWSPs properly.
3. As a result, Typst only stretches the explicit spaces that exist (e.g. around punctuation or English terms), leading to unsightly wide gaps and "rivers" of whitespace running down the page.

### The P'Nat Approved Typst Config:

```typst
#set text(font: ("Laksaman", "Norasi", "Sarabun"), size: 11pt, lang: "th")
#set page(paper: "a4", margin: (top: 2.1cm, bottom: 2.1cm, left: 2.4cm, right: 2.4cm))

// GOTCHA: justify MUST be false for Thai text!
#set par(leading: 1.34em, justify: false, first-line-indent: 0em)
#set block(spacing: 1.35em)
```
