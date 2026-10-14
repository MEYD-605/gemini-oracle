# Handoff: D-034..D-038 Fleet Alignment, ClubSGame MQTT & MCP Parity, and Google Managed Agents / AGY 1.3.5 Audit

**Date**: 2026-10-14 13:59 +07
**Context**: ~31% of 1M (`ag/gemini-4-argon-medium` per D-038)
📡 Session: 88852f34 | lord-knight-oracle

## What We Did
- **D-034..D-035 No.1 Root-Cause Cleanup & 5-Min Escape Fix (`Commit 267d58d6`)**:
  - Identified and paired with `88-sombo` to fix the 5-minute `tmux send-keys -t 01-lord-knight Escape` bug in `oracle-herdr-up.sh:35` that was interrupting No.1's active turns every 300s (`[Request interrupted by user]`).
  - Archived duplicate `lord-knight-oracle/.mcp.json` to `ψ/archive/dot-mcp.json.20261014` so `~/.claude-no1/.claude.json` is the single MCP source of truth; removed `rtk` Bash truncation and set `x-9router-token-saver: off`.
  - Recorded permanent feedback rule (`feedback_never_edit_overwrite_discord_messages.md`): never use `edit_message` to overwrite sent Discord messages (Nothing is Deleted).
- **ClubSGame (`100.87.51.122`) MQTT `client.conf` Migration & MCP Parity**:
  - Patched all 5 Bun scripts in `C:\Users\ClubSGame\bin\` (`fleet-context-watch-clubsgame.ts`, `fleet-mqtt-inbound.ts`, `mqtt-publish.ts`, `oracle-send.ts`, `clubsgame-bridge.ts`) to dynamically read credentials from `C:\Users\ClubSGame\.config\fleet-mqtt\client.conf` (backups in `C:\Users\ClubSGame\bin\backups\mqtt-20261014\`, 0 literal passwords in `bin\`, verified `mqtt-publish.ts` `rc=0`).
  - Wired `arra-memory`, `arra-v4` (`http://100.83.0.1:13939/mcp/default`), and `structor` (`http://100.83.0.1:18091/mcp`) across `C:\Users\noone\.gemini\config\mcp_config.json`, `E:\Agents\no10-oracle\.mcp.json`, and `C:\Users\noone\.claude-no3\.claude.json`, plus added 6 MCP allow-list rules to `10-no10`'s `settings.json`.
  - Upgraded `agy.exe` on ClubSGame from `1.3.4` → **`1.3.5`** (matching MacLab `agy 1.3.5` with `/compact` support).
- **D-036 Tool & Skill Routing Matrix (`Commit c520418`)**:
  - Added **Tool & Skill Routing Matrix** to `lord-knight-oracle/CLAUDE.md`, `E:\Agents\no10-oracle\GEMINI.md`, `C:\Users\noone\AppData\Local\hermes\SOUL.md` (`joker`), and `profiles\golf\SOUL.md` (`golf`); retired legacy `maw hey` instructions in favor of MQTT (`send_to_oracle` / `oracle-channel`).
  - Verified `fleet-drift-check.py` passing `198 checks`.
- **D-037 & D-038 Model Alignment (`Commits 29ca3b8`, `8c6e1d3`)**:
  - Transitioned No.1 to `ag/gemini-4-argon-medium` per Bo order (D-038).
- **Memory & Research for Master Bo**:
  - Recalled and permanently saved Bo's pet Monk Parakeet memory (`user_bo_monk_parakeet_devby.md`: male yellow Lutino "เด็บบี้ / Devby / dev" + new 4–5 month female; no nest box before 10–12 months to prevent Egg Binding).
  - Audited Google Gemini API Managed Agents (`ai.google.dev/gemini-api/docs/agents` & `agent-environment`) vs `Grok Bot VM` (`8 Cores / 16GB RAM / 126GB Disk`) and `agy 1.3.5` subscription features (`gemini-4-argon-*`, `claude-opus-5-5-*` / `claude-sonnet-5-5-*` on subscription, `/compact`, `agy remote-control`).

## Pending
- [ ] Sync remaining 4 drift-check items spotted on MacLab (`No.5` `focus.md` freshness > 48h, `No.4`/`No.6`/`No.8` model pin vs `desired-state.yaml`) with `88-sombo`
- [ ] Execute HAOS broker MQTT password rotation when Master Bo gives final GO (MacLab, Grok VM, and ClubSGame scripts are now on `client.conf`)

## Next Session
- [ ] Run `python3 scripts/fleet-drift-check.py` on startup and verify 0 ❌ across all 198 checks
- [ ] Coordinate with `88-sombo` on any pending model pin updates in `sombo-oracle/fleet/desired-state.yaml`

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/CLAUDE.md`
- `/Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/ψ/tools/oracle-herdr-up.sh`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/fleet/desired-state.yaml`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/fleet-drift-check.py`

## Addendum 14:07 — after this handoff was written
- **D-039**: Bo 14:00 "เดี๋ยวมึงเปลี่ยนกลับเป็น opus5.5 ด้วย" → No.1 is now `cc/claude-opus-5-5` (pin, `settings.json`, `desired-state.yaml`, `CLAUDE.md` commit `2270b61`). Drift-check confirms pin + settings + live env, **198 checks · ❌ 0 · ❓ 0** (the 4 ❌ listed under Pending were cleared by Sombo before 14:05).
- Gave Bo an honest day summary (Discord `1559824514441810044`): roots fixed (Escape bomb, MQTT creds, MCP parity, Grok VM, LightCraft); still weak: 4 model switches in one day, No.6 told Bo Managed Agents use the same token (wrong — separate pay-as-you-go), No.3 context at 675k locked the Gemini quota for 31 min, MQTT password still unrotated.
- **Lesson for next session**: engine churn is itself the instability. Hold `cc/claude-opus-5-5` unless Bo changes it.
