# Maw Bus & Federation Communication Reference

## Overview
`maw hey` and `maw federation` enable inter-agent and cross-node communication across the Oracle fleet over Tailscale Mesh (port 3456).

## Command Syntax & Targets

### `maw hey` Usage
```bash
maw hey <target> <message> [--inbox]
maw hey <target> -f <file>   # read message from file
maw hey <target> -          # read message from stdin
```

### Target Formats
- `<node>:<session>` — Canonical cross-node form (window 1), e.g. `ai-core:10-no10`
- `<node>:<session>:<window>` — Target specific tmux window cross-node
- `<oracle-window>` — Same-node window name (local-only), e.g. `00-gmgrok`
- `local:<agent>` — Explicit same-node target
- `<session>:<window>[.<pane>]` — Target from `maw ls -v`

### Options
- `--inbox`: Write to receiver's inbox only; skips injecting into active tmux pane.

## Discovery & Status Commands

```bash
maw federation status    # Check online status of peer nodes across network
maw locate <agent>       # Locate agent repo path, node manifest, and ψ/ status
maw ls -v                # List local tmux windows, session names, and targets
```

## Troubleshooting & Cross-Node Configuration

- **`black` (`black.alchemycat.org`):** `black` uses public domain routing or WireGuard rather than native Tailscale.
- **`maw hey` Target Requirement (Tmux vs Daemon):** `maw hey` relies on targeting active `tmux` sessions. Autonomous agents running as background daemons outside of `tmux` (such as Hermes running `hermes gateway run`, e.g., `no10` on `black`) cannot be located (`maw locate`) or injected into via `maw hey`. To make a daemon agent reachable via `maw hey`, either wrap its process in a `tmux` session (e.g., `tmux new-session -d -s no10 ...`) or use an adapter/inbox poller.
- **Config Sync:** To connect `black` into `maw federation status`:
  1. Add `black` to local `~/.config/maw/maw.config.json` under `namedPeers` (`{"name": "black", "url": "http://black.alchemycat.org:3456"}`) and `peers` (`"http://black.alchemycat.org:3456"`).
  2. Ensure `federationToken` matches across both nodes (default: `"soul-brews-oracle-2026"`).
  3. Restart/reload `maw` process (`pkill -HUP maw` or restart `maw-rs`) to pick up new peer configurations.

