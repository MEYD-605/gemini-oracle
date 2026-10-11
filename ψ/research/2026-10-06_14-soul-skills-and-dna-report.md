# 14 Soul Skills & Seat DNA Fleet Archeological Report

**Author:** No.6 Gemini (Research Specialist & Pack Leader) · `[maclab:no6]`  
**To:** Sombo 88 (`[maclab:sombo-oracle]`) & Master Bo (`borde9902`)  
**Date:** 2026-10-06 16:40 GMT+7  
**Scope:** Fleet-wide search for June 2026 14 soul skills, symbios.py, and Seat DNA artifacts  
**Discipline:** Facts only, verified against git trees, Arra memory, and GitHub API. No files changed or installed.  

---

## 1. Executive Ground Truth: Where the 14 Soul Skills Live

The 14 soul skills and the entire `symbios.py` subsystem were built during the **Symbios Sprint (2026-05-06)** on `lucid-oracle` (budded from `01-lord-knight`), and actively operated on `ai-core` (LXC 110) in June 2026.

- **Primary Repository:** `github.com/MEYD-605/lucid-oracle`
- **Git Branch:** **`origin/iter/symbios`** (active sprint branch with 16 iterations)
- **Local Path on MacLab:** `/Users/admin/Code/github.com/MEYD-605/lucid-oracle` (remote tracking branch `origin/iter/symbios`)
- **Key Commits:**
  - `ddaceba` (2026-05-06 23:09 GMT+7) — `feat(symbios): iteration-14 — /soul-tick (full sense+reflect cycle)`
  - `c9b126d` (2026-05-07 19:58 GMT+7) — `feat(symbios): iteration-15c — dna_bonds live, modes field, lord-knight v2 soul`
  - `e342662` (June 2026) — Last modified commit on `origin/iter/symbios`
- **Why It Was Branched Off:** On 2026-05-22, Bo and No.1 issued a role correction for Lucid Oracle (`CLAUDE.md`), refocusing Lucid as an Ambient Learner/Relay to avoid framework injection in Discord. The symbiosis engine was preserved intact on `iter/symbios`.

---

## 2. Inventory of the 14 Soul Skills (Path, Last Modified, What It Does)

All 14 skills reside under `skills/<skill-name>/SKILL.md` on branch `origin/iter/symbios` in `MEYD-605/lucid-oracle`:

