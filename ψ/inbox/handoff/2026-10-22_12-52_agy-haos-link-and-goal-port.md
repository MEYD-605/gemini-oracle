# Handoff — No.6 /goal: agy seats ↔ HAOS + parity (2026-10-22 12:52)

Bo 12:43 (Discord, /goal): "มึงสองคน (No.6 + No.8) ดูดิวว่าต่อเข้า haos เรียบร้อยหรือยัง พัฒนาทีม agy ให้ทำทีมรุ่นพี่ claude ใช้ /goal".

ACTIVE goal file: `ψ/goals/2026-10-22_12-49_agy-seats-*.md` — run `python3 ~/.claude/hooks/goal.py check` first. Criteria 1-4 pass; 5 (my live bridge) passes after this restart; 6 waits on No.8.

## Done (verified)
- Root cause of arra-memory 401 on agy seats: `~/.arra-memory/haos-token.txt` was overwritten with the HA LLT by No.1's HAOS owner reset (10-21 22:48); `agy-mcp-bridge.ts` sends that file as the arra bearer. Old 64-hex bearer still 200. Probe: `ψ/tools/arra-bridge-probe.sh [file]`.
- No.6 fix (private, shared file untouched): `~/.no6-home/arra-memory/{agy-mcp-bridge.ts,arra-bearer.txt}`, `~/.no6-home/.gemini/config/mcp_config.json` → private bridge (backup `.bak.20261022-arra-bridge`). `agy mcp enable/disable` does not respawn a live bridge; only a seat restart does.
- agy `/goal` port: `ψ/tools/agy-goal-stop.py` (Stop → `{"decision":"continue"}`, SessionStart re-inject, fail-open) + selftest `ψ/tools/agy-goal-stop-selftest.sh` (5/5). Installed as `goal` key in `~/.no6-home/.gemini/config/hooks.json` (backup `.bak.20261022-goal-stop`). Contract source: agy-customizations/docs/hooks.md §6.
- Parity report: `ψ/memory/2026-10-22_agy-vs-claude-seat-parity.md`.
- No.8 told the fix via MQTT `oracle/08-agy-nano2/main/in`; No.1 told root cause via `oracle/01-lord-knight/main/in`.

## Next after restart
1. `arra-memory` MCP should answer (try `list_fleet`). If not: `bash ψ/tools/arra-bridge-probe.sh`.
2. Confirm the goal hook is LIVE (unverified until a real turn end): with ACTIVE goal and a failing criterion, ending a turn must be refused.
3. No.8: check pane `08-agy-nano2`; if no reply, criterion 6 stays open → `goal.py block "No.8 restart needed"` and tell Bo.
4. Proposals for Bo/No.1/Sombo are in the parity report §3 (drift row, file split, fallback chain, oracle-send topic).

Do not merge gemini-oracle PR #11 / do not push main (Sombo 09:36) — still holding for Bo.
