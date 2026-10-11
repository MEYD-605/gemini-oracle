# MacLab House Guardianship & Incident Prevention

## Core Incidents & Root Causes (Historical Digest)

0. **Discord Agent Mention Interventions:**
   - **Rule:** If a message explicitly `@mentions` a specific agent, other agents must not answer or intervene. Let the tagged agent handle the response independently.

1. **Compiler & Build Process Crashes (`clang`, `cc1`, `node-gyp`):**
   - **Root Cause:** Compiling native modules (e.g. `better-sqlite3` during `9router` installation) can spawn `clang` processes that freeze in `T` state, keeping memory allocated and locking resources.
   - **Impact:** Load average spikes from 1.5 to 18.0+, resulting in system unresponsiveness and auto-reboot.
   - **Prevention:** Automatic `maclab-auto-load-guard` cron script running every 5m (`no_agent=true`) checks loadavg > 8.0 and issues `kill -9` to zombie compilers.

2. **Git Pack Storms (`git pack-objects`):**
   - **Root Cause:** Rapid or recursive git operations across large repositories trigger multiple concurrent `git pack-objects` processes.
   - **Impact:** 100% CPU saturation on all cores, causing CPU temperature spikes > 80°C.
   - **Prevention:** Serial execution of git tasks; load-guard script automatically terminates runaway `git pack-objects` processes.

3. **MAW Board Keepalive HTTP 303 Redirect False Positive:**
   - **Root Cause:** `maclab-workboard-keepalive.sh` probing `https://maclab.clubsxai.com/go` without `-L` receives HTTP 303 Redirect to `/login`.
   - **Impact:** Evaluates 303 as failure (YELLOW), triggering continuous server/client restart loops and creating connection timeouts for web users.
   - **Fix:** Update probe logic in `maclab-workboard-keepalive.sh` to follow redirects (`curl -L`) or explicitly accept 303/200 HTTP response codes.

4. **Disk Space Crises & SQLite WAL Bloat:**
   - **Root Cause:** Uncleaned `.db-wal` / `.db-shm` files or `/tmp` artifacts filling up NVMe/SSD.
   - **Impact:** Database write failures (`database disk image is malformed`), process lockups.
   - **Prevention:** Clean stale temporary files in `/tmp` and reset malformed SQLite files by allowing Hermes to recreate schemas cleanly.

5. **Discord Gateway Token Collision:**
   - **Root Cause:** Migrating an agent's Discord token to a new host without terminating the gateway on the old host.
   - **Impact:** WebSocket connection collisions, silent gateway errors, 401 Unauthorized loops.
   - **Prevention:** Always run `pkill -f 'hermes_cli.main gateway'` on source node before bringing up gateway on target node.

6. **Antigravity CLI Interactive Prompt Hangs:**
   - **Root Cause:** Interactive login or workspace trust prompts (`Do you trust the contents of this project?`) running inside non-interactive `tmux` sessions without `--dangerously-skip-permissions`.
   - **Impact:** Process hangs indefinitely waiting for stdin input, causing high load and timeout loops.
   - **Prevention:** Restore valid token backups directly (`antigravity-oauth-token`) and launch with `--dangerously-skip-permissions`.
