# maclab HOME STATUS snapshot (GmForge / Bo pre-arrival)

**Trigger:** Bo asks home status, buddy wave, pre-arrival verify, “ทุกอย่างพร้อมไหม” on maclab.

**Rules:** `load-guard` first · every claim verified on host · Thai output for Bo · unhealthy → `maclab:01-lord-knight` not Bo DM unless tagged/critical.

## 0. Preconditions

```bash
bash "$HOME/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/load-guard.sh"
```

If exit 1 → report STANDBY (load/MCP storm/GPU incident), skip heavy probes.

## 1. Output sections (Bo-facing, ภาษาไทย)

Use these headings in order:

1. **Services/procs** — launchd + key PIDs: `ai.hermes.gateway`, `maw-rs serve :3456`, arra bun `:47778`, `com.maclab.arra-cf`, discord-relay agents
2. **Resources** — uptime, load 1/5/15, memory/swap, `/System/Volumes/Data` + external volumes if mounted
3. **tmux / Oracle fleet** — Core5 `5/5` + note `88-sombo` if present; pane command per session
4. **Loop engine** — last line from `~/.maw/gmforge-loop.launchd.log`; open items only if gate YELLOW/RED and not No.1-ACK’d
5. **One-line risk** + **one-line action**

End with short **สรุป Bo** (GREEN/YELLOW/RED โดยรวม).

## 2. Verify commands (batch-friendly)

```bash
# tmux Core5 + sombo
tmux list-sessions 2>/dev/null | grep -E '^(00-gmgrok|01-lord-knight|04-mimo|05-gmforge|08-agy-nano2|88-sombo):'

# maw-rs + arra
curl -sf http://127.0.0.1:3456/_health
curl -sf http://127.0.0.1:47778/ | head -c 200

# Hermes
launchctl list | grep ai.hermes.gateway
pgrep -fl 'hermes_cli.main gateway run'
tail -n 5 "$HOME/.hermes-no5/logs/gateway.log"

# loop-engine last cycle
tail -n 3 "$HOME/.maw/gmforge-loop.launchd.log"
```

Quick script: `scripts/maclab-audit-probe.sh` (from recap skill dir).

## 3. Common YELLOW causes (not RED by default)

| Signal | Meaning |
|--------|---------|
| `hermes_gw=NO` in loop log but launchctl PID + pgrep OK | Probe regex bug — see `maclab-gmforge-audit-probes.md` |
| `com.maclab.gdrive-backup` exit 127 | Often `zstd: command not found` in backup script — ops debt, not fleet down |
| `05-gmforge` pane = `bash` not `grok` | Expected Hermes audit shell post-cutover |

## 4. Entrypoints doc drift

If `LIVING-DOCS/paths-and-entrypoints.md` is missing on host (common on maclab 2026-07), boot from:

1. `lord-knight-oracle/ψ/data/BLUEPRINT-INDEX.md`
2. `lord-knight-oracle/ψ/data/maclab-home/HOME-BLUEPRINT.md`
3. `lord-knight-oracle/ψ/data/FLEET-MASTER-MAP.md`

Note in Bo report that fallback was used — do not invent paths.

## 5. “7 tmux” vs Core5

Canonical probe expects **5** Core5 sessions (`maclab-fleet-tmux-probe.sh`). **`88-sombo`** is a 6th maclab oracle tmux. Hermes gateway is **launchd**, not a 7th tmux. If Bo asks “7/7”, report **Core5 count + sombo + explicit gaps**; do not guess a 7th session name.

## 6. Related

- `references/maclab-gmforge-audit-probes.md` — AUDIT lane detail
- `references/maclab-fleet-tmux-core5.md` — session naming
- `references/maclab-bo-personal-grok-media.md` — Bo face vault + Grok image/video
- `lord-knight-oracle/ψ/data/maclab-home/HOME-BLUEPRINT.md` — canonical agent table