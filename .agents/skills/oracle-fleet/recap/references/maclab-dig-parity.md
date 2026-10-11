# maclab unified session timeline (dig parity)

## When user asks `/dig`, timeline, or "เจอไทม์ไลน์ตัวเองถูกไหม"

**Plain `dig.py` = Claude Code only** (`~/.claude/projects/`). On maclab that is incomplete for Bo/Nat fleet work (Hermes Discord, Grok CLI, multiple oracle repos).

**Use `dig-run.sh`** — merges Claude + Grok + Hermes (`state.db`).

## Command (canonical on maclab)

```bash
~/.grok/skills/dig/scripts/dig-run.sh 25 --all --deep
```

Other Hermes profile:

```bash
HERMES_HOME=~/.hermes-no7 ~/.grok/skills/dig/scripts/dig-run.sh 15 --deep
```

`--all` sets `PROJECT_DIRS` to all `~/.claude/projects/*` for Claude miner.

## Scripts

| Script | Source |
|--------|--------|
| `dig.py` | Claude `.jsonl` under `PROJECT_DIRS` |
| `dig-grok.py` | `~/.grok/sessions/` (fix: `scanned_roots` must use `for _, _, root in sessions`) |
| `dig-hermes.py` | `$HERMES_HOME/state.db` sessions table |
| `dig-run.sh` | Merges JSON, sorts by `start`, prints table |

## Pitfalls

- Reporting "last session" from `/dig` only → **undercounts** Hermes DM days.
- `dig-grok.py` crash `TypeError` on `r[2]` → fixed by iterating session tuples not set of Path.
- `durationMin` in thousands → stale jsonl files, not human hours.
- Dig scripts under `~/.grok/skills/dig/` may be **outside git** until vendored to `*-oracle/ψ/tools/`.

## Bo preference

When user says **ตามให้ครบ** on timeline: run `dig-run.sh`, do not stop at `dig.py`.

When user asks **รวยๆ** / dense executive summary: one briefing table (identity, stack, gaps, git, next) in Thai — no fluff, prove paths first on maclab.

## Related

- Hermes boot/gateway: `hermes-agent` → `references/oracle-hermes-fleet-maclab.md`
- Fleet triage: `cartographer-oracle/ψ/data/GATEWAY-MESS-TRIAGE-2026-07-02.md`