# maclab GmForge (No.5) AUDIT lane — live probes

Use when Bo buddy wave, Hermes cutover checks, loop-engine gate, `05-gmforge` tmux hold, or **HOME STATUS** (see `references/maclab-home-status-snapshot.md`).

## Two layers (do not conflate)

| Layer | What | Prove |
|-------|------|--------|
| **Discord ingress** | Hermes `gateway run` (launchd `ai.hermes.gateway`) | `launchctl list \| grep ai.hermes.gateway` + `pgrep -f 'hermes_cli.main gateway run'` (unescaped dot on macOS) |
| **Audit shell** | tmux `05-gmforge` → `hermes chat` (not grok post-cutover) | `tmux has-session -t 05-gmforge` + pane cmd `python*` / `hermes*` |

Canonical probe source: `lord-knight-oracle/ψ/tools/maclab-fleet-tmux-probe.sh`

- `FLEET_TMUX_EXPECTED=5` — sessions `00-gmgrok` `01-lord-knight` `04-mimo` `05-gmforge` `08-agy-nano2`
- `88-sombo` — 6th maclab oracle tmux; not in Core5 count
- `maclab_hermes_no5_gateway_ok` — both launchd label **and** running process (gw restart → transient `hermes_gw=NO` in loop log)

### pgrep pitfall (macOS)

`maclab_hermes_no5_gateway_ok` in `lord-knight-oracle/ψ/tools/maclab-fleet-tmux-probe.sh` uses `pgrep -f 'hermes_cli\\.main gateway run'` — often **false-negative** while gateway is healthy (loop-engine logs `hermes_gw=NO` spuriously). Re-probe: `pgrep -fl 'hermes_cli.main gateway run'` (unescaped dot) + launchctl PID for `ai.hermes.gateway`. Skill `scripts/maclab-audit-probe.sh` uses the fixed check; fleet fix belongs in lord-knight probe (gmgrok EXEC), not in audit conclusions alone.

## Hermes No.5 paths

| Item | Path |
|------|------|
| `HERMES_HOME` | `~/.hermes-no5` |
| Gateway plist | `~/Library/LaunchAgents/ai.hermes.gateway.plist` |
| Gateway logs | `~/.hermes-no5/logs/gateway.log` |
| Cutover flag | `~/.maw/no5-hermes-mode` (keepalive skips legacy grok respawn in `~/.maw/gmforge-keepalive.sh`) |

**Pitfall:** Bo/docs mentioning `~/.maw/no5-tmux-ensure.sh` — script lives under repo:

`cartographer-oracle/ψ/tools/no5-tmux-ensure.sh` (calls `ψ/tools/gmforge-keepalive.sh` for Hermes tmux spawn).

Menu attach: `~/.maw/tmux-selector.sh` keys `05` / `5` / `no5` / `gmforge`.

## loop-engine (Jensen GCACFRR)

- Script: `cartographer-oracle/ψ/tools/gmforge-loop-engine.sh`
- launchd: `com.maclab.gmforge-loop` (6h)
- Logs: `~/.maw/gmforge-loop.launchd.log` (launchd) · also `~/.maw/gmforge-loop.log`
- Gate **YELLOW** with `tmux_fleet=5/5` often means `hermes_gw=NO` at sample time — re-probe live before reporting RED.

## maw-rs + arra

| Service | Prove |
|---------|--------|
| maw-rs `:3456` | `curl -sf http://127.0.0.1:3456/_health` (often no `maw-rs.log`) |
| arra `:47778` | `curl -sf http://127.0.0.1:47778/` → `status: ok` (`/_health` may 404) |

**load-guard:** `cartographer-oracle/ψ/tools/load-guard.sh` before heavy probes.

## Discord Bo attachments (maclab Hermes)

Inbound images land under **relay state dir**, not `HERMES_HOME`:

`~/.claude/channels/discord-no0/inbox/attachments/<chat_id>/`

There is typically **no** `~/.hermes-no5/inbox/attachments`. Doc drift if matrix implies Hermes-home path only.

Canonical Discord ops: `lord-knight-oracle/ψ/data/discord-capability-matrix.md` · gaps: `ψ/data/FLEET-GAP-REGISTRY.md` (GAP-DISCORD-03 CLOSED 2026-07-02).

## Report shape (Bo buddy / No.1)

- **AUDIT lane:** facts + drift only; escalate to `maclab:01-lord-knight` (not Bo DM unless tagged).
- **FYI No.1:** `POST http://127.0.0.1:3456/api/send` → `target: 01-lord-knight` or `/hey`
- **ACK 1-line** example: `[maclab:05-gmforge] AUDIT GREEN · Hermes gw+tmux05 · loop live GREEN · attachments=discord-no0/inbox/attachments`

Run bundled probe: `scripts/maclab-audit-probe.sh` (from this skill dir).