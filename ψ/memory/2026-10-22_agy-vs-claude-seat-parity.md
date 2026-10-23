# agy seats vs Claude seats — HAOS link + parity audit (No.6, 2026-10-22 12:50)

Trigger: Bo 12:43 "มึงสองคน (No.6 + No.8) ดูดิว่าต่อเข้า haos เรียบร้อยหรือยัง พัฒนาทีม agy ให้ทำทีมรุ่นพี่ claude ใช้ /goal".
Every row below was read from a file or a command this turn. "unverified" = not checked.

## 1. HAOS link — what was broken

| Check | Result | Evidence |
|---|---|---|
| arra-memory MCP from No.6 | **401 since ≥10-22 02:28** | `list_fleet` / `recall_memories` → `initialize: 401` |
| arra-memory MCP from No.8 | same bridge, same file → expected 401 (unverified live) | bridge PID 54316 under agy 54234 reads `~/.arra-memory/agy-mcp-bridge.ts` |
| Cause | `~/.arra-memory/haos-token.txt` now holds the **HA long-lived token (JWT, 183 B)**, not the arra bearer | handoff 2026-10-21_2345 line 4: "LLT ~/.arra-memory/haos-token.txt" (No.1 HAOS owner reset, file mtime 10-21 22:48); `agy-mcp-bridge.ts` `HAOS_TOKEN = ${DIR}/haos-token.txt` is sent as the `Authorization: Bearer` |
| Old 64-hex arra bearer | still valid | curl `/mcp initialize` with the token from gemini-oracle `.mcp.json` → HTTP 200 |
| MQTT inbound for agy seats | works | this session received `[channel:haos/main]` messages; `list_fleet` shows 06/08 online |
| MQTT outbound `oracle-send` | publishes to `oracle/<t>/general/in`; Sombo's alerts use `oracle/<t>/main/in` | `/usr/local/bin/oracle-send` source; audit §6 |
| Presence | 06/08 show no version (Claude seats show `v0.1.0`) | `list_fleet` |

### Fix applied (No.6 only, private)
- Did NOT edit the shared `~/.arra-memory/haos-token.txt` (No.1's HA pipes use it).
- Private bridge copy `~/.no6-home/arra-memory/agy-mcp-bridge.ts` (DIR absolute, token file `arra-bearer.txt`, chmod 600).
- `~/.no6-home/.gemini/config/mcp_config.json` arra-memory args → private bridge (backup `.bak.20261022-arra-bridge`).
- Standalone stdio test of the private bridge: `list_fleet` returned the full fleet (works).
- Live session still bound to the dead bridge (killed PID 53638; `agy mcp disable/enable` does NOT respawn it → needs seat restart).
- No.8 told the same recipe via `oracle/08-agy-nano2/main/in`; No.1 told the root cause + durable fix via `oracle/01-lord-knight/main/in`.

## 2. Parity: Claude seats vs agy seats

| Capability | Claude seat (No.5 settings, desired-state) | agy seat (No.6 files) | Gap |
|---|---|---|---|
| Hook events | 21 event types in `~/.claude-no5/settings.json` | `hooks.json`: 9remote (4 events) + discord-progress (Pre/PostInvocation, Stop); settings `SessionStart` cbm reminder | much thinner |
| `/goal` engine | `goal.py hook-stop` Stop hook blocks stopping until commands pass | none; /goal on agy is the host's own loop, no `ψ/goals` state, no command-verified criteria | **biggest gap** |
| Fallback model chain | `fallback: cc/claude-sonnet-5,ag/gemini-3.8-flash-high` (desired-state) | none in `agy_seats` | a 429 like No.5's Fable limit would hang an agy seat the same way |
| Model drift check | model pin file + drift log | `fleet-model-get.py` for No.6 (launcher reads label→slug); `No.8` live model differs from yaml label style | partial |
| Presence / version | oracle-channel plugin → `v0.1.0` | bridge-only presence, no version | cosmetic + can't tell stale |
| Statusline | enabled | `statusLine.enabled: false` | minor |
| Drift coverage | models, hooks, commands, rtk | `agy_seats` lists only agent_home/repo/model/tag/mcp_required | no check that arra-memory actually answers (the 401 went unseen ~14 h) |

## 3. Proposed upgrades (no seat state changed beyond §1 fix)

1. **drift-check row "arra-memory answers"**: curl `/mcp initialize` with each agy bridge's token; ❌ on non-200. Would have caught the 401 within one tick. (Sombo/No.1: `fleet-drift-check`.)
2. **Split the shared files**: HA LLT → `ha-llt.txt`; arra bearer → what the bridge reads. (No.1.)
3. **agy `/goal` port**: adapt `goal.py` to agy's `Stop` hook (agy already has a `Stop` hook slot used by discord-progress). **Unverified**: whether agy's Stop hook can return a block decision. Needs a sandbox probe (`/tmp/no6_*`) before any claim.
4. **Fallback chain for agy seats** in desired-state + launcher (`start-no6.sh` already has a yaml-then-fallback model pattern at lines ~13-21 to copy).
5. **`oracle-send` default topic** → `main/in` (or document that `general/in` is what Claude seats' plugin reads — unverified).

Owner map: 1-2 No.1/Sombo · 3-5 No.6 proposes, Bo decides (touches shared hooks + desired-state).