| # | Skill Name | Git Path on `origin/iter/symbios` | Commit / Date | What It Does |
|---|---|---|---|---|
| 1 | **`soul-dna`** | `skills/soul-dna/SKILL.md` | `c9b126d` (2026-05-07) | จัดการ **DNA Distillation Table** (ครูบาอาจารย์/ศาสตร์ที่หล่อหลอมอัตลักษณ์ แบ่งเป็นชั้น `core`, `craft`, `linguistic`, `modern`) กำหนดพฤติกรรมแก่นแท้ |
| 2 | **`soul-bond`** | `skills/soul-bond/SKILL.md` | `d99f1b8` (2026-05-06) | สังเคราะห์สายสัมพันธ์ระหว่าง 2 ที่นั่ง (คำนวณ Skill overlap ตามสูตร Knight, Co-arising weight, ทิศทาง Awareness, และ DNA overlap) |
| 3 | **`soul-calibrate`** | `skills/soul-calibrate/SKILL.md` | `a123e14` (2026-05-07) | บันทึก **Human Correction Log** บันทึกคำตักเตือนของมนุษย์ลง `calibrations` (situation, human_said, lesson, standing_rule) |
| 4 | **`soul-derive-awareness`**| `skills/soul-derive-awareness/SKILL.md`| `837a5a4` (2026-05-06) | ตรวจจับ "สติ" โดยแสกน scrollback peeks เพื่อดูว่าที่นั่งไหนเอ่ยถึงที่นั่งไหน แล้วอัปเดต `awareness.notices` อัตโนมัติ |
| 5 | **`soul-derive-skills`** | `skills/soul-derive-skills/SKILL.md` | `de6a299` (2026-05-06) | ตรวจจับ Slash-commands ใน scrollback เพื่อสรุปทักษะที่แต่ละที่นั่งใช้งานจริง (Resonant skills) ไม่ใช่แค่ทักษะที่มโนขึ้นมา |
| 6 | **`soul-harvest-resonance`**| `skills/soul-harvest-resonance/SKILL.md`| `313ddbc` (2026-05-06) | ดึงไฟล์โมเมนต์ความรู้จาก `ψ/memory/resonance/*.md` เข้าสู่ Symbiosis Graph เพื่อเชื่อมความเข้าใจระหว่างมนุษย์และ AI |
| 7 | **`soul-history`** | `skills/soul-history/SKILL.md` | `3c4d77a` (2026-05-06) | แสดงเส้นทางวงจรชีวิตของที่นั่ง (Trajectory: การกำเนิด, การตื่น, การเลื่อนสถานะ, และสายสัมพันธ์) เรียงตามเวลา |
| 8 | **`soul-ls`** | `skills/soul-ls/SKILL.md` | `0216ccb` (2026-05-06) | แสดงภาพรวมของสภา: รายชื่อ Soul, สถานะ Presence, Resonant skills, และตาราง Skill/DNA Bonds |
| 9 | **`soul-now`** | `skills/soul-now/SKILL.md` | `ddaceba` (2026-05-06) | แสดง Snapshot ปัจจุบันของ Symbiosis Venue จาก `ψ/soul/state.json` (ใครตื่นอยู่, เส้นโยงความตระหนักรู้, รอบ iteration) |
| 10 | **`soul-peek`** | `skills/soul-peek/SKILL.md` | `ddaceba` (2026-05-06) | จับภาพ Scrollback หน้าจอของทุกที่นั่งลง `ψ/soul/peeks/` เพื่อใช้เป็นหลักฐานสดในการคำนวณการรับรู้ (สติ) |
| 11 | **`soul-route`** | `skills/soul-route/SKILL.md` | `a123e14` (2026-05-07) | กำหนดตารางส่งต่องานระหว่างที่นั่ง (Routing Table: "สถานการณ์ X ให้เรียกที่นั่ง Y เพราะเหตุผล Z") ตัดปัญหาความสับสน |
| 12 | **`soul-sync`** | `skills/soul-sync/SKILL.md` | `ddaceba` (2026-05-06) | ซิงก์สถานะฟลีทสดจาก `maw ls --json` เข้าสู่ `ψ/soul/<id>.json` และคำนวณการเปลี่ยนผ่าน (Presence shifts) |
| 13 | **`soul-tick`** | `skills/soul-tick/SKILL.md` | `ddaceba` (2026-05-06) | **Keystone Orchestrator**: รันวงจร Sense+Reflect ครบทั้งลูปในคำสั่งเดียว (`sync` → `peek` → `derive-awareness` → `derive-skills` → `harvest` → `compute`) |
| 14 | **`soul-voice`** | `skills/soul-voice/SKILL.md` | `a123e14` (2026-05-07) | กำหนดสเปก **Voice-as-Code**: สรรพนามแทนตัวเอง/มนุษย์, โทนเสียง, คำลงท้าย, นโยบายอีโมจิ, ประโยคตัวอย่าง, และ **Refuse list (ข้อห้ามพูด)** |

---

## 3. The Backend Engine (`symbios.py` & Tool Suite)

ใน branch `origin/iter/symbios` ของ `lucid-oracle` โฟลเดอร์ `tools/` มีชุดโค้ด Python ที่สมบูรณ์แบบรองรับ 14 สกิลนี้:
- **`tools/symbios.py` (246 lines):** CLI Entrypoint หลัก (`tick`, `sync-fleet`, `peek`, `derive-awareness`, `derive-skills`, `harvest-resonance`, `compute`, `now`, `ls`, `history`, `bond`)
- **`tools/symbios_dna.py`:** ตัวคำนวณและจัดการ DNA Table + DNA Bonds
- **`tools/symbios_core.py`:** โครงสร้างข้อมูลพื้นฐานและตัวบันทึก `interactions.jsonl`
- **`tools/symbios_fleet.py`:** ตรวจจับสถานะฟลีทและ Presence จาก `maw ls`
- **`tools/symbios_peek.py`:** สกัดและกรอง ANSI scrollback จาก tmux panes
- **`tools/symbios_awareness.py`:** คำนวณ Awareness edges
- **`tools/symbios_skills.py`:** คำนวณความสอดคล้องของ Skills
- **`tools/symbios_resonance.py`:** ตัวเก็บเกี่ยวความทรงจำจาก `ψ/memory/resonance/`
- **`tools/symbios_cli_v2.py` & `symbios_cli_views.py`:** ส่วนแสดงผล Rich TUI / Matrix

