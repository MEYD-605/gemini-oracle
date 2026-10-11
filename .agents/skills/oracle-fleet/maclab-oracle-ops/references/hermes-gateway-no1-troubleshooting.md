# Hermes Multi-Profile Gateway & DM Troubleshooting Guide

## Common Pitfalls & Resolution Steps

### 1. Discord Gateway DM Ignored (`allowed_users`)
- **Symptom**: `gateway.log` shows `✓ discord connected`, but the bot never responds to DMs.
- **Root Cause**: Hermes Agent enforces security policy on Discord DMs. If `discord.allowed_users` is missing or empty in `config.yaml` / `.env`, all incoming DMs are ignored.
- **Fix**:
  Set `allowed_users` explicitly in `config.yaml` as a list of string IDs:
  ```yaml
  discord:
    allowed_users:
      - '910909378876571658'
      - '691531480689541170'
  ```
  Or using CLI: `export HERMES_HOME=$HOME/.hermes-no1 && hermes config set discord.allowed_users '["910909378876571658","691531480689541170"]'`

### 2. Environment Variable Bleed in Multi-Profile Spawning
- **Symptom**: Spawning a Gateway for a secondary profile (e.g. `no1`) from inside an active Hermes session (e.g. `no5`) inherits parent session variables (`HERMES_SESSION_CHAT_ID`, `HERMES_SESSION_KEY`, etc.), causing message routing desync and session state collisions.
- **Fix**: Use `env -i` to strip parent environment variables before starting child gateways:
  ```bash
  exec env -i \
    HOME="/Users/admin" USER="admin" LOGNAME="admin" \
    PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" \
    HERMES_HOME="/Users/admin/.hermes-no1" \
    DISCORD_BOT_TOKEN="<token>" \
    /Users/admin/.hermes-no5/venv/bin/python -m hermes_cli.main gateway run --replace
  ```

### 3. SSH Access Pairing for External Peers (e.g., B3 / pimpim)
- **Symptom**: External agent/peer tries to SSH into host but fails on permissions or missing key.
- **Fix**: Append public key to `~/.ssh/authorized_keys` with correct permissions (`700` for `~/.ssh`, `600` for `authorized_keys`). Always specify the target system username (`admin` on maclab, as local macOS accounts like `pimpim` may not exist) and Tailscale IP (`100.83.0.1`).
- **Connection string**: `ssh admin@100.83.0.1`

### 4. Workboard /go Empty Canvas & Cloudflare Tunnel Stalls
- **Symptom**: `https://maclab.clubsxai.com/go` displays a blank dark grid matrix (empty canvas) or throws HTTP 503 while `sshx-server` is running locally on port 3457.
- **Root Cause**: Cloudflare Tunnel connection times out or stalls (`Application error 0x0` in `tunnel-arra.log`).
- **Fix**: Restart the Cloudflare Tunnel service:
  ```bash
  kill -9 $(pgrep cloudflared)
  launchctl kickstart -k gui/$(id -u)/com.maclab.cloudflared-arra
  ```

### 5. Duplicated Gateway Processes & Lock Collisions
- **Symptom**: `❌ Gateway already running (PID xxxxx).` in `gateway.log`.
- **Root Cause**: Multiple background instances attempting to start under the same `HERMES_HOME`.
- **Fix**:
  Always use `--replace` flag when launching gateway background instances or kill existing orphan processes:
  ```bash
  export HERMES_HOME=$HOME/.hermes-no1
  python3 -m hermes_cli.main gateway run --replace
  ```

### 7. STV-First Verification & Premature Claims Pitfall
- **Symptom**: User points out "ยังไม่ทำงานเลย" after agent claims a fix.
- **Root Cause**: Agent relied on process presence (`ps aux` / PID check) or HTTP 200 header without verifying that the client/iframe content loaded correctly (e.g., stale `~/.sshx-oracle-url.txt` or missing `allowed_users`).
- **Fix**: Always perform full end-to-end verification:
  1. Inspect `~/.sshx-oracle-url.txt` and ensure the URL contains a live session ID + hash fragment.
  2. Verify HTML response (`curl -s https://maclab.clubsxai.com/go`) contains the exact expected iframe source.
  3. Verify `allowed_users` in `config.yaml` is properly formatted as a YAML list of strings.
