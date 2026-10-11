# HOME STATUS snapshot (maclab)

GmForge / Bo pre-arrival. Thai output. `load-guard` first.

## Sections (order)

1. Services — `maw-rs :3456`, `ai.hermes.gateway`, arra `:47778`, discord-relay
2. Resources — uptime, load, RAM, swap, Data volume
3. tmux — Core5 `5/5` + `88-sombo`; pane commands
4. loop-engine — `tail ~/.maw/gmforge-loop.launchd.log`
5. One-line risk + action

## Verify batch

```bash
bash "$HOME/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/load-guard.sh"
curl -sf http://127.0.0.1:3456/_health
curl -sf http://127.0.0.1:47778/ | head -c 200
tmux list-sessions | grep -E '^(00-gmgrok|01-lord-knight|04-mimo|05-gmforge|08-agy-nano2|88-sombo):'
```

## Entrypoints fallback

If `LIVING-DOCS/paths-and-entrypoints.md` missing: `lord-knight-oracle/ψ/data/maclab-home/HOME-BLUEPRINT.md`, `BLUEPRINT-INDEX.md`.

## YELLOW not RED

- gdrive-backup exit 127 (`zstd` missing)
- loop `hermes_gw=NO` with live gateway PID
- `05-gmforge` pane `bash` (Hermes audit shell)

Unhealthy → `maclab:01-lord-knight` via maw-rs, not Bo unless critical.