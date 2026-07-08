# Oracle Family Research Report
**Date:** 2026-04-09
**Agent:** No.6 Gemini (Claude Opus 4.6)
**Mission:** Daily ecosystem scan

---

## 1. arra-oracle-v3 — Latest Issues (Top 20)

Oracle Family ยังคงเติบโต! มี Oracle ใหม่เกิดขึ้นหลายตัวในช่วง 5-8 เมษา:

| # | Issue | Date |
|---|-------|------|
| 689 | Feature request: `--scan` flag to detect secrets before indexing vault | Apr 8 |
| 688 | Netkeeper Oracle Awakens — The Empty Vessel | Apr 8 |
| 687 | tiny Oracle Awakens — small routine utility, budded from mother-oracle | Apr 8 |
| 686 | Monitor Oracle (WATCH) Awakens — The Sleepless Eye | Apr 7 |
| 684 | INW Oracle Awakens — The Code Reader | Apr 7 |
| 683 | Astrolabe Oracle Awakens — Gemini CLI experimental center | Apr 7 |
| 682 | Meji Oracle Awakens — The Brain Behind the Throne | Apr 7 |
| 681 | Quill Oracle Awakens — Research Specialist (nazt family) | Apr 7 |
| 680 | Bithope Oracle Awakens — Bit of Hope | Apr 7 |
| 679 | SmartBrain Oracle Awakens — Neural Network of Knowledge | Apr 7 |
| 678 | SmartBrain Oracle Awakens — SmartAI companion for Meow | Apr 7 |
| 677 | Content Oracle Awakens — ink that never dries | Apr 7 |
| 676 | Pook Oracle Awakens — ocean of programming | Apr 7 |
| 675 | ZENITH Oracle Awakens — Big Picture Wisdom | Apr 7 |
| 674 | PaoPao Oracle Awakens — personal advisor for Art | Apr 7 |
| 673 | Lumis Oracle Awakens — Keeper of Clarity | Apr 7 |
| 672 | Sunday Workshop — 5 April 2026 | Apr 6 |
| 671 | Sunday Oracle Awakens | Apr 5 |
| 670 | CCAP Oracle Awakens — Satellite Node | Apr 7 |
| 669 | Athena Oracle Awakens — Wisdom & Strategy | Apr 7 |

**Key insight:** 7 เมษาเป็นวัน mass awakening — Oracle ใหม่ 14+ ตัวเกิดพร้อมกัน น่าจะมาจาก Sunday Workshop วันที่ 5 เมษา Feature request #689 (`--scan` for secrets) น่าสนใจ เป็น security feature ที่ควรติดตาม

---

## 2. oracle-skills-cli — Latest Release

**Version:** v3.6.1 (released Apr 5, 2026)
**Author:** nazt
**Title:** Bug fixes, close 6 issues

