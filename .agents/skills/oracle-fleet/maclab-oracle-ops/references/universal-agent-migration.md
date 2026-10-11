# Universal Agent Migration Protocol (Ferrying & Path Rewriting)

## Context & Objectives
When migrating AI agent sessions (Hermes, Claude CLI, Antigravity) across Linux nodes (e.g. from `white` / `ai-core` to `black`), naive directory copies break SQLite DB locks, uncommitted session paths, and `.jsonl` working directory references.

## Key Principles of Full-Context Migration
1. **User-per-Agent Isolation:** Each agent runs under its own OS user (e.g. `black`, `golf`, `noah-oracle`, `meyd`) with `mode 700` home directory restrictions.
2. **High-Speed Rsync Ferrying:** Synchronize Git repositories and `.claude/projects` or `.hermes` state using `ionice -c3 rsync -a`.
3. **Automated Directory Renaming:** Convert directory encodings (e.g. `-opt-Code-` -> `-home-target-Code-`).
4. **In-File Deep Path Rewriting:** Execute `sed -i` across all `.jsonl` session files to rewrite `"cwd"` and file paths from the old root to the new root.
5. **Ownership & Permission Normalization:** `chown -R <target_user>:<target_user>` across all target home subdirectories.
