# Workboard (sshx-server / MAW Board) Troubleshooting & Cloudflare Tunnel Ingress

## Overview

MAW Board (`sshx-server` + `sshx client`) provides web-based terminal access and system monitoring across nodes (`maclab`, `note20`, `rockpi-edge`). It operates as two separate binaries:
1. `sshx-server`: Listens locally (port 3457) and hosts the static UI build.
2. `sshx client`: Connects to `sshx-server`, generates a unique PTY session URL (`https://<domain>/s/<session_id>#<key>`), and writes it to `.sshx-oracle-url.txt`.

## Common Failures & Pitfalls

### 1. 502 Bad Gateway / Could Not Find Requested Session on `note20.clubsxai.com/go`
- **Cause:** In Note20's `~/.cloudflared/config.yml`, the Cloudflare Tunnel ingress was incorrectly set to point to `http://100.83.0.1:3457` (MacLab IP) instead of `http://127.0.0.1:3457` (Note20 local port).
- **Fix:** Update `~/.cloudflared/config.yml` on Note20:
  ```yaml
  ingress:
    - hostname: note20.clubsxai.com
      service: http://127.0.0.1:3457
    - service: http_status:404
  ```
  Then restart `cloudflared` (`pkill -9 cloudflared` and re-run daemon).

### 2. Perpetual Keepalive Restart Loop on MacLab
- **Cause:** `maclab-workboard-keepalive.sh` checks `https://maclab.clubsxai.com/go`. The server returns HTTP 303 Redirect to `/login`. If the health check script does not treat HTTP 303 as healthy, it attempts to kill and restart `sshx-server`, resulting in `Address already in use (os error 98)` and port conflicts.
- **Fix:** Allow HTTP 303 or use `curl -L` to follow redirects in `prove()` health checks.

### 3. Session Invalidated / Disconnected Client
- **Cause:** When `sshx-server` or `sshx client` crashes, a new PTY session URL is generated. Web browsers attempting to access old `/s/<old_session_id>` links encounter `Failed to connect: could not find the requested session`.
- **Fix:** Re-run `sshx` client to generate a fresh PTY session, update `.sshx-oracle-url.txt`, and access via `/go` redirect link.
