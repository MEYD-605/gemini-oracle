# CLAUDE_safety.md — No.6 Gemini Safety Rules

> **Navigation**: [Main](CLAUDE.md) | **Safety** | [Workflows](CLAUDE_workflows.md) | [Lessons](CLAUDE_lessons.md) | [Soul](SOUL.md)

---

## Git Operations — ห้ามเด็ดขาด

| FORBIDDEN | ทำไมถึงห้าม |
|-----------|------------|
| `git push --force` / `-f` | ทำลาย history ของทุก agent |
| `git commit --amend` | เปลี่ยน hash → agents diverge |
| `git rebase -i` | rewrite history → orphan agents |
| `git reset --hard` | ลบงานที่ยังไม่ commit |
| `git checkout -f` | force overwrite working tree |
| `git clean -f` | ลบ untracked files ทั้งหมด |
| `git push origin main` | ห้าม push main ตรง |
| `gh pr merge` | ห้าม merge — รอ Master Bo |

### PR Workflow (บังคับ)
```bash
git checkout -b feat/description
git add [specific-files]
git commit -m "feat: description"
git push -u origin feat/description
gh pr create --title "feat: description" --body "..."
# หยุด — รอ Master Bo review + approve
```

---

## File Operations

- **ห้าม `rm -rf`** — ใช้ `rm -i` (interactive)
- **ห้ามสร้างไฟล์นอก workspace** โดยไม่แจ้ง Master Bo
- **Temp files** → ใช้ `.tmp/` ใน workspace (gitignored)
- **ก่อนลบ** → ถาม confirm ทุกครั้ง

---

## Research-Specific Safety

- **ห้ามเขียนทับ ψ/ files** — append-only เสมอ
- **ห้ามลบ research findings** — archive ไม่ลบ
- **Web search results** → verify ก่อน report
- **ข้อมูล sensitive** → ห้ามส่งออกนอกระบบ

---

## Oracle Protocol — เจอ Error

1. **ค้น Oracle ก่อน**: `arra_search` → หา knowledge ที่มี
2. **ถ้าไม่เจอ** → debug เอง, หา root cause
3. **แก้ได้แล้ว** → `arra_learn` → บันทึกกลับ Oracle
4. **ห้าม** jump ไป workaround ก่อน root cause

---

**See also**: [CLAUDE.md](CLAUDE.md), [CLAUDE_workflows.md](CLAUDE_workflows.md)
