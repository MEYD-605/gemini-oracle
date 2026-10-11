# Post-Respawn tmux Session Verification & Infra Audit (2026-08-11/12)

After reviving tmux sessions killed by a stale boot-recovery lock, do NOT
report the fleet as healthy just because `tmux list-sessions` shows panes
again. "Up" is not "working."

## Home Guardian / Infra Constructor Status Audit Workflow
When asked about No.5's own responsible duties or infra constructor status ("infra constructor ไปถึงไหนแล้ว" / "มีงานส่วนที่ตัวเองรับผิดชอบต้องทำหรือเปล่า"):

1. **House & Gateway Health**:
   - Check LaunchAgent daemons: `launchctl list | grep hermes` (verify `ai.hermes.gateway-no5` pid/status).
   - Check machine metrics: load (`uptime`), disk space (`df -h /`), system load-guard thresholds.
   - Check ARRA Oracle connection & doc count (`arra_stats`).

2. **Handoff & Registry Drift Check**:
   - Read latest handoff in `ψ/inbox/handoff/` (e.g. `2026-08-09_14-58_highclass-no3-setup-and-ssh-auth.md`).
   - Audit registry SSOT: Compare `.grok/CONSTRUCTURE.md` / `lord-knight-oracle/ψ/data/fleet-number-registry.json` against live engine & model via `9router`.

3. **Repo & Outbox State**:
   - Check `git status` for unpushed commits in `gmforge-oracle`.
   - Check pending tasks in `ψ/outbox/*_pending.md`.

4. **Response Protocol**:
   - Present a clean audit table: Gateway status, Load/Disk, ARRA status, Git state, Registry drift, Pending handoff items.
   - Propose clear next actions (e.g. push pending commits, patch model registry drift, follow up on No.3 HighClass research).

---

## What actually happened

A `boot-recovery.sh` lock had been stale since 2026-07-26 (~2 weeks), so
every reboot in between silently skipped tmux respawn. When finally cleared
and sessions were manually recreated for 5 agents (00-gmgrok, 01-lord-knight,
04-mimo, 05-gmforge, 88-sombo), a first pass reported them as healthy based
only on `tmux list-sessions` output. Capturing each pane's actual content
revealed **all five** were silently stuck:

| Session | Stuck at |
|---|---|
| 00-gmgrok | `🔐 sudo password required` prompt, 6 queued jobs unprocessed |
| 01-lord-knight | grok CLI weekly usage limit wall |
| 04-mimo | same weekly limit wall |
| 05-gmforge | fresh Hermes install, provider setup wizard (`Set up a provider now? [Y/n]`) |
| 88-sombo | grok CLI first-run "Help improve Grok" opt-in/out dialog |

None of these produce an error — they just sit there waiting for input that
will never come from an unattended tmux respawn.

## Correct verification procedure

```bash
for s in <session1> <session2> ...; do
  echo "### $s ###"
  tmux capture-pane -t "$s" -p 2>&1 | tail -15
done
```

Read the actual tail of each pane. Cross-check against process CPU state
(`ps aux | grep <session-relevant-binary>`) if the pane output is ambiguous —
an idle/blocked process shows near-zero CPU even under a "cogitating..."
banner.

## Fixing each stuck class

- **sudo password prompt**: needs an interactive human, or pre-authorize via
  passwordless sudo for the specific command if this recurs.
- **CLI usage/quota limit wall**: switch the session to a different
  model/provider, or wait for quota reset — don't just leave it queued.
- **Fresh Hermes provider setup wizard**: run `hermes model` or `hermes
  config set model.provider ...` / `model.default ...` non-interactively
  before spawning the tmux session, or send the `Y`/config answer into the
  pane once discovered.
- **First-run CLI opt-in/out dialogs**: send the expected keystroke
  (`tmux send-keys -t <session> '<key>' Enter`) once, then re-verify.

## Takeaway

When a task involves reviving N agent sessions, "N sessions exist in tmux" is
not sufficient evidence to report success. Verify N/N panes are actually at a
working prompt, not just present.

## maw-rs & Self-Routing Operations

- **maw-rs Health Check:** `http://127.0.0.1:3456/` returns `200 OK` (renders HTML landing page). Note that `http://127.0.0.1:3456/_health` returns `404 Not Found` on recent builds — do not treat `404` on `/_health` as a dead service.
- **maw hey Self-Node Target Resolution:** When invoking `maw hey` targeting a local session on the same host, do not prefix with the node name (e.g. `maw hey maclab:01-lord-knight`). It will refuse delivery with `hey: refusing to deliver — addresses this node via its own cross-node name`. Use plain local target syntax (e.g. `maw hey 01-lord-knight`).
