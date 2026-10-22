# GOAL: agy seats (No.6+No.8) fully linked to HAOS and levelled toward the Claude seats; /goal works on agy

status: ACTIVE
turns: 0
max_turns: 30
blocked_on: 

## Criteria (ticked only by `goal.py check` running the command)
- [x] No.6 arra bearer accepted by HAOS add-on (HTTP 200) — verify: `bash /Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/tools/arra-bridge-probe.sh`
- [x] agy goal adapter selftest passes — verify: `bash /Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/tools/agy-goal-stop-selftest.sh`
- [x] goal Stop+SessionStart hooks installed in No.6 hooks.json — verify: `python3 -c "import json;d=json.load(open('/Users/admin/.no6-home/.gemini/config/hooks.json'))['goal'];assert 'Stop' in d and 'SessionStart' in d"`
- [x] parity report written — verify: `test -s /Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/memory/2026-10-22_agy-vs-claude-seat-parity.md`
- [ ] No.6 live seat runs the fixed arra bridge — verify: `ps -eo command | grep -q '^/usr/local/bin/bun run /Users/admin/.no6-home/arra-memory/agy-mcp-bridge.ts'`
- [ ] No.8 live seat no longer uses the shared bridge (no process on old path) — verify: `! ps -eo command | grep -q '^/usr/local/bin/bun run /Users/admin/.arra-memory/agy-mcp-bridge.ts'`

## Log
- 2026-10-22 12:49 created
- 2026-10-22 12:49 check: 3/6 pass
- 2026-10-22 12:49 check: 4/6 pass
