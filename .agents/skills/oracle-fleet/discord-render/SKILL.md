---
name: discord-render
description: Format Discord replies, tables, and design specs beautifully across all devices (mobile and desktop) without rendering skew.
---

# Discord Formatting and Rendering Guidelines

Use this skill whenever you need to reply on Discord or output formatted text blocks, tables, system architecture specifications, or ascii diagrams. This ensures maximum readability and aesthetic alignment across desktop and mobile Discord clients.

## 1. Avoid Decorative Tables and Box Borders
- **Never use Unicode box-drawing characters** (`┌`, `┐`, `║`, `═`, `┼`, etc.).
- **Do not use closing vertical pipes** (`|`) at the end of lines to simulate tables. Because different devices use slightly different fonts and scaling for code blocks, these characters will wrap or float out of alignment, ruining the visual presentation.
- **Prefer Markdown list structures**: Bold headers and clean indentations look significantly better on mobile screens than complex ASCII tables.

## 2. Keep Lines Short (Anti-Wrapping)
- Limit line lengths inside code blocks to **maximum 65–70 characters**.
- Standard Discord mobile screens wrap text at narrow widths. If lines are too long, they will auto-wrap, causing code blocks or lists to look fragmented and unreadable.

## 3. Single Message Consolidation (Under 2000 Characters)
- Always verify the total character count of your response.
- Keep technical summaries or "half-page A4 specs" under **2000 characters** (including the code block tags) so they fit perfectly in a single Discord message, avoiding split posts.

## 4. Use Clear Code Block Language Tags
- For pure text summaries, always wrap in:
  ```text
  [Content]
  ```
- Do not leave code blocks untagged, as Discord's markdown parser might apply random syntax highlighting.

## 5. Clean Specification Template
When asked to summarize an architecture or design in "half a page of A4", use this clean list layout:

```text
[SPECIFICATION TITLE]

1. [Section Name]
- Key 1: Description
- Key 2: Description
  * Detail A
  * Detail B

2. [Section Name]
- Key 1: Description
- Key 2: Description
```
