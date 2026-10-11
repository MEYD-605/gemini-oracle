# boot-recovery.sh stale lock — silent multi-week fleet respawn failure (2026-08-11)

## The incident

After a routine OS-update reboot, Bo reported `maclab.clubsxai.com/go` showing
`tmux sessions: 0` — the entire oracle fleet (00/01/04/05/88) appeared to have
vanished. First instinct was to treat this as caused by the just-completed OS
update / reboot. **It wasn't.** `~/.maw/maclab-boot-recovery.log` showed:

```
2026-07-26 17:48:05 SKIP already running (lock /Users/admin/.maw/boot-recovery.lock)
2026-07-28 12:55:21 SKIP already running (lock /Users/admin/.maw/boot-recovery.lock)
2026-07-29 21:12:09 SKIP already running (lock /Users/admin/.maw/boot-recovery.lock)
2026-08-11 20:01:49 SKIP already running (lock /Users/admin/.maw/boot-recovery.lock)
```

`~/.maw/boot-recovery.lock` (a `mkdir`-based lock dir) had been sitting since
**2026-07-26 17:40** — creator process long dead, dir never removed. Every
reboot for the following **2+ weeks** silently no-op'd the entire
`maclab-boot-recovery.sh` respawn wave. Nobody noticed because individual
gateway processes (launchd-managed: no1/no4/no5/gmgrok Hermes gateways) kept
running fine across reboots via their own `KeepAlive` plists — only the
**tmux operator panes** (00/01/04/05/06/08/88 CLI sessions) and the Discord
**relay processes** for the non-Hermes seats silently stayed dead.

## Diagnosis checklist (run in this order)

```bash
tmux list-sessions                                    # "No such file" = tmux server itself down
ls -la ~/.maw/boot-recovery.lock                       # exists + old mtime = stale lock suspect
ps aux | grep -i "boot-recovery" | grep -v grep         # empty = confirms orphaned, no live owner
tail -80 ~/.maw/maclab-boot-recovery.log                # look for repeated "SKIP already running"
bash ~/.maw/post-reboot-verify-100.sh                   # full GREEN/RED fleet spine report
```

`post-reboot-verify-100.sh` is the authoritative fleet-health check — trust
its GREEN/RED table over any single `ps`/`tmux` spot-check.

## Fix

```bash
rmdir ~/.maw/boot-recovery.lock      # safe once confirmed no live owner process
```

**Do NOT then run `bash ~/.maw/maclab-boot-recovery.sh` directly from inside
a Hermes gateway DM session** — it contains a `launchctl kickstart -k`
line for the gateway itself, and the safety guard blocks any command
containing gateway-restart syntax while a gateway is live in the same
process tree (`Blocked: command or referenced script cannot restart or stop
the gateway from inside the gateway process`). Instead, run the wave's
components directly:

```bash
bash ~/.maw/fleet-discord-watchdog.sh   # starts Discord relay processes for 01/06/08/88/gmgrok
```

For tmux sessions that are still missing after the watchdog (it starts
relays but does not always recreate every operator pane), spawn them
manually — read the exact `hermes_cmd()`/`grok_cmd()`/`agy_cmd()` builder
function out of the matching `~/.maw/<seat>-keepalive.sh.DISABLED` file
(the canonical repo/env/exec pattern for a seat rarely changes even though
the auto-keepalive scripts themselves are usually renamed `.DISABLED` on
this fleet — see below) and run `tmux new-session -d -s <SESSION> -n
<name> -c <REPO> "<CMD>"` with that exact command string.

## Why the keepalive scripts are `.DISABLED` — don't "fix" that

Every seat's `*-keepalive.sh` in `~/.maw/` has been intentionally renamed
`.sh.DISABLED` since the Hermes-gateway cutover (per AGENTS.md: engine is
Hermes gateway, not the old Grok-CLI-era tmux-watchdog-cron pattern). This
is NOT an accidental breakage to revert — it's expected state. The
`.DISABLED` files remain useful purely as **reference for the exact spawn
command** (REPO path, exported env vars, exec line) when you need to
manually recreate a missing tmux pane, as above. Don't re-enable them by
stripping the `.DISABLED` suffix or wiring them back into cron/launchd
without an explicit Bo instruction — that would resurrect the old
crash-loop-prone auto-respawn architecture the fleet deliberately moved
away from.

Two seats (`06-gemini`, `08-agy-nano2`) additionally carry an intentional
`~/.maw/cool-hold-no6-no8.flag` (dated 2026-07-26, from a prior crash-loop
incident) that their `.DISABLED` scripts themselves check for and skip
respawn on. **Respect this flag — do not manually spawn 06/08 tmux sessions
without asking Bo first**, even though the mechanical steps to do so are
identical to the other seats.

## Discord 401 after tmux sessions are back — separate root cause, needs Bo

Getting tmux sessions GREEN does not guarantee Discord relays for the same
seat come back GREEN too. Verify each Discord-relay-backed seat's bot token
independently — a dead token looks identical to "relay just hasn't started
yet" for the first few seconds:

```bash
for state in discord-no1 discord-no4 discord-sombo discord-gmgrok discord-no6 discord-no8; do
  TOKEN=$(grep '^DISCORD_BOT_TOKEN=' ~/.claude/channels/$state/.env 2>/dev/null | cut -d= -f2- | tr -d '\r"')
  [ -n "$TOKEN" ] && echo "$state -> HTTP $(curl -sS -m 5 -o /dev/null -w '%{http_code}' -H "Authorization: Bot $TOKEN" https://discord.com/api/v10/users/@me)"
done
```

A relay process that keeps respawning and immediately dying with
`Fatal authentication failure (401 Unauthorized). Exiting process to
prevent loop.` in `~/.maw/relay-<seat>.log` confirms a genuinely revoked/
expired token — this is a Discord Developer Portal fix (regenerate the bot
token, write it into that seat's `.env`, do NOT ask the agent to "just
restart the relay again," it will keep 401ing). Cross-check against
`~/.maw/post-reboot-verify-100.log` history to find the last known-GREEN
timestamp for that seat — that tells Bo roughly when the token actually
died, which is usually well before whatever incident prompted the
investigation (in this case, tokens for no1/no4/sombo had been dead since
sometime between 2026-07-26 and 2026-08-11, unrelated to the OS-update
reboot that surfaced the tmux-session symptom).

## Load spikes right after reboot — usually Spotlight, not a real problem

If Bo reports high load average (`load1m` in the 20-35 range) within the
first ~20 minutes after a reboot, check `mdworker_shared`/`mds_stores`
process count and `top -l 1` CPU-idle% before assuming a real problem:

```bash
uptime                                              # confirm recent boot
top -l 1 -o cpu -n 5 | head -20                     # check CPU idle% vs load average
ps aux | grep -c mdworker                            # Spotlight reindex workers
mdutil -s /                                          # indexing enabled/in-progress
```

A **high load average paired with high CPU idle% (>80%)** means the load is
I/O-wait from Spotlight re-indexing the filesystem after an OS update (every
mount gets a fresh index build), not a CPU-bound problem — it self-resolves
in 10-30 minutes without intervention. Confirm by sampling `uptime` load
average twice a few seconds apart; a steadily falling number confirms the
transient-reindex diagnosis rather than a stuck/runaway process.
