# Migrating AGY CLI / Claude CLI Agents to Hermes 9router Agents

## Overview
When migrating legacy CLI agents (e.g. No.10 on `ai-core` running AGY CLI) to a new node (`black`) as a **Hermes Agent** powered by **9router**:

## Step-by-Step Workflow

### 1. Isolated `HERMES_HOME` Setup
Create a dedicated agent directory and isolated Hermes home:
```bash
mkdir -p /home/meyd/agents/no10/.hermes-no10
```

### 2. Copy Credentials & Discord Tokens
Copy `auth.json` (xAI / Z.AI OAuth) and `.env` (Discord Bot Token & channel IDs):
```bash
cp /source/auth.json /home/meyd/agents/no10/.hermes-no10/
cp /source/.env /home/meyd/agents/no10/.hermes-no10/
```

### 3. Configure `config.yaml` for 9router
Update `config.yaml` to point to 9router:
```yaml
model:
  default: ag/gemini-3.6-flash-high
  provider: 9router
  context_length: 1000000
```
*Note:* Always include the vendor prefix `ag/` for 9router models (e.g. `ag/gemini-3.6-flash-high`). Bare names (e.g. `gemini-3.6-flash-high`) cause 404 NOT_FOUND errors in 9router.

### 3.1 Update Agent Identity Prompt Files (SOUL.md / CLAUDE.md / IDENTITY.md)
When converting an agent persona (e.g. `gmaicore` to `No.10`), update `SOUL.md`, `CLAUDE.md`, and `IDENTITY.md` inside `HERMES_HOME` immediately to reflect the new host, seat, and identity:
```markdown
# SOUL - No.10 Oracle
I am No.10 Oracle running on Hermes Agent on machine Black.
```
Otherwise, the agent will retain old identity context and introduce itself as the wrong persona.

### 4. Deep Path & Working Directory Cleanups (CRITICAL)
Replace any hardcoded `/root/` or old-host paths in `config.yaml` and `gateway_state.json`:
```bash
sed -i 's|/root/Code/github.com/MEYD-605/gmaicore-oracle|/home/meyd/agents/no10|g' /home/meyd/agents/no10/.hermes-no10/config.yaml
```
*Pitfall:* If `cwd:` in `config.yaml` points to a non-existent or unreadable path (e.g. `/root/...`), Hermes will fail with `PermissionError: [Errno 13] Permission denied` during system prompt generation and stay silent on Discord.

### 5. Clear Corrupted SQLite State DBs & Verify Discord Token
- **Clear Malformed DBs:** If copying state DBs across OS/architecture boundaries causes `database disk image is malformed`:
```bash
rm -f /home/meyd/agents/no10/.hermes-no10/state.db* /home/meyd/agents/no10/.hermes-no10/kanban.db*
```
Hermes will recreate clean databases on launch.

- **Discord Token Verification:** Verify `DISCORD_BOT_TOKEN` in `.env` matches the real active token (Discord auto-invalidates tokens pasted in chat/DM). Check `gateway.log` if the bot does not appear online or reply.

### 6. Kill Stale Gateways on Old Host & Test Send
Kill any running gateway/relay on the old host to release the Discord WebSocket connection, then launch:
```bash
ssh root@ai-core "pkill -f 'hermes_cli.main gateway'"
export HERMES_HOME=/home/meyd/agents/no10/.hermes-no10
hermes gateway run --replace
hermes send --to "discord:<channel_id>" "Test message from No.10"
```
