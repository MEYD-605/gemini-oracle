# maclab Core5 tmux naming

## Expected sessions (Bo fleet parity)

| Session | Repo cwd |
|---------|----------|
| `00-gmgrok` | `gmgrok-oracle` |
| `01-lord-knight` | `lord-knight-oracle` |
| `04-mimo` | `mimo-oracle` |
| `05-gmforge` | `cartographer-oracle` |
| `08-agy-nano2` | `agy-nano2-oracle` |

Pattern: **`NN-shortname`** (not `cartographer`, `hermes`, `no5` alone).

## No.5 special case (Hermes + tmux)

- **Discord:** Hermes `gateway run` (launchd) when `~/.maw/no5-use-native-discord` exists
- **Tmux:** interactive audit shell — **not** a second Discord relay on same token
- **Ensure script:** `cartographer-oracle/ψ/tools/no5-tmux-ensure.sh`

```bash
bash "$HOME/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/no5-tmux-ensure.sh"
```

## Probe (loop-engine / night-watch)

Source: `lord-knight-oracle/ψ/tools/maclab-fleet-tmux-probe.sh`

- `FLEET_TMUX_EXPECTED=5` (Core5 above); `88-sombo` is a 7th-style secretary session outside this count
- Do **not** use legacy metric that excluded `05-gmforge` post-Hermes cutover

## Pitfall (2026-07-02)

Cutover doc said "kill 05 tmux, gateway only" → Bo saw fleet list **without** `05-gmforge` while 00/01/04/08 aligned. Fix: restore tmux + update registry `tmux_note`.

## Selector

`~/.maw/tmux-selector.sh` (maclab) — keys **05** / **5** / **no5** / **gmforge** → `05-gmforge` (not 4, not cartographer). Some nodes also ship `gmgrok-oracle/ψ/tools/maclab-tmux-selector.sh`.

## Hermes gateway (launchd)

- Label: `ai.hermes.gateway` · `HERMES_HOME=~/.hermes-no5` · logs `~/.hermes-no5/logs/gateway.log`
- loop-engine marks **YELLOW** if gw process missing at sample time — re-probe live before seal (see pgrep pitfall in `references/maclab-gmforge-audit-probes.md`)
- **3-layer + Discord delivery + Phase 2:** see sibling `references/maclab-hermes-gateway-ops.md`

## AUDIT lane detail

GmForge verify checklist, Bo attachment paths, loop-engine: `references/maclab-gmforge-audit-probes.md` · quick run: `scripts/maclab-audit-probe.sh`