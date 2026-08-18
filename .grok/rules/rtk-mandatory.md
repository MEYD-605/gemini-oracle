# RTK Mandatory — 06-gemini maclab

> Bo สั่ง 2026-06-23: บังคับใช้ rtk — ไม่มีข้อยกเว้นนอกจาก listed below

## Default: RTK first
ก่อนรัน Shell ที่มี output เข้า context → ใช้ `rtk <cmd>` เสมอ

| แทนที่ | ใช้ |
|--------|-----|
| `ls` / `ls -la` | `rtk ls` |
| `cat` / `head` / `tail` | `rtk read <file>` |
| `tree` | `rtk tree` |
| `git status/log/diff` | `rtk git …` |
| `gh` | `rtk gh …` |
| `psql` | `rtk psql …` |
| `grep` (output ใหญ่) | `rtk grep …` |
| `find` | `rtk find …` |
| `diff` | `rtk diff …` |

## Read/Grep tools
- ไฟล์ใหญ่ / log / repo scan → **Shell + `rtk read`** แทน Read tool
- search ใน repo ที่ output ยาว → **`rtk grep`** แทน Grep tool
- Read tool เฉพาะไฟล์เล็ก (<~80 บรรทัด) หรือ SKILL.md / config สั้นๆ

## ข้อยกเว้น (ไม่ต้อง rtk)
- `maw`, `ssh` one-liner verify, `curl -s … | head -c N` (health check)
- interactive / TTY commands
- `rtk gain` / `rtk --version` (meta)

## Session hygiene
- Boot: `rtk read ψ/focus.md` แทน `cat`
- ctx ≥75% → `/forward` · ≥90% → `/new` (autoctx)
- ท้ายงานยาว: `rtk gain` รายงาน savings ถ้า Bo ถาม perf/ctx

## Audit
Session ที่ Shell >20 ครั้งแต่ rtk <10% → ถือว่าละเมิด rule นี้