# Remote Fleet Node Agent Audit (e.g. black / node10 / remote hosts)

When asked to verify the location, host, tmux session, and live status of a remote agent (e.g., `sombo` on `black`):

## Workflow Checklist
1. **Resolve Host & Tailscale IP:**
   - Look up Tailscale node name/IP via `tailscale status` (e.g., `black-no10` -> `100.101.111.125`).
   - Use `ssh -o ConnectTimeout=6 -o BatchMode=yes -o StrictHostKeyChecking=accept-new meyd@<IP>`.

2. **Check Agent Directory & Configuration:**
   - Check standard home locations (e.g. `/home/meyd/agents/<agent_name>` or `~/.hermes-<agent_name>`).
   - Verify file existence and modification time (e.g. `ls -la ~/agents/<agent_name>`).

3. **Check Live Execution Status:**
   - Process check: `ps aux | grep -i <agent_name>` and `ps aux | grep -i 'gateway run'`.
   - Tmux session check: `tmux ls` across relevant user accounts.

4. **Reporting Format (Facts Only):**
   - Node name & IP.
   - Exact path where agent files reside.
   - Process/gateway state (running / not running).
   - Session state (tmux active / inactive).
