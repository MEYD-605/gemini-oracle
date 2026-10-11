# Cross-Host Agent Migration & Discord Gateway Cutover

When migrating agents (No.1, No.10, No.5) across nodes (e.g. `ai-core` -> `black`), follow these established patterns to ensure zero context loss and clean Discord gateway cutovers.

## 1. Directory & Context Migration (Sub-User / Non-Root Target)
When target user lacks `root` / `sudo` (e.g. operating under `/home/meyd/agents/`):

1. **Self-Contained Virtual Environment:**  
   Bypass PEP 668 (`externally-managed-environment`) by creating a local venv:
   ```bash
   python3 -m venv ~/venv
   ~/venv/bin/pip install hermes-agent
   ```

2. **Session History & Project Copy:**  
   Archive and transfer Claude `.jsonl` session history / Hermes home:
   ```bash
   tar -czf /tmp/no1_projects.tar.gz -C ~/.claude-old-acc1 projects
   scp /tmp/no1_projects.tar.gz user@target:/home/user/agents/no1/
   ```

3. **Leading-Dash Directory Renaming:**  
   Use `mv --` when renaming project directories with leading dashes:
   ```bash
   cd /home/user/agents/no1/projects
   for d in -root-Code-*; do
     newdir="-home-user-agents-no1-Code-${d#-root-Code-}"
     mv -- "$d" "$newdir"
   done
   ```

4. **In-File Deep Path Rewriting:**  
   Rewrite `"cwd"` and file paths inside `.jsonl` and `.yaml` files using `sed`:
   ```bash
   find /home/user/agents/no1/projects -type f -name '*.jsonl' -exec sed -i 's|/root/Code/|/home/user/agents/no1/Code/|g' {} +
   ```

## 2. Discord Gateway Cutover & Token Collision Prevention

When migrating a Hermes Agent with Discord integration (`DISCORD_BOT_TOKEN`):

1. **Identify & Terminate Old Gateway:**  
   If the old host still has the gateway process running, it retains the active WebSocket connection to Discord. Messages sent to the bot will be routed to the old host and ignored or lost.
   ```bash
   ssh root@old-host "pkill -f 'hermes_cli.main gateway'"
   ```

2. **Transfer Environment & Tokens:**  
   Copy `.env` containing `DISCORD_BOT_TOKEN`, `DISCORD_ALLOWED_USERS`, and `DISCORD_ALLOWED_CHANNELS` to `HERMES_HOME`.

3. **Verify Gateway Status & Send Direct Test:**  
   Start gateway on target host with `HERMES_HOME` specified:
   ```bash
   export HERMES_HOME=/home/user/agents/no10/.hermes-no10
   ~/venv/bin/hermes gateway run --replace &
   ```
   Verify connection by sending a direct test message:
   ```bash
   ~/venv/bin/hermes send --to 'discord:<channel_or_user_id>' 'Agent successfully migrated and active.'
   ```
