# Hermes Custom Quick Commands (`quick_commands`) on MacLab

MacLab Hermes seats (`~/.hermes-no1`, `~/.hermes-no5`) define custom slash commands via `quick_commands` in `config.yaml` (`type: exec`). These execute lightweight shell commands or standalone scripts directly without spending LLM tokens.

## Inventory of Built-in Quick Commands

### 1. 9router Monitoring & Quota
- `/limits` — remaining quota across every connection on 9router (`scripts/limits.py` via `GET /api/usage/<id>` on port 20128).
- `/live` — real-time 9router status: in-flight requests, last 10 minutes traffic, failing connections (`scripts/live.py`).
- `/burn` — cumulative 9router spend broken down by model / account / API key + 7-day trend (`scripts/burn.py`).
- `/spend` — daily usage breakdown (`usageDaily` SQLite query).
- `/weekly` — weekly summary usage breakdown (`usageDaily` SQLite query).
- `/errors` — 9router request HTTP status breakdown over the past 24 hours.
- `/providers` — active providers, priorities, and status in 9router database.
- `/router` — count of available upstream models served by 9router.

### 2. Fleet & Seat Orchestration
- `/crew` — active local seats on maclab + federation peers (`scripts/agents.py`).
- `/fleet` — `maw ls -v` listing all maclab seats and active window titles.
- `/seats` — running Hermes gateway and 9router services via launchctl.
- `/panes` — tmux pane inventory across all sessions.
- `/peers` — `maw federation` status across all nodes.
- `/inbox` — `maw inbox status` unread message count.

### 3. Machine Health & Local Ops
- `/host` — hardware specs, load average, thermal state.
- `/load` — 1/5/15m load average + top 5 CPU consuming processes.
- `/mem` — RAM breakdown (active, wired, inactive, free) and swap.
- `/topmem` — top 5 memory consuming processes.
- `/temp` — CPU thermal speed limit and thermal throttling state (`pmset -g therm`).
- `/disk` — root disk usage (`df -h /`).
- `/net` — interface network traffic statistics + tailscale.
- `/ports` — active listening TCP ports on the host.
- `/logs` — largest log files under `~/.maw/logs/` (log bloat guard).
- `/gits` — unpushed commits and dirty working trees across all `MEYD-605` repos (`scripts/gits.py`).
- `/arra` — Arra Oracle health probe (`/api/v1/stats` doc, vector, FTS count).

## Shared Architecture (`r9.py`)
Custom scripts in `~/.hermes-*/scripts/` use `r9.py` as the common API client for 9router:
- Token derivation: `sha256(machineId + "9r-cli-auth" + cliSecret)[:16]` -> header `x-9r-cli-token`.
- Queries local 9router at `http://127.0.0.1:20128` and SQLite DB at `~/.9router/db/data.sqlite`.
