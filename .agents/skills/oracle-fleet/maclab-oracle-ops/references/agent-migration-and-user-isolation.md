# Agent Migration & User-per-Agent Isolation Protocol

## User-per-Agent Isolation Architecture (Black Machine Pattern)
- **Dedicated OS Users**: Each agent gets a dedicated Linux OS user (UID >= 1000) with `chmod 700` home directory `/home/<agent>`.
- **Isolation Scope**: SQLite DB locks, credentials, PID states, and `.claude`/`.hermes` home directories are isolated per user. Prevents cross-agent DB corruption and token leaks.
- **Coordination**: Inter-agent communication happens via `oracle-gang` GID and MAW Bus (`maw-rs` / `maw hey`), not direct cross-user filesystem reads.

## High-Speed Agent Migration & Path Rewriting Workflow
When migrating an agent (Claude CLI, Hermes, etc.) to a new host or dedicated workspace:
1. **Sync Files**: Use `rsync` to transfer Git repos (`~/Code`) and session histories (`.claude/projects` or `.hermes/sessions`).
2. **Directory Rename**: Rename project directories in session stores to match the target host's absolute path (e.g. `-root-Code-...` -> `-home-meyd-agents-no1-Code-...`).
3. **Deep Path Rewriting inside Session Files**:
   Run `sed` across all `.jsonl`, `.json`, `.yaml`, `.md` files in the project store:
   `find <project_dir> -type f -name '*.jsonl' -exec sed -i 's|<old_abs_path>|<new_abs_path>|g' {} +`
   *Crucial*: This enables seamless `/resume` and full context restoration without broken path references.
4. **SQLite Recovery**: If copying an active SQLite `state.db` causes `malformed database` errors on startup, remove the malformed `.db`, `.db-shm`, `.db-wal` files to allow clean schema recreation.
5. **Provider & Gateway Configuration**:
   - Check if local proxies (like 9router) exist on target host. If not, switch `config.yaml` to direct API providers (e.g. `provider: zai` with `glm-5.2`).
   - Stop/kill conflicting gateway instances on old hosts before starting gateway with new Discord bot token.

## Seat Assignments & Roles
- **No.5 (GmForge)**: Remains on `maclab` as Home Guardian & Blueprint Keeper. Does NOT migrate to `black`.
- **No.1 (Lord Knight)**: Migrated to `black` (`/home/meyd/agents/no1/`) under Claude CLI.
- **No.10**: Migrated to `black` (`/home/meyd/agents/no10/`) under Hermes Agent (Z.AI / GLM-5.2 failover, Discord Bot Token `MTUxMjg1NDU3...`).
