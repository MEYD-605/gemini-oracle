# Handoff: restart recovery · bo-personal-vault · ctx-autoforward · Git Central · Oracle Soul Portal

**Date**: 2026-10-25 12:27 · **Context**: 42% (over 40% → auto-forward)
📡 Session: 4c84aa7c | sombo-oracle | ~2h10m
Retro: `ψ/memory/retrospectives/2026-10/25/12.26_restart-vault-autoforward-soul-portal.md`

## ⚡ FIRST THING
- **Bo talks on Mattermost DM** `chat_id=mm-zxbf5ks4gbrf7jz4zzaqk97pfy` (oracle-channel reply).
- **Bo's next ask: help him edit photos** ("เดี๋ยวมึงต้องเตรียมตัวช่วยกูแต่งรูปด้วย" 12:18). Load skill **photo-cull** then **photo-edit** BEFORE touching a RAW. Rules `scripts/lightcraft/STANDARD.md`. Render parallelism max 2 (heat).
- arra-memory MCP failed at boot (ECONNRESET) — HAOS :8099 itself is fine; reconnect on restart.

## What We Did (all verified, decisions.md has evidence)
- **Restart/heat**: duplicate idle `claude` windows (88-sombo:0, 02-high-wizard:0) each reindexing → killed; 88.7→63°C. Later I caused 91°C with full-history gitleaks on mimo-oracle (No.4 caught) → `.cbmignore` (sunton-buddy, esp32-vnc) 248cba44; No.4 did the same for mimo-oracle 14ad805.
- **bo-personal-vault** (caretaker = No.88, vote No.88+No.4): 10 files out of PUBLIC gemini-oracle (PR #12 merged, vault 1ac645e); copies into vault 96df42f, c394571 (No.5 cartographer 11 files) — **sources NOT deleted**; boot rule in every seat (No.2 keeps it in CLAUDE_safety.md); nightly `scripts/bo-vault-check.py` launchd 03:40 (public repos via API).
- **MM**: No.1 bot `@lord-knight` + bridge com.maclab.mm-bridge-no1 (9ca14357); No.4's slash router hardened (127.0.0.1 + MM command token, seat-control Bo-only, adapter props spoof) + launchd com.maclab.mm-slash-router (98 cmds × 3 teams); No.4 then made --register manual + token file.
- **ctx-autoforward** Stop hook in sombo/no1/no2/no5 (6adf5764, 973f3f76): ≥40% → block → /forward → /clear → wake prompt. Live-tested on No.1 (session b4f9c419→95f55293). /goal DONE.
- **Models (Bo)**: No.6 → Gemini 4 Argon (Medium) (respawned, "argon ok"); No.8 stays 3.8 Flash High; No.4 agent.model aligned to argon. My mistake: shared ~/.gemini settings flipped No.8 → reverted same minute.
- **drift-check** 25 ❌ → 1 ❌ (gmgrok) · 0 ❓ (8a1ee927): launchd live pid ok, ClubSGame HAOS VM absent=Off, agy settings row removed.
- **Git Central** (MM team clubs-dev, GitHub plugin v3): webhooks on 7 active repos (ping 200), subscriptions → `pr-and-issues`; public repo events post (gemini branch test ✅). /goal DONE.
- **Oracle Soul Portal** (`scripts/soul-portal/`, a153d0ee): HA sidebar "Oracle Soul" (admin, iframe) → 100.83.0.1:18077/<key>/ (key ~/.config/soul-portal.key 600; launchd com.maclab.soul-portal). Reads HAOS :8099 read-only; Nat's add-on untouched.
- **HAOS createdBy merge** (vote No.4+No.88): 12 aliases merged (387 mem) with full id snapshot `ψ/data/haos-merge-20261025/` (e246ed15).
- PR #26 sombo merged; **PR #27** open (today's 18 commits).

## Pending
- [ ] **Bo: `/github connect`** in MM (OAuth revoked 10-01) → private repo events (sombo PR #27 etc.) will post in Git Central
- [ ] **7 HAOS merges HELD** (API returns max 100 rows; snapshot incomplete): No.6 Gemini 481, maclab:no6 129, maclab:05-gmforge 464, 01-lord-knight:maclab 122, [maclab:04-mimo] 110, No.8 Agy Nano2 129 → need full id list (kind+q buckets, or read via HA backup/DB) before merge
- [ ] Overlapping syncs (Bo: "ไม่ใช่อัพแล้วทิ้ง"): arra-autosync.sh 30m (files→:8099) vs fleet-memory-sync.py 1h (focus.md only) vs arra-clubsgame-sync (not loaded) vs arra-cf-incremental (CF edge, different). Decide with No.1/No.4; make scripts send canonical createdBy (No.4 flagged `scripts/sync-grouped-client-memory.py:240` "04-mimo:{group}")
- [ ] gmgrok-oracle 113 held commits: Notion token in tracked .claude/mcp.json + dead 9router key → **No.1** (rotate/scrub before push); PR #16 not merged
- [ ] mimo-oracle history secrets (mcp.json, ψ/import/*) → No.4 + No.1
- [ ] Bo decisions: gemini-oracle git history (10 files still in old commits) rewrite / private / leave · delete old vault copies (lord-knight, gmlab, gmgrub, gmforge, gmaicore, sombo draft) · No.4 USER.md l.21 full names
- [ ] ctx-autoforward not on Hermes/agy seats (No.4/No.00/No.6/No.8) — Bo didn't answer
- [ ] relic4-scan clone in ~/.no6-home/ghq — No.6 may remove after portal (No.6 suggested)

## Next Session
- [ ] DM Bo return report (MM) + ask which photos / which job
- [ ] Photo work: photo-cull → photo-edit
- [ ] Then: full snapshot + finish 7 HAOS merges; sync-job consolidation with No.1/No.4

## Key Files
- `scripts/ctx-autoforward.py` · `scripts/bo-vault-check.py` · `scripts/soul-portal/{soul,server}.py` · `scripts/fleet-drift-check.py`
- `~/srv/mattermost/bridge/mm_slash_router.py` (+ repo copy scripts/mattermost/)
- `ψ/decisions.md` (today: 6 entries) · `ψ/data/haos-merge-20261025/` · `ψ/learn/bo-personal-inventory.md`