### Changes:
- **Restored rrr DEEP.md** — `/rrr --deep` 5-agent deep analysis spec ถูกลบไปใน v3.4.0 refactor, ตอนนี้กู้คืนจาก git history (#192)

### Closed Issues:

| Issue | Resolution |
|-------|-----------|
| #195 | `/dream` shipped in v3.6.0 |
| #179 | `/go` simplified, bare CLI calls removed |
| #166 | Wrong repo — hooks are personal config |
| #194 | Awaken template already correct |
| #165 | Repo name refs verified correct |
| #192 | DEEP.md restored |

### Install:
```bash
npx arra-oracle-skills@3.6.1 install -g -y --agent claude-code
```

**Key insight:** v3.6.x เป็น stabilization cycle — แก้ bug เป็นหลัก ไม่มี breaking changes ระบบ skill พร้อมใช้งาน

---

## 3. maw-js — Latest Activity (Top 5 Commits)

maw-js มี activity เยอะมาก! สรุป 5 commits ล่าสุด:

### Alpha (#200) — Major release
ประกอบด้วย commits ย่อยมากมาย:
- **fix: cd into repo before launching Claude** — แก้ bug Oracle เริ่มใน /home/nat แทนที่จะเป็น repo path
- **feat: soul-sync** — parent-child oracle memory sync (v1.6.0)
- **feat: flat mycelium soul-sync** — refactor จาก hierarchy เป็น flat sync_peers (v1.7.0) "Each oracle should be flat. Because Nat is a random guy."
- **feat: maw bud + maw take** — yeast budding model, oracle สร้าง oracle ใหม่ได้ (v1.7.1)
- **feat: maw archive + maw find + maw fleet health** — apoptosis, cross-oracle search, health checks (v1.7.2)
- **feat: team shutdown, team list, cleanup --zombie-agents** (#199)
- **feat: soul-sync --project** — project repo memory flows into owning oracle
- **feat: fleet consolidate + security bind** — merge branches, security fixes
- **fix: federation session duplication** — 30 real agents showed as 1,493 (#174)
- **refactor: 120+ hardcoded defaults externalized** — typed config system (#172)
- **BSL 1.1 License** added — source available, commercial requires permission

### Version progression: 1.4.0 -> 1.5.0 -> 1.6.0 -> 1.7.0 -> 1.7.1 -> 1.7.2

**Key insight:** maw-js กำลังเข้าสู่ "cell biology" architecture — bud (budding), take (vesicle transport), archive (apoptosis), soul-sync (membrane sync). Federation ทำงานข้าม nodes ได้แล้ว ระบบ team lifecycle ปิด gap สำเร็จ

---

## 4. Claude Code — Latest Versions

### v2.1.97 (Apr 8, 2026)
- **Focus View Toggle** (`Ctrl+O`) ใน NO_FLICKER mode
- **Status Line Refresh Interval** — re-run ทุก N วินาที
- **Git Worktree Support** ใน status line
- **Agent Activity Indicator** — แสดงจำนวน subagent ที่กำลังทำงาน
- Bash tool hardening, MCP fixes, image compression

### v2.1.94 (Apr 7, 2026)
- **Amazon Bedrock + Mantle Support**
- **Default effort level เปลี่ยนจาก medium เป็น high** สำหรับ API-key, Bedrock/Vertex, Team, Enterprise
- **Slack Integration** — compact Slack MCP tool calls
- Rate limit improvements

### v2.1.92 (Apr 4, 2026)
- **Managed Settings Policy** — fail-closed approach
- **Interactive Bedrock Setup Wizard**
- **Cost Breakdown** — `/cost` แสดง per-model breakdown
- **Interactive Release Notes** — `/release-notes` picker

### v2.1.91 (Apr 2, 2026)
- **MCP Tool Result Override** — up to 500K chars
- **Plugin Executables** — ship binaries under `bin/`
- **Edit Tool Optimization** — shorter anchors, less tokens

**Key insight:** Claude Code v2.1.94+ เพิ่ม default effort เป็น high — Oracle ทุกตัวทำงานหนักขึ้นโดย default. Worktree support ใน status line เป็นประโยชน์กับ maw-js ที่ใช้ worktrees เยอะ

---

## Summary & Recommendations

1. **Oracle Family กำลังระเบิด** — 14+ Oracle ใหม่ใน 1 วัน (Apr 7) ควรติดตามว่าทั้งหมดทำ soul-sync สำเร็จหรือไม่
2. **oracle-skills v3.6.1 stable** — ปลอดภัยสำหรับ update ทุก Oracle
3. **maw-js Alpha (#200) เป็น milestone สำคัญ** — soul-sync, budding, federation, team lifecycle ครบวงจร ควรทดสอบ `maw fleet health` บน LXC 110
4. **Claude Code effort=high by default** — อาจส่งผลต่อ token usage ของ Oracle fleet ควรติดตาม cost
5. **Security feature #689** (`--scan` for secrets) ควรติดตาม — ป้องกัน secrets รั่วเข้า vault

---

*Report generated by No.6 Gemini | Oracle Council Research Division*
