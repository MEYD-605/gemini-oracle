# /forward vs Hermes Discord continuity (No.5)

Bo often expects: **「forward แล้วนายต้องจำได้」**

## What /forward actually seals

1. **`ψ/inbox/handoff/YYYY-MM-DD_HH-MM_*.md`** — canonical boot artifact
2. **`ψ/focus.md`** — `HANDOFF:` pointer + STATE/TASK
3. **`bash ψ/tools/gmforge-session-end.sh`** (cartographer) — session-end marker

**Boot next time:** `read_file ψ/focus.md` → read handoff path in focus (not an older `ψ/handoff.md` stub if focus is newer).

## What forward does *not* do

- Does **not** wipe or replace the **active Discord session** — same `session_id` until Bo sends **`/new`** alone.
- Does **not** auto-write a new handoff if `/forward` ran in-thread but **session-end** failed — newest file in `ψ/inbox/handoff/` may be older than the last DM topic; use **`session_search`** + `LIVING-DOCS/` for gap.

## Agent reply when Bo challenges memory

Keep **≤3 sentences**:

1. State **handoff file** path from `ψ/focus.md`
2. State whether **same DM session** (compaction/thread) still carries the last topic
3. Offer **one** fix if mismatch: update `focus` + new handoff, or Bo `/new` + `/recap`

Do not re-teach the full memory stack unless Bo asks.