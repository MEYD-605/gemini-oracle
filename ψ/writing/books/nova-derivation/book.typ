// Typst Golden Page Layout Config for "The Nova Derivation"

// Cover Page Design
#page(
  paper: "a4",
  margin: (top: 4cm, bottom: 4cm, left: 3cm, right: 3cm),
  fill: rgb("#1a1a2e") // Deep dark navy background
)[
  #set text(fill: white, font: "Sarabun")
  #align(center + horizon)[
    #v(2cm)
    #text(size: 14pt, weight: "bold", fill: rgb("#e5c158"))[TECHNICAL HANDBOOK FOR L2 BLOCKCHAINS]
    #v(1em)
    #line(length: 40%, stroke: 1.5pt + rgb("#e5c158"))
    #v(1.5em)
    #text(size: 32pt, weight: "bold", fill: white)[The Nova Derivation]
    #v(0.5em)
    #text(size: 14pt, style: "italic", fill: rgb("#a0a5c0"))[L2 OP-Stack Chain Deployment & Dual-Path Sync\ Troubleshooting Handbook]
    #v(3em)
    #line(length: 80%, stroke: 0.5pt + rgb("#3f445f"))
    #v(2em)
    #text(size: 11pt, fill: rgb("#d0d4fc"))[
      บทสรุปเชิงลึกในการติดตั้ง แก้ไขปัญหา Rate Limit, บล็อกฝากพัง\ และสัญญาณ Gossip ระดับ Peer-to-Peer
    ]
    #v(6cm)
    #text(size: 12pt, weight: "bold", fill: rgb("#e5c158"))[โดย สภาออราเคิล (Oracle Council)]
    #v(0.5em)
    #text(size: 10pt, fill: rgb("#8085a0"))[No.6 Gemini · ai-core:no6]
    #v(0.5em)
    #text(size: 9pt, fill: rgb("#8085a0"))[แก้ไขล่าสุด: 2026-06-20]
  ]
]

// Main Document Configurations
#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  header: context {
    if here().page() > 1 {
      text(9pt, fill: luma(120), font: "Sarabun")[
        The Nova Derivation: L2 OP-Stack Troubleshooting Handbook
        #h(1fr)
        สภาออราเคิล
      ]
    }
  },
  footer: context {
    if here().page() > 1 {
      let page-num = here().page()
      text(10pt, fill: luma(100), font: "Sarabun")[
        #h(1fr)
        #page-num
        #h(1fr)
      ]
    }
  }
)

#set text(font: "Sarabun", size: 12pt, lang: "th")
#set heading(numbering: none)
#set par(leading: 1.6em, justify: false, first-line-indent: 0em)
#set block(spacing: 2.5em)

// Chapter headings — page break before
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  set text(size: 22pt, weight: "bold", fill: rgb("#1a1a2e"))
  v(1.5em)
  it
  v(1em)
}

// Section headings
#show heading.where(level: 2): it => {
  set text(size: 14pt, weight: "bold", fill: rgb("#2c3e50"))
  v(1.2em)
  it
  v(0.6em)
}

// Code blocks — Fira Code mono + background
#show raw.where(block: true): it => {
  set text(font: "Fira Code", size: 9pt)
  block(
    fill: rgb("#f6f8fa"),
    stroke: 0.5pt + luma(200),
    inset: 12pt,
    radius: 4pt,
    width: 100%,
    it
  )
}

// Inline code — subtle grey background + charcoal
#show raw.where(block: false): it => {
  box(
    fill: rgb("#f0f0f0"),
    inset: (x: 4pt, y: 2pt),
    radius: 2pt,
    text(font: "Fira Code", size: 9.5pt, fill: rgb("#36454f"), it)
  )
}

// Bold text style
#show strong: it => {
  text(weight: "bold", fill: rgb("#1a1a2e"), it)
}

// Blockquotes — blue left border + light blue background
#show quote.where(block: true): it => {
  block(
    fill: rgb("#f0f4f8"),
    stroke: (left: 3.5pt + rgb("#3498db")),
    inset: (left: 16pt, right: 12pt, top: 12pt, bottom: 12pt),
    radius: (right: 4pt),
    it
  )
}

// Tables — dark header + zebra stripes
#set table(
  stroke: 0.5pt + luma(180),
  fill: (_, row) => if row == 0 { rgb("#2c3e50") } else if calc.odd(row) { rgb("#f8f9fa") } else { white },
)
#show table.cell: it => {
  set text(size: 10pt)
  set align(left + horizon)
  if it.y == 0 {
    set text(fill: white, weight: "bold")
    it
  } else {
    it
  }
}

// Table of Contents Page
#page(header: none, footer: none)[
  #v(2em)
  #text(20pt, weight: "bold", fill: rgb("#1a1a2e"))[สารบัญ]
  #v(1.5em)
  #outline(title: none, depth: 1)
]

#pagebreak()
