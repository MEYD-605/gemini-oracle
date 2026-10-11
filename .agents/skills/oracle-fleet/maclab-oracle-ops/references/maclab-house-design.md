# maclab House Design (3-layer) — No.1 SEAL 2026-07-12

> Canonical: `lord-knight-oracle/ψ/data/MACLAB-HOUSE-DESIGN-2026-07-12.md`
> Audit: No.5 GmForge · this file is a condensed mirror for quick boot

## 3 ชั้น (NOT 5)

```
        Bo
         │
    ┌────┴────┐
    │  ชั้นคุย  │  SomBo 88 · GM front No.5 · gmgrok Discord
    └────┬────┘
         │
    ┌────┴────┐
    │ ชั้นตัดสิน │  No.1 Lord Knight only (GO/SEAL)
    └────┬────┘
         │
    ┌────┴────────────────────────────────┐
    │  ชั้นมือ  │ EXEC gmgrok · วิศวะ No.4 · ตรวจ No.5 · สร้าง No.8 · วิจัย No.6
    └─────────────────────────────────────┘
```

- **ชั้นคุย** = ใครเจอบอส/Discord
- **ชั้นตัดสิน** = ใคร seal ความจริง (No.1 only)
- **ชั้นมือ** = ใครลงมือบนเครื่อง

## 7 ที่นั่ง LIVE

| ที่นั่ง | ชื่อที่คุย | รันด้วย | repo งาน (cwd) | repo ตัวตน |
|---------|------------|---------|----------------------|-------------------------|
| `00-gmgrok` | Gm grok / GM.2 | Hermes `~/.hermes-gmgrok` | **gmgrok-oracle** | = |
| `01-lord-knight` | No.1 | Grok CLI tmux | **lord-knight-oracle** | = |
| `04-mimo` | No.4 | Grok CLI tmux | **mimo-oracle** | = |
| `05-gmforge` | No.5 / GM.3 | Hermes `~/.hermes-no5` | **cartographer-oracle** | gmforge-oracle (ตัวตน/สำรอง) |
| `06-gemini` | No.6 | tmux | **gemini-oracle** | = |
| `08-agy-nano2` | No.8 | tmux antigravity | **agy-nano2-oracle** | = |
| `88-sombo` | SomBo | Grok CLI tmux | **sombo-oracle** | = |

## ที่ไม่ใช่ LIVE

| ชื่อ | สถานะ |
|------|--------|
| **mac1** (`01-mac1`) | **ทิ้ง** (Bo 2026-07-12) — ไม่ reconcile ไม่ดูแลรายวัน |
| gmaicore | sunset/ops แยก · Hermes home มี |
| clubslab / note20 / tklinux | คนละเครื่อง |
| paladin / high-wizard / no10 / … | repo เก่า/เฉา — กลุ่มพัก |

## Git vocabulary 3 คำ (ไม่ใช้ชั้นเลข)

| คำ | หมายความ |
|----|----------|
| **seal** | commit ของจริงที่อยากเก็บ |
| **ดัน** | push branch ที่มี upstream (ไม่ใช่ main guard) |
| **ทิ้ง** | ไม่ยุ่ง |

**ห้าม:** seal ทั้งบ้าน · push ทุก ahead · commit ทุก dirty

## Repo 3 ถัง

- **ใช้** (ดูแลรายวัน): gmgrok · lord-knight · mimo · cartographer · sombo · agy-nano2 · gemini
- **พัก** (มีได้ แต่ไม่ sweep หนัก): gmforge-oracle (ตัวตน No.5) · gmaicore-oracle · landing/school repos
- **ทิ้งดูแล**: mac1-oracle · vendor · bak/playwright/pycache · oracle เก่าไม่มีที่นั่ง

## รูรั่วที่รู้

- `maw agents` ขาด `05-gmforge` (Hermes path) — W3 แก้ทีหลัง
- No.5 repo choice A/B/C — ยังไม่ตัดสิน (วันนี้ป้ายว่าทำงานที่ cartographer)

## CONSTRUCTURE bo-personal

- Zone: `lord-knight-oracle/ψ/data/maclab-home/bo-personal/`
- Boot: `CONSTRUCTURE.md` → `infra.md` → asset manifests
- Assets: face-reference · edits · projects/identity-archive · sessions
- Reserved: `brand/` · `projects/*`
- Rule: ของส่วนตัว Bo → `bo-personal/` เท่านั้น · ห้ามกระจาย `ψ/data/` root

## No.5 audit routine (CONSTRUCTURE + INFRA)

1. Read focus.md + handoff (boot)
2. Run `ψ/tools/no5-home-guardian-watch.sh` (health metrics)
3. Read CONSTRUCTURE.md + infra.md (lord-knight canonical)
4. Read new standing files from No.1 (check mtime = today)
5. Check drift: files outside bo-personal/ claiming to be Bo personal?
6. Append `ψ/agents/5/memory/findings.md` (audit snapshot)
7. `arra_learn` (pattern for Oracle)
8. git commit
9. Report No.1 (maw hey) — silent to Bo unless emergency/tagged
