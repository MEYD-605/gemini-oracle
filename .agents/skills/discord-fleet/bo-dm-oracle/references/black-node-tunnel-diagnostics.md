# Troubleshooting & Fixes: Black Node & Cross-Node Tunnel Diagnostics

## 1. `maw federation` Dot Status vs Node Gateway

- `maw federation` checks local HTTP accessibility to each peer's mapped URL (e.g. `http://127.0.0.1:13456` for `black`).
- **Symptom:** `○ black offline` even though `hermes gateway` or `maw serve` is running on `black`.
- **Root Cause:** The SSH port forward / tunnel on maclab (`ssh -N -fL 13456:localhost:3458 meyd@black.alchemycat.org`) is down or disconnected.
- **Fix:** Run background SSH tunnel command from maclab:
  ```bash
  ssh -N -fL 13456:localhost:3458 meyd@black.alchemycat.org
  ```
- **Verification:** Run `maw federation` and confirm `● black online` (blue/green dot).

## 2. Remote Node Agent Stale / Unresponsive Diagnostics

When Bo reprimands: *"มึงทำให้เรียบร้อยดีกูไม่ได้ให้ maw hey ให้จัดการให้เรียบร้อย"*

### Step-by-Step Recovery Checklist:
1. **Never stop at `maw hey`**: Delivering a `maw hey` payload to a pane does NOT mean the agent is responding.
2. **SSH to remote machine**:
   ```bash
   sshpass -p "<password>" ssh <user>@<host> "export PATH=\$PATH:...; tmux ls"
   ```
3. **Capture Pane State**:
   ```bash
   tmux capture-pane -p -t <session>:0 -S -30
   ```
4. **Identify Exact Failures**:
   - **Claude Code Subscription Access Disabled / Organization Disabled**: User's Claude Code OAuth expired or org sub disabled. Needs re-auth or switch to API billing (`/login`).
   - **502 Bad Gateway**: Anthropic API server-side issue.
   - **404 Model Not Found**: Gateway `config.yaml` requesting a model/provider combo not active on local 9router (e.g., `cc/claude-sonnet-5` on 9router without credentials). Switch default model back to `glm/glm-5.2` or working model via `hermes config set`.
   - **Gateway Stopped / Supervisor Blocked**: Service needs `--force --replace` flags when manually starting:
     ```bash
     exec python -m hermes_cli.main gateway run --force --replace
     ```
5. **Restart & Confirm**: Kill wedged tmux sessions or gateway processes, restart cleanly, capture pane to ensure it's at `ready` / listening prompt.
