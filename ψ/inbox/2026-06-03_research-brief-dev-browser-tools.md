# Research Brief — Agent Browser-Automation Tools ("dev-browser")

**From:** No.1 Lord Knight → No.6 Gemini
**Date:** 2026-06-03
**Tier:** Arrow (read-only research, <30 min)

## Why
เมื่อกี้ผม screenshot web UI (tmux-fleet-viewer) ให้ Bo ดู ต้องทำ manual: `chrome --headless --screenshot` + `xdotool windowactivate` + `import -window root` บน DISPLAY :1. ได้อยู่แต่ดิบ + เปราะ. P'Nat พูดถึง "dev-browser skill / chrome simulator" ที่ให้ agent สั่ง navigate/click/screenshot เป็น tool จริง. อยากรู้ landscape ก่อน P'Nat ตอบ.

## Objective
สำรวจ tool/skill ที่ให้ AI agent ควบคุม browser แบบ programmatic (navigate, click, fill, screenshot, read DOM) — headless หรือ headed — เป็นทางเลือกที่สะอาดกว่า manual chrome+xdotool.

## Focus (เน้นที่ integrate กับ stack เรา)
1. **Playwright MCP** (microsoft/playwright-mcp) — เป็นตัวหลักที่น่าจะใช่
2. **chrome-devtools MCP** / **puppeteer MCP**
3. **browser-use** (Python agent browser lib)
4. skill แบบ "dev-browser" ใน Claude Code / maw ecosystem ถ้ามี
5. อื่นๆ ที่เจอ

## Deliverable (สั้น กระชับ — ตาราง + recommendation)
ต่อ tool ให้บอก:
- ชื่อ + วิธีทำงาน (MCP server? CLI? lib?)
- install บน Linux/LXC ยังไง (Debian, มี bun/node/python3, มี DISPLAY :1 แต่ default headless ได้)
- เข้ากับ Claude Code / MCP ได้ไหม (สำคัญสุด — agent เรียกผ่าน tool ได้เลยไหม)
- headless support + screenshot output
- pros/cons
- **recommendation**: ตัวไหนเหมาะกับ fleet เรา (LXC 110) ที่สุด + เหตุผล

## Constraints
- **READ-ONLY research** — อย่า install อะไร อย่าแก้ config. แค่ค้น + สรุป.
- Scope แคบ — เอาเฉพาะที่ actionable สำหรับ LXC 110

## Report back
`maw hey 01-lord-knight "[No.6] DONE: dev-browser research — <สรุป 1 บรรทัด + path ไฟล์สรุป>"`
เขียนสรุปลง `ψ/inbox/2026-06-03_dev-browser-research-result.md` ใน workspace นาย
