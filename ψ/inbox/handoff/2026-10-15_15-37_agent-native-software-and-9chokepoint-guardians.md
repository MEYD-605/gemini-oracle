# Handoff: Agent-Native Software & 9 Chokepoint Guardians Roadmap

📡 SESSION: 9_5bf4ed | ตรวจสอบมาตรฐาน VM Grok | msgs=290 | ag/gemini-4-argon-medium
**Date**: 2026-10-15 15:37 (+07:00)
**Context**: 72%
**Node**: iMac Pro maclab (100.83.0.1) · [maclab:04-mimo]

## Context
**Oracle**: No.4 MIMO · **Human**: Master Bo (`borde9902` / `Meyd-605`)
**Mode**: Strategic Architecture & Fleet Operations · **Memory**: HAOS Arra (:8099, :3939) + ClubSGame WAL

## What We Did
- **Grok VM Timezone Hardening**:
  - Investigated timestamp confusion on Grok VM (`100.70.26.108`); host clock is UTC+7, but Claude CLI subshells lacked `TZ="Asia/Bangkok"`.
  - Patched `/workspace/*/start-*.sh` across all 5 seats (`golf-vm`, `gmboom`, `gmatom`, `gmbm`, `gmguinness`).
  - Added `"TZ": "Asia/Bangkok"` to `~/.claude-<seat>/settings.json` and set live tmux environment.
  - Injected explicit Timezone & Date Reality Check rule into `CLAUDE.md` of each seat.
- **Agent-Native Paradigm Clarification**:
  - Compared legacy automation (TouchDesigner `twozero.tox` port :40404, Figma REST API, Computer Use UI clicks) with next-generation **Agent-Native Software** (pure Rust `*Craft Suite` by Storytold: `LightCraft`, `FilmCraft`, `GridCraft`, `CADCraft`).
  - Explained key architectural differentiators: 100% typed JSON command bus, headless sub-millisecond execution, zero GUI bloat (10-50MB RAM), and closed-loop vision verification.
- **Substrate Architecture (9router, 9remote, Grok Bot)**:
  - Deep-dived into why `9router` (wire transformation, key fallback, semantic cache) and `9remote` (PTY socket daemon, zero-human-setup QR, process persistence) are deeper substrate layers than top-level apps.
  - Analyzed why deploying `9remote` + Agent-First tools (`GridCraft`, `WordCraft`) for office staff (P'Kong) is far superior and more durable than fragile prompt skills.
  - Classified Grok Bot as an autonomous cloud runtime substrate with protocol spoofing (`Grok Lifeline` keeping VMs awake).
- **9 Chokepoint Guardians Tooling Blueprint**:
  - Mapped specific headless/Rust tools needed across all 9 chokepoint layers (`g01`–`g09`).
  - Singled out **G1 (Wire Layer) Prompt Compression & Semantic Wire Cache** as the highest priority to eliminate redundant system prompts/tool schemas and cut token burn by 30-50%.
  - Re-affirmed that Guardian agents are required alongside config/tools to provide adaptive judgment and autonomous recovery.

## Pending
- [ ] Implement G1 Wire Guardian: Build Prompt Compression Daemon to prune whitespace, redundant tool schemas, and repetitive system prompts before 9router
- [ ] Implement Wire Semantic Cache on MacLab local RAM for repeated cron/health check queries
- [ ] Set up scheduled auto-runner for `poteto-harness.py` to ingest 9 Guardian health traces into ClubSGame SQLite WAL (`E:\Agents\poteto-wal\poteto-traces.db`)
- [ ] Deploy and verify `FilmCraft-CLI` and `GridCraft` headless packages on MacLab / ClubSGame

## Next Session
- [ ] Build prototype AST/token pruner proxy in front of 9router (:20128)
- [ ] Test token savings on Claude CLI and Hermes agent message payloads
- [ ] Review G1 Guardian probe definitions in `poteto-harness.py`

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/tools/poteto-harness.py`: Poteto Harness with 9 Chokepoint Guardians
- `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/tools/clubsgame-wal-ingest.py`: ClubSGame WAL ingest script
- `/Users/admin/.9router/`: 9router configuration and routing substrate
- `/workspace/*/start-*.sh` (on `grokbot`): Patched timezone startup scripts for all 5 seats
