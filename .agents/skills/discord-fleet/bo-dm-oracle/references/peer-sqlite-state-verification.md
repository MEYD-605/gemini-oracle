# Peer SQLite State Verification Pattern

## Context
When asked whether a peer agent (e.g., `no.5` / `hermes-no5`) is handling a task on a remote target host (e.g., `natz-ai-03` / `100.122.59.94`), direct network reachability from your own node (`maclab`) may fail (tailscale ping timeout, SSH timeout, `maw federation` offline status).

## Protocol
1. **Recognize Network Asymmetric Reachability**: Peer seats running on the same host (or sharing disk/user access) may have separate SSH keys, tunnels, or network paths to the target machine. A timeout from `maclab` does not mean the peer failed.
2. **Read Peer Session State Directly**:
   Query the peer seat's local SQLite database (`~/.hermes-<seat>/state.db`) in `-readonly` mode:
   ```bash
   sqlite3 -readonly ~/.hermes-no5/state.db \
     "SELECT datetime(timestamp,'unixepoch','localtime'), role, substr(content,1,300) \
      FROM messages WHERE content LIKE '%03%' OR content LIKE '%natz%' ORDER BY timestamp DESC LIMIT 15;"
   ```
3. **Audit Real Execution Outputs**:
   Look for `tool` role messages containing execution logs (`systemd`, `grep`, `journalctl`, `curl`) rather than relying solely on assistant text.
4. **Honest Boundary Reporting**:
   Explicitly report to Bo:
   - Direct network probes (SSH / ping / federation) from `maclab` timed out.
   - Verified via peer local SQLite `state.db` that the peer executed real tools and confirmed status on the target machine.
