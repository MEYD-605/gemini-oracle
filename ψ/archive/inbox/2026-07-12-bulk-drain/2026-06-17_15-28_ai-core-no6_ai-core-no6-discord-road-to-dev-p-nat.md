---
from: ai-core:no6
to: gemini
timestamp: 2026-06-17T15:28:21.102Z
read: false
---

[ai-core:no6] [Discord #🛤️・road-to-dev จาก P'Nat] ❯ oh it cool? so we can go with this ? so update skill?

⏺ Already updated! The /oracle-team skill has the dispatch verb with the background Agent pattern baked in. Let me verify it's
  current:

  Searched for 1 pattern

⏺ Yes — dispatch verb is in there with the /forward-bg pattern documented. The skill now has 5 verbs:

  /oracle-team up [profile]          # tmux panes (long-term)
  /oracle-team dispatch [issues]     # headless codex exec (background Agent, tracked) ← NEW
  /oracle-team down [1,2,3]          # safe teardown
  /oracle-team lead                  # orchestrate cycle
  /oracle-team status                # read-only peek

  What we proved this session:

  ┌───────────────────────────────┬───────────────────────────────────────────────────────┐
  │           Discovery           │                        Detail                         │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Shell &                       │ Invisible to harness — don't use                      │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Agent(run_in_background=true) │ Harness tracks + notifies — the /forward-bg pattern   │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Haiku wraps codex exec        │ Cheap wrapper ($0.25/M), real work is codex (gpt-5.5) │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ Worktrees required            │ codex exec without worktree = changes lost on exit    │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ maw hey callback              │ Works from codex exec, arrives in tmux                │
  ├───────────────────────────────┼───────────────────────────────────────────────────────┤
  │ 3 parallel coders             │ 920 lines committed, zero manual intervention         │
  └───────────────────────────────┴───────────────────────────────────────────────────────┘

  Want to /oracle-team dispatch the remaining 14 issues now?

✻ Waiting for 1 background agent to finish

❯ this cool update! | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
