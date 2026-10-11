# Remote/local fleet agent diagnostics — worked examples (2026-07-30)

## Case 1: "หา gmgrok ได้ยัง" (local tmux, wedged wake attempt)

`maw ls --json` showed session `00-gmgrok` as `stale`. `tmux capture-pane -t 00-gmgrok -p`
revealed a `maw wake` block that had tried to launch:

```
FLEET_AGENT_NAME=06-gemini claude --continue
zsh: command not found: claude
maw wake: engine exited with status 127
```

Root cause: the wake script assumed the Claude Code CLI (`claude`) was installed and on
`$PATH` on this host. It wasn't (`which claude`, `find / -iname claude`, `brew list | grep
claude`, npm global list — all came up empty). The tmux pane was just an idle zsh prompt
after the failed exec, with several other agents' stray reply lines pasted into it from
old `maw hey` sends (harmless leftover text, not live output).

**This is an environment/install gap, not a durable fact to hard-code** — don't conclude
"gmgrok can never run claude on maclab". Just report: session exists, wake attempt failed
because the CLI binary wasn't found, nothing is currently listening at that pane.

## Case 2: "no.10 ทำไมออฟไลน์" (remote host, dead dependency proxy)

Host: `black.alchemycat.org` (SSH alias in `~/.ssh/config`, proxied via
`cloudflared access ssh --hostname %h`, user `meyd`).

Steps that worked:
1. `ssh meyd@black.alchemycat.org "who"` — `nat`'s 5 ttys all showed 2 days idle (`Tue11`
   login, `24:20`/`25:37`/etc elapsed with no new activity) → the human wasn't at the
   keyboard, separate from whether any agent process was up.
2. `ps aux | grep -i 'no10\|9router'` on the remote host — nothing running.
3. `tail`/`grep` on `/home/meyd/agents/no10/gateway.log` reported "binary file matches"
   (the log has embedded control bytes from progress bars) — switched to
   `strings gateway.log | grep -n 'Shutdown\|SIGTERM'` which cleanly found:
   ```
   WARNING gateway.run: Shutdown context: signal=SIGTERM under_systemd=yes parent_pid=1 ...
   ```
   at the same timestamp as `.hermes-no10/.clean_shutdown` (an empty flag file, `stat`
   showed matching mtime).
4. Read backward from that point in the raw log: cascading `APIConnectionError` on BOTH
   the primary model (`glm-5.2`) and the fallback (`grok-4`) — all through
   `http://127.0.0.1:20128/v1/` (the local 9router proxy). Confirmed proxy death live:
   `curl -s -m 3 http://127.0.0.1:20128/v1/models` returned nothing, `ss -tln | grep
   20128` showed no listener.
5. Checked for a supervisor: `systemctl list-units --all --type=service | grep -iE
   'no10|9router|hermes'` → nothing. `/etc/systemd/system/` had unit files for OTHER
   agents on the same box (`pm2-nat.service` for the `nat` user's PM2-managed processes,
   `openclaw-gateway.service` for a different service) but nothing for no10's Hermes
   profile — it was started by a plain `start_gateway.sh` wrapper script with no
   restart-on-crash mechanism at all.
6. `gateway.lock` still listed a `pid` from before the crash — did NOT trust this as
   proof of life; `ps -p <pid>` confirmed the process was gone.
7. Tried to inspect PM2's job list for corroboration (`nat` runs several things under
   PM2 per `pm2-nat.service`) but hit `Permission denied` on both the `pm2` binary and
   `~/.pm2/dump.pm2` — expected, since that's a different Linux user's files; this is a
   permissions boundary, not evidence the service is broken.

Conclusion delivered to Bo: no10's dependency proxy (9router) crashed 2 days ago, the
gateway exhausted all provider fallbacks and self-terminated via SIGTERM, and nothing on
that host auto-restarts either process — it needs a manual restart of both.

## Case 3: recovery once diagnosed — no10/9router restart (2026-08-01)

Same host/agent as Case 2, dead again 4 days later, same root cause (9router proxy
died first, no10 gateway exhausted retries and self-terminated). This time the ask was
"เอากับๆ" (go fix it), not just diagnose. Full recovery sequence that actually worked:

