# Handoff: Mattermost `clubs-dev` + Hermes Daemon + FB Posting Pipeline + `git-sweep` `/goal` DONE (`2026-10-30 21:36`)

**Date**: 2026-10-30 21:36 +07 · **Why restart**: Context reached `42%` (threshold `40%`, `ctx-autoforward.py` Stop hook).
**Model**: `ag/gemini-4-argon-high[1m]`

## FIRST THING ON RETURN (SOMBO RETURN PROTOCOL)
1. Read this handoff and `~/.claude/channels/discord-sombo/progress/statusline.json`.
2. Send Bo ONE complete return report in Mattermost DM (`chat_id=mm-zxbf5ks4gbrf7jz4zzaqk97pfy`) because this handoff is `<1h` old (`auto-clear-after-forward.md` + `SOMBO RETURN PROTOCOL`):
   - First line: `✅ พร้อมทำงาน · รับ handoff 2026-10-30_21-36_mm-hermes-fb-git-goal-done.md แล้ว`
   - SELF-CHECK line (`progress/mm_<ts>.json` non-null `msg` + `scripts/fleet-drift-check.py` summary)
   - DEV STATUS block (`model`, `effort`, `fallback`, `context %`, `cost`, `CLI version`, `MCP servers`, `9router`, `git status`)
   - (1) Back after auto-forward at 42% context
   - (2) Done last session (`/goal` 5/5 PASS with No.4: Mattermost `clubs-dev` 12 channels + 18 repo webhooks + tracker cards, `hermes-mattermost-daemon.py` 10-turn FB history + guardrails + CRM card deduplication, Facebook posting pipeline SSOT + `@mimo` identified as the MM social bot + `fb_publish_check.py`, `git-sweep-maclab.sh` posting to MM `clubs-dev`, and PRs merged)
   - (3) Open pending items awaiting Bo's decision
   - (4) Standing by for Bo's next instruction.
3. Notify No.1 via `mcp__arra-memory__send_to_oracle(name="01-lord-knight", room="main", text="[maclab:88-sombo] sombo respawned")`.

## Done This Session (Verified `5/5 PASS · DONE`)
- **Goal file**: `ψ/goals/2026-10-30_21-14_buddy-with-no-4-finish-mattermost-clubs-dev-repo-c.md` (`status: DONE`).
- **`hermes-mattermost-daemon.py` (`pid 91844`)**:
  - Passes 10-turn FB chat history to `generate_draft_reply()`, forbids claiming queue availability without checking schedule, forbids repeating price/deposit when customer says thanks or sends phone number, uses `ag/gemini-3.8-flash-high` with `60s` timeout, and `UPDATE`s existing Focalboard CRM card per customer instead of inserting duplicates.
- **Mattermost `🛠️ Clubs Dev & Git Engine` (`clubs-dev`)**:
  - All 7 MacLab bots (`sombo`, `mimo`, `hermes`, `lord-knight`, `gmforge`, `gemini`, `agy-nano2`) added to team and all 14 channels.
  - GitHub plugin `subscriptions` in Postgres + live GitHub webhooks (`https://mm.clubsxai.com/plugins/github/webhook`) wired across 18 `MEYD-605` repos.
  - Fresh `📦 Git Project Tracker (Updated)` cards posted to all 10 `repo-*` channels (`python3 scripts/verify-mm-clubs-dev.py` → `PASS`).
- **Facebook Posting Pipeline SSOT**:
  - Confirmed with No.4 that **`@mimo` (No.4)** is the Mattermost bot wired to `facebook-mcp` (`post_to_facebook`, `post_image_to_facebook`, `schedule_post`, `update_post`, `delete_post`) + `seo-audit` + `lightcraft`.
  - Documented SSOT in `ψ/memory/learnings/2026-10-30_facebook-posting-pipeline-ssot.md` and verified all 5 pages via `python3 /Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/tools/fb_publish_check.py` (`PASS`).
- **`git-sweep-maclab.sh` → Mattermost & Repo Cleanup**:
  - Wired `mm_post()` in `mimo-oracle/ψ/tools/git-sweep-maclab.sh` to post sweep reports to `pr-and-issues` and `repo-*` channels.
  - Merged `mimo-oracle` (#21, #22), `lord-knight-oracle` (#107), `sombo-oracle` (#45), and `agy-nano2-oracle` sweep PRs.

## Pending Items (Awaiting Bo)
- **SP International Preschool Halloween Step 3 (`/Volumes/Club S/30.10.69_SP_Kindergarten/`)**: Awaiting teacher selection of `Club S-1..168` (46 kids across 4 classes) + `BG_01..12`.
- **`no10-oracle` (flipped to PRIVATE by No.1)**: Awaiting Bo's decision on whether to purge `ψ/` from history or keep private.
- **Focalboard CRM old duplicate cards (97 customer titles)** & **`maw-ssh-src` TURN credential allowlist**: Awaiting Bo's confirmation before deleting/modifying.
