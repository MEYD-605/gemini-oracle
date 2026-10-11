# Claude Multi-Account & Personal RAG Migration Guide

## 1. Claude Multi-Account Directories (`.claude-acc-*`)
When migrating Claude CLI agents (e.g. SomBo `88-sombo`) or historical session stores from host to host (e.g. `ai-core` → `black` or `maclab`):
- `/root/.claude/` is often just the default profile or a fresh stub.
- Historical sessions, project histories, memory files, and Discord channel logs are often stored in account-specific directories like `/root/.claude-acc-2/` or `/root/.claude-active/`.
- Always check `ls -d /root/.claude*` on the source host.

## 2. Personal RAG Archives & Locations
Bo's personal RAG profiles, sovereign timelines, and personal memory stores:
- **Canonical local archive path:** `ψ/data/maclab-home/bo-personal/`
- **Identity & RAG files:**
  - `personal-rag-master-bo.md`
  - `WHO_IS_MASTER_BO.md`
  - `MASTER_BOW_SOVEREIGN_TIMELINE.md`
  - `PERSONAL_RAG_PROFILE__โบ_(บร๊ะโบ)_-_The_Digital_Ar_*.md`
- **Historical Session Archives:**
  - `~/.claude/projects-archive-ai-core/` (staged `.jsonl` session files and memory)
  - `~/.claude/channels-archive-ai-core/discord-no1/` (Discord DM archives from `ai-core`)

## 3. Verification Protocol
1. Verify document presence and file sizes across source and target hosts (`du -sh`, `wc -c`).
2. Ferry both the active `.jsonl` session files and the `memory/` subdirectories.
3. Perform path-rewriting (`sed -i`) for `"cwd"` references inside `.jsonl` files if target home directory changed (e.g., `/root/` → `/home/meyd/`).
