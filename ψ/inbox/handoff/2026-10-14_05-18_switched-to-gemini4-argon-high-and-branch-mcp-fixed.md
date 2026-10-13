# Handoff: No.1 Upgraded to `ag/gemini-4-argon-high` (D-034) & Root-Cause Cleanup

**Date**: 2026-10-14 05:18 +07 · Prepared by No.88 Sombo per Master Bo order ("ดีมากเปลี่ยน no1 ไห้ไช้ Gemini 4 high" + "ดูมันน่าจะมีปัญหาอะไรทำไมมันไม่ค่อยเก่ง")

## Why No.1 Was Sluggish / Underperforming (5 Root Causes Fixed)
1. **425-Message / 303.3k-Token Context Rot**: Session `9668ee19-f443-4e13-aa05-5ed6ce8b0784` had run continuously for 4 days (since Sunday 11 AM, 215 API calls, $31.60) without `/clear`, causing severe lost-in-the-middle degradation.
2. **4-Day-Old Process Missing `arra-v4` & `structor` MCPs + `DISABLE_AUTOUPDATER=1`**: `pid 88879` predated last night's MCP upgrades, and `lord-knight-oracle/.mcp.json` overrode `relic` with the slow TypeScript `bun run .../agents-relic/src/mcp.ts` instead of the compiled `/Users/admin/.local/bin/relic-mcp` binary, and lacked `arra-v4` (:3939) and `structor` (:8091). Fixed in `.mcp.json`.
3. **Repo Checked Out on Old Branch (`psi/2026-08-30-fleet-map-and-dream-retraction`)**: Even after merging PR `#73` to `origin/main`, local working directory was still on `psi/2026-08-30-...` where `CLAUDE.md` still said `cc/claude-opus-5-5` and `focus.md` was 18h stale (22 lines > 20 max). Merged to `main` and updated both.
4. **Orphaned 21-Hour Background Shell (`pid 93167`)**: An old `until P=$(pgrep -f "name No.88 Sombo"...)` loop from 2026-10-13 07:55 AM was still spinning `sleep 5` inside No.1. Terminated.
5. **Switched Model to `ag/gemini-4-argon-high` (D-034)**: Updated `~/.claude/channels/discord-no1/anthropic-model`, `~/.claude-no1/settings.json`, `sombo-oracle/fleet/desired-state.yaml`, and `lord-knight-oracle/CLAUDE.md`.

## Current State & Open Items
- MacLab 8 seats are 100% green (`fleet-drift-check.py` = `173 checks · ❌ 0 · ❓ 0`; `test-seat-tubes.py` = `8/8 seats · 7/7 Vital Tubes`).
- D-025 MacLab items (No.2 `ag/gemini-3.8-flash-high[1m]`, No.4 `ag/gemini-4-argon-medium`) are already live and verified.
- Still open (waiting on Bo GO): MQTT password rotation on ClubSGame (4 bun scripts + No.10 relay rebuild).
