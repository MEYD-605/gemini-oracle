# Grok runtime truth vs stale launcher refs

Session lesson: when agent identity or engine looks contradictory, prefer **live runtime evidence** over older launcher/docs.

## What was verified
- `ps` showed live `grok --always-approve --continue` processes.
- `tmux` had an active `01-lord-knight` session.
- `lord-knight-oracle-snapshot/AGENTS.md` and `.grok/infra.md` both state No.1 is **Grok CLI**.
- Older files can still mention `claude` paths/launchers; treat those as stale until the live process confirms otherwise.

## Verification order
1. Check live process / tmux session first.
2. Check the current skill docs or snapshot lane.
3. Only then patch stale launcher references.

## Pitfall
Do not “correct” the runtime based on a single stale launcher file. If the live process, session name, and lane docs agree, the stale file is drift — not truth.