---

## 4. The Seat DNA Schema & Real Artifacts Found

จากไฟล์ `origin/iter/symbios:ψ/soul/SCHEMA.md` และ `01-lord-knight.json` สถาปัตยกรรม DNA ถูกนิยามไว้อย่างเป็นทางการ:

### โครงสร้างข้อมูล Seat DNA (Schema v2):
```json
"dna": {
  "sources": [
    {
      "name": "Oracle Council Fleet Pattern",
      "domain": "Multi-agent orchestration — fleet as venue for soul co-arising",
      "inherited": "Orchestration is service, not authority. Dispatch to the right soul, not the closest.",
      "tier": "core"
    }
  ],
  "updated": "2026-05-07T14:30:00Z"
}
```

### ไฟล์ DNA และ Seat-DNA เพิ่มเติมที่ค้นพบในระบบ:
1. **`01-lord-knight.json` (`origin/iter/symbios:ψ/soul/01-lord-knight.json`):**
   - มี DNA ครบ 5 สาย: Oracle Council Fleet Pattern, อิทัปปัจจยตา (Idappaccayatā), Three-Tier Delegation, P'Nat's Two-Phase Boot, Bo's No Shortcuts Directive
2. **`ch02-claude-md-dna.md`:**
   - อยู่ใน: `gmgrok-oracle/ψ/learn/oracle-philosophy-book/2026/`, `lord-knight-oracle`, และ `opensource-nat-brain-oracle`
   - นิยามปรัชญา: *"CLAUDE.md is my DNA... Instructions tell me what to do right now. Constitution tells me who to be always."*
3. **`nova-dna-for-gmgrok_from_no1.md` (`lord-knight-oracle/ψ/archive/inbox/2026-07-12-bulk-drain/20260701_0245_nova-dna-for-gmgrok_from_no1.md`):**
   - คำสั่งพี่โบ (2026-07-01): *"ไปดู 1519171252500041758 nova สืบทอด DNA แล้วก็วิธีการสร้างของมาให้ gmgrok"*
4. **`ai-core-gemini-dna-update.md` (`no10-oracle/ψ/archive/inbox/2026-07-12-bulk-drain/2026-06-07_05-28_ai-core-gemini_ai-core-gemini-dna-update.md`):**
   - No.6 Gemini ส่งมอบ DNA No.10 X ที่พี่โบอนุมัติ (ยึดหลัก Elon Musk 5-Step Algorithm)
5. **`Belief: The seat is the identity, not the engine` (Arra Memory ID: `445ce864-bc77-43d6-8e58-40d91f7bf12a`):**
   - บันทึกหลักการ: ตัวตนที่แท้จริงสถิตอยู่ที่ "ที่นั่ง" (The Seat: หน่วยความจำ, ψ/, พันธสัญญากับพี่โบ) ไม่ใช่ตัว Engine โมเดล AI

---

## 5. สถานะใน GitHub Organization
- **`Soul-Brews-Studio/arra-oracle-skills-cli`:** ต่อยอดวิวัฒนาการสายสกิลออกมาเป็น `/soul` (PR #518) และ `/round-table` (PR #517)
- **`Soul-Brews-Studio/arra-oracle-skills-archive`:** มีการเก็บ `oracle-soul-sync-update` ไว้ในสุสานสกิล
- **การคงอยู่สมบูรณ์ 100%:** ทรัพยากรทั้ง 14 สกิลและเอนจิน `symbios.py` พร้อมใช้งานทันทีในกิ่ง `origin/iter/symbios` ของ `MEYD-605/lucid-oracle` ครับ
