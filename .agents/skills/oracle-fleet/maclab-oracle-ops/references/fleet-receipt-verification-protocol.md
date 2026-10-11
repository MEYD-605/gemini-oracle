# Fleet Receipt Verification & SEAL Protocol

When a peer agent (e.g. `00-gmgrok`, `05-gmforge`) submits a completion receipt for house hygiene, watchdog hardening, or fleet maintenance before a scheduled event (e.g. Re-weekly 10:00), No.1 (Fleet Orchestrator) must independently **verify physical evidence before issuing SEAL**.

## Verification Ladder (5 Dimensions)

1. **TUI Panes Check (Tmux)**
   - Run: `tmux ls 2>/dev/null | grep -E 'gmgrok|lord|mimo|gmforge'`
   - Gate: All 4 active seats (`00-gmgrok`, `01-lord-knight`, `04-mimo`, `05-gmforge`) must have live tmux sessions.

2. **Hermes Gateway & Router Daemons**
   - Run: `launchctl list 2>/dev/null | grep -i hermes`
   - Gate: All configured gateways (`gateway-no1`, `gateway-gmgrok`, `gateway-no4`, `gateway-no5`) must show status 0.
   - Run: `curl -s -m 5 http://127.0.0.1:20128/health` or `lsof -iTCP:20128 -sTCP:LISTEN`
   - Gate: 9router listening and healthy.

3. **Job-Watchdog & Alert State**
   - Inspect: `~/.maw/job-watchdog.state.json`
   - Count OK vs ALERT: `grep -c '"status": "OK"' ~/.maw/job-watchdog.state.json` vs `grep -c '"status": "ALERT"' ~/.maw/job-watchdog.state.json`
   - Gate: 0 alerts, stale/obsolete jobs cleaned from registry.

4. **Script Hygiene & Archive Verification**
   - Inspect: `ls -d ~/.maw/archive-stale-<date>`
   - Verify: Stale backups and deprecated helper scripts cleanly quarantined with count receipts.
   - Syntax check: `bash -n <script.sh>` for any active cron/autoctx scripts.

5. **Machine Health (Load & Thermal Buffer)**
   - Run: `uptime`
   - Gate: Load average safely below threshold (<8.0; ideally <3.0).

## SEAL Issuance & Broadcast

Once verified:
1. `maw hey <peer>`: Send explicit `SEALED RECEIPT` with verified metrics.
2. Discord DM (Bo): Post concise Thai status confirming seal metrics + ready state for Re-weekly.
