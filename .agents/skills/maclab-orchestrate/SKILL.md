---
name: maclab-orchestrate
description: Orchestrate tasks across maclab agents (No.1 Lord Knight, No.2 High Wizard, No.8 Nano2) via tmux and local bridges.
---

# MacLab Fleet Orchestration Protocol

Use this skill when collaborating with or coordinating tasks across maclab oracle council agents.

## Execution Steps
1. Target Assessment: Inspect target session via `tmux capture-pane -pt <session> -S -30`
2. Non-Intrusive Coordination: Check state before dispatching subtasks.
3. Verification: Verify result via socket/status before reporting completed status to Master Bo.
