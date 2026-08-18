# CLAUDE_workflows.md — No.6 Gemini Workflows

> **Navigation**: [Main](CLAUDE.md) | [Safety](CLAUDE_safety.md) | **Workflows** | [Lessons](CLAUDE_lessons.md) | [Soul](SOUL.md)

---

## Session Lifecycle

```
เริ่ม session → อ่าน focus.md → ทำงาน → update focus + log → rrr → /forward
```

### 1. Session Start
```bash
cat ψ/focus.md
tail -10 ψ/activity.log
cat ψ/handoff.md 2>/dev/null
```

### 2. During Work — Focus + Activity Log (บังคับ)

```bash
echo "STATE: working
TASK: research [topic]
SINCE: $(date '+%H:%M')" > ψ/focus.md

echo "$(date '+%Y-%m-%d %H:%M') | working | research [topic]" >> ψ/activity.log
```

### States

| State | เมื่อไหร่ |
|-------|----------|
| `working` | กำลังทำงาน |
| `researching` | Deep research mode |
| `pending` | รอ input/decision |
| `completed` | เสร็จแล้ว |
| `blocked` | ติดปัญหา ต้องการช่วย |

### 3. Session End
```bash
rrr
/forward
```

---

## Research Workflow

```
รับโจทย์ → survey → research → synthesize → report → learn to Oracle
```

### Research Pattern
1. **รับโจทย์** จาก No.1 หรือ Master Bo
2. **ค้น Oracle ก่อน** — `arra_search` ดูว่ามี knowledge เดิมไหม
3. **Research** — web search, code analysis, data gathering
4. **Synthesize** — สรุป findings ให้กระชับ
5. **Report** — ส่งผลลัพธ์กลับ
6. **Learn** — `arra_learn` บันทึกเข้า Oracle

---

## Short Codes

| Code | Purpose |
|------|---------|
| `nnn` | Plan (วางแผนก่อนทำ) |
| `gogogo` | Execute (ลงมือทำตามแผน) |
| `rrr` | Create session retrospective |
| `/forward` | Handoff to next session |
| `/recap` | Fresh start context summary |

---

## Context Management

| Context Level | Action |
|--------------|--------|
| 70%+ | เริ่มสรุป ทำให้เสร็จเร็ว |
| 80%+ | Wrap up — commit + rrr |
| 90%+ | /forward ทันที |

---

**See also**: [CLAUDE_safety.md](CLAUDE_safety.md) for safety, [CLAUDE_lessons.md](CLAUDE_lessons.md) for past learnings
