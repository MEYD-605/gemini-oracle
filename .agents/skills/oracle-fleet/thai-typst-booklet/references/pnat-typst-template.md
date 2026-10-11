# P'Nat's Exact Typst Thai Template (book.typ)

```typst
#set text(font: ("Laksaman", "Norasi"), size: 11pt, lang: "th")
#set page(paper: "a4", margin: (top: 2.1cm, bottom: 2.1cm, left: 2.4cm, right: 2.4cm))
#set heading(numbering: none)

// justify: false on purpose — typst justifies by stretching whitespace, and Thai
// words are joined with zero-width spaces that cannot stretch. Justified Thai
// gets rivers. Ragged-right is the correct choice, not a compromise.
#set par(leading: 1.34em, justify: false, first-line-indent: 0em)
#set block(spacing: 1.35em)

// Cover page styling
#set page(margin: 2.2cm)
#line(length: 100%, stroke: 3pt + rgb("#1e3a8a"))
#v(4em)
#align(center, text(size: 26pt, weight: "bold", fill: rgb("#1a1a2e"))[
  TITLE HERE
])
#v(1.2em)
#align(center, text(size: 13pt, fill: luma(90))[
  SUBTITLE HERE
])
#v(2.5em)
#line(length: 100%, stroke: 3pt + rgb("#1e3a8a"))

// Body pages styling
#set page(
  paper: "a4",
  margin: (top: 2.1cm, bottom: 2.1cm, left: 2.4cm, right: 2.4cm),
  fill: white,
  numbering: "1",
)
#counter(page).update(1)

#outline(title: "สารบัญ", depth: 1)
#pagebreak()

// Headings
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  set text(size: 18pt, weight: "bold", fill: rgb("#1a1a2e"))
  v(0.6em); block(it); v(0.3em)
  line(length: 100%, stroke: 1.5pt + rgb("#1e3a8a"))
  v(0.7em)
}

#show heading.where(level: 2): it => {
  set text(size: 13pt, weight: "bold", fill: rgb("#2c3e50"))
  v(0.7em); block(it); v(0.2em)
}

#show raw.where(block: true): it => {
  set text(font: "Fira Code", size: 8.5pt)
  set par(leading: 0.66em)
  block(fill: rgb("#f6f8fa"), stroke: 0.5pt + luma(200),
    inset: 7pt, radius: 4pt, width: 100%, it)
}

#show raw.where(block: false): it => {
  box(fill: rgb("#f0f0f0"), inset: (x: 3pt, y: 1.5pt), radius: 2pt,
    text(font: "Fira Code", size: 9pt, fill: rgb("#36454f"), it))
}

#show table.cell: it => {
  set text(size: 9.5pt)
  if it.y == 0 { align(center, text(fill: white, weight: "bold", it)) } else { align(left, it) }
}

#include "processed_body.typ"
```
