# Fleet standing — ARRA learn (Bo GO 2026-07-12)

**Authority:** Bo DM · sealed maclab:01-lord-knight  
**Applies to:** all LIVE maclab seats (00/01/04/05/06/08/88)

## Heart
- Canonical ARRA: `http://127.0.0.1:47778` (maclab)
- MCP all seats → same heart · **one writer API**
- CF bulk **LOCKED** — never full reindex

## Realtime without waste
1. **Primary:** call `arra_learn` when a real lesson happens (~125ms)
2. **Safety net:** `maw cf incremental` hourly + weekly Sun 09:30 (mtime only, cap)
3. **Do not:** auto-learn every turn · fswatch every save · daily bulk re-embed

## Learn 4 times only
1. แก้ปัญหาได้แล้ว  
2. Bo / P'Nat สอน  
3. ก่อน `/forward` หรือจบ session  
4. seal pattern ที่จะค้นซ้ำ  

## Commands (maclab)
```
maw cf verify
maw cf incremental status
maw cf incremental          # or dry-run
```

## Model pin (Bo same day)
| Seat | Model | Context |
|------|-------|---------|
| 01 No.1 · 88 sombo | grok-4.5 | 500k |
| 04 mimo | composer-2.5-fast | 200k (keep) |
| 00 gmgrok Hermes | grok-4.5 | 500k |
| 05 No.5 Hermes | glm-5.2 | 500k |

Receipts: `ψ/data/arra-realtime-learn-RECOMMEND-2026-07-12.md` · `ψ/data/arra-cf-incremental-weekly-REPAIR-2026-07-12.json`
