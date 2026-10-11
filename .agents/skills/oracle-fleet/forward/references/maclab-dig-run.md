# dig-run.sh unified miner (maclab)

Scripts live at `~/.grok/skills/dig/scripts/` (pool; may mirror `gmgrok-pool/dig` in Hermes skills).

## Commands

```bash
chmod +x ~/.grok/skills/dig/scripts/dig-run.sh
~/.grok/skills/dig/scripts/dig-run.sh 25 --all --deep
HERMES_HOME=~/.hermes-no5 ~/.grok/skills/dig/scripts/dig-run.sh 15 --deep
```

## Engines merged

| Script | Source |
|--------|--------|
| `dig.py` | `~/.claude/projects/` |
| `dig-grok.py` | `~/.grok/sessions/` |
| `dig-hermes.py` | `$HERMES_HOME/state.db` (default `~/.hermes-no5`) |

`--all` sets `PROJECT_DIRS` to all Claude project dirs for maclab-wide Claude scan.

## Pitfall: dig-grok `collect_session_dirs` return

**Bug:** iterating a `set` of `PosixPath` and subscripting `r[2]` → `TypeError`.

**Fix:**

```python
scanned_roots = sorted({str(root) for _, _, root in sessions})
return sessions, total_found, scanned_roots
```

## Hermes rows

- Skips `source` in `subagent`, `tool` by default
- Title from `sessions.title` or first user message in `messages` table

## User preference (Bo)

Plain `/dig` / `dig.py` alone feels wrong on maclab — always mention **`dig-run.sh`** for "own timeline" including Discord/Hermes sessions.