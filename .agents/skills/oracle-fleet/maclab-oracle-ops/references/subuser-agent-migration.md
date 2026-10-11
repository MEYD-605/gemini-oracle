# Sub-User Agent Migration Workflow & Virtualenv Bootstrap

## 1. Non-Root / Sub-User Directory Isolation
When migrating agents to a remote Linux machine (`black.alchemycat.org`) where you operate under a non-root account (e.g. `meyd` without `sudo` privileges):
- Place each agent in a dedicated sub-directory under your home space:
  - `/home/meyd/agents/no1/` (Claude CLI)
  - `/home/meyd/agents/no10/` (Hermes Agent)
  - `/home/meyd/agents/sombo/` (SomBo Oracle)
- Isolate runtime configurations using explicit environment flags:
  - `export HERMES_HOME=/home/meyd/agents/no10/.hermes-no10`

## 2. Python PEP 668 Virtualenv Bootstrap
Ubuntu 24.04+ blocks system-wide `pip install` (`externally-managed-environment`).
- **Setup Virtualenv:**
  ```bash
  python3 -m venv /home/meyd/venv
  ```
- **Hermes Installation:**
  ```bash
  /home/meyd/venv/bin/pip install --no-cache-dir hermes-agent rich pydantic openai httpx pyyaml ruamel.yaml requests jinja2 prompt_toolkit croniter packaging markdown pyjwt urllib3 cryptography psutil websockets pathspec fastapi uvicorn python-multipart ptyprocess pillow
  ```

## 3. Session & Directory Path Rewriting
When transferring `.claude/projects/` or `.hermes/sessions/`:
- **Directory Rename (Handling Leading Dashes):**
  `mv` fails if directory names start with `-` (e.g. `-root-Code-`). Always use `--`:
  ```bash
  cd /home/meyd/agents/no1/projects
  for d in -root-Code-*; do
    newdir="-home-meyd-agents-no1-Code-${d#-root-Code-}"
    mv -- "$d" "$newdir"
  done
  ```
- **In-File Path Rewriting:**
  ```bash
  find /home/meyd/agents/no1/projects -type f -name '*.jsonl' -exec sed -i 's|/root/Code/|/home/meyd/agents/no1/Code/|g' {} +
  ```

## 4. 9router Remote Provisioning & Model Naming Format
To install 9router under a non-root user on Linux:
1. Install Node v20 via `fnm`: `curl -fsSL https://fnm.vercel.app/install | bash`, `fnm install 20`.
2. Install 9router: `npm install -g 9router`.
3. Rsync `~/.9router/` (auth, db, jwt-secret) from maclab/master host.
4. Launch daemon: `nohup 9router -n -l -p 20128 -H 0.0.0.0 --skip-update &`.
5. **Model String Requirement:** 9router requires prefixed model IDs (e.g. `ag/gemini-3.6-flash-high`). Passing un-prefixed names like `gemini-3.6-flash-high` returns `HTTP 404 NOT_FOUND`.

## 5. Discord Gateway Token Collision Resolution
When migrating an agent's Discord Bot Token to a new host:
- **Must terminate old gateway/relay on source host first** (`pkill -f 'hermes_cli.main gateway'`).
- If old gateway stays connected, Discord token collisions cause silent ready loops, 401 unauthorized errors, or prevent the new gateway from receiving/sending DMs.

## 6. SQLite Database Malformed Recovery
Raw host-to-host tar/copy of SQLite databases often causes corruption (`database disk image is malformed`).
- Delete stale DB files: `rm -f state.db state.db-shm state.db-wal kanban.db verification_evidence.db`.
- Hermes will auto-generate clean database schemas on next gateway/agent startup.

## 7. Immediate Identity Overhaul
When converting an agent's engine or seat (e.g. `gmaicore` on `ai-core` -> `No.10` on `black`):
- Immediately rewrite `SOUL.md`, `CLAUDE.md`, and `IDENTITY.md` in `HERMES_HOME`.
- Ensure `SOUL.md` reflects the new handle, host, and role (`No.10 Oracle on Black`) to prevent the agent from assuming its old identity or host boundaries.

## 8. No.5 Mobility Rule
- **No.5 (`05-gmforge` / `gmforge-oracle`) MUST remain on `maclab` as Home Guardian.**
- Never migrate `.hermes-no5` to remote servers (`black`, `ai-core`).
- If `.hermes-no5` is accidentally copied, delete it immediately (`rm -rf ~/.hermes-no5`).