1. **9router won't background with plain `nohup ... &` over SSH inline in a `-c` string**
   — the process spawns then dies silently the moment the SSH exec channel closes,
   because it isn't detached from the session's process group. `setsid nohup ... &`
   alone also isn't reliable over a one-shot `ssh host 'cmd'` (no controlling terminal
   to detach from cleanly). What worked: launch inside a **tmux session** —
   `ssh host "tmux new-session -d -s 9router -c /home/meyd 'bash -lc \"...exec node cli.js...\"'"`
   — tmux's own detached session keeps it alive independent of the SSH channel.

2. **9router boots into an interactive TUI menu on first run, not silently** — after
   `Ready in 0ms` it prints a "Choose Interface" menu (Web UI / Terminal UI / Hide to
   Tray / Exit) and BLOCKS waiting for arrow-key input. A plain launch leaves it stuck
   here forever (port never listens). Fix: drive it via `tmux send-keys -t 9router Down
   Down Enter` etc. to navigate to **"Hide to Tray (Background)"** and confirm with
   Enter — only then does it actually bind the port and start serving. Verify with
   `curl -s -m 5 -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:20128/v1/models`
   (expect `HTTP 200`) and `ss -tlnp | grep 20128`. Note it self-daemonizes after
   confirming Tray mode — the tmux pane can disappear/die afterward and the process
   survives independently as `node ... --tray --skip-update -p 20128`.

3. **`hermes gateway run --replace` on the profile refused with "A gateway is already
   running under systemd (system) for this profile"** — this message is misleading on
   a shared box. It was NOT referring to no10's own (nonexistent) systemd unit; it was
   tripping on an unrelated `hermes-gateway.service` running under a completely
   different Linux user (`hermes`) with a different `HERMES_HOME`
   (`/home/hermes/.hermes`) — a different agent profile entirely, just sharing the same
   host. Confirmed by reading `/etc/systemd/system/hermes-gateway.service` and matching
   its `User=`/`Environment=HERMES_HOME=` against no10's actual
   `/home/meyd/agents/no10/.hermes-no10`. **Don't take the "already running" refusal at
   face value on a multi-tenant box** — check whose systemd unit it actually is before
   assuming it's the target profile's own supervisor. Bypass (safe here because it's a
   genuinely different profile): add `--force` to the launch command.

4. **`start_gateway.sh` wrapper script referenced a systemd user unit
   (`hermes-gateway-gmaicore.service`) that no longer exists on the box** (`systemctl
   --user status <name>` → "could not be found"). This profile has NO working
   supervisor at all — confirmed via `systemctl --user list-unit-files | grep hermes`
   (empty) and `find /etc/systemd/user -iname '*hermes*'` (empty). Manual restart is
   the only path until someone re-provisions a real unit; flag this back to the human
   rather than silently re-doing a manual restart forever.

5. Final launch that worked: same `setsid bash -c 'source start_gateway.sh >>
   gateway.log 2>&1 < /dev/null &'` pattern, but only succeeds once step 1 (9router
   alive) is true — the gateway process will start and show in `ps aux`, but silently
   sits retrying against a dead proxy if 9router isn't up first. Verify success via
   `.hermes-*/gateway_state.json` — look for `"gateway_state":"running"` AND
   `"discord":{"state":"connected"}`, not just a live PID (PID can be `Ssl` state and
   still be stuck retrying a dead dependency).

## Reusable takeaways

- `grep`/`tail` on logs with embedded control/progress bytes → use `strings <file> | grep
  ...` instead of fighting "binary file matches".
- A `.lock` file's `pid` field is a snapshot, not a live check — always `ps -p <pid>`.
- "Multiple models all failing the same way" is a strong signal the shared transport
  layer (proxy/gateway) died, not that every individual model went down independently.
- Before saying "no auto-restart" for a whole host, check `systemctl list-units --all
  --type=service` for the SPECIFIC agent's unit — other agents on the same box may have
  real supervisors (systemd, PM2) while the one you're diagnosing does not.
- SSH permission errors on another user's PM2/service files are a boundary, not a broken
  tool — note it and move on rather than treating it as a dead end.
