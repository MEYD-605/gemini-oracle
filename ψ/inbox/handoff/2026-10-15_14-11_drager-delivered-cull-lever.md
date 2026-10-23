# Handoff: Dräger event delivered (329) + cull.py lever + blind seat test

**Date**: 2026-10-15 14:11 (from `date`)
**Context**: 44% / 1M · model opus-5.5[1m]
📡 Session: 29b589a1 | sombo-oracle | since 11:52 /clear

## What We Did (verified)
- **Delivered** `~/Downloads/14.10.69_Drager_Cooking_Class/` = **329 × `Club S-1..329.JPG`** (capture order, 2048px, q99, 300ppi, EXIF; checked 329/329). Bo picked the folder name 13:25.
  - Cuts kept in `~/Downloads/10961014_edited/` by reason: `2_blur` 10 · `3_eyes_closed` 20 · `4_near_duplicate` 34 · `5_no_flash` 20 · `6_not_nice` 85 (incl. Bo's #129 #244 #247 #305 #411). `categories.json` (+ `not_nice_reason`), `delivery_map.csv` (Club S-N → event no → DSC), `TOKENS.md`. `1_use` = 329 source files.
  - Tier B (31 dup/wide frames, `/tmp/sombo_probe/nice_tiers.json` "B") **still in the delivery** — Bo never answered.
  - Edits after the morning render: 11 food frames exposure-capped (`/tmp/sombo_ev1014/fix_food.py`, backups `_bak_food/`), #494 crop + 3000K, #159 Exp −0.45, #160 → blur. Old exports parked `_old_*`.
- Cull history (Bo corrected me 4×): 145 → 135 story-pick ("มึงบ้าป่าว" too few) → 435/415/414 tech-only → Bo named 5 ugly frames → by-eye pass on all 409 → cut A 85 → 329. Lessons in memory `know-the-job-before-culling` + `event-cull-reject-patterns-bo`.
- Closed-eye root cause: `melina` = **person** boxes, not faces → crop head → MediaPipe FaceLandmarker blendshapes. Model persisted `~/Code/aftershoot-re-models/mediapipe/face_landmarker.task`.
- Nano Banana deblur on #160 = drew 11 new people → banned for client photos (Bo: "ลบไปก่อน").
- **Lever** `scripts/lightcraft/cull.py` (commit **27177be**, PEP 723 `uv run`): tech cuts blur/eyes_closed/near_duplicate/no_flash + beauty hints + review sheets, 3.5 min/498, 0 tokens, cached `analysis.json`. On this event: 411 keep, **73.5% per-frame** vs Bo's 329.
- **photo-cull SKILL.md rewritten** in Nat's Oracle format (frontmatter, Usage `--event`/`--match`, Step 0, Output, Rules). ⚠️ `.claude/` is gitignored → skill NOT in git (safety hook blocks `add -f`).
- **Blind seat test** (input `/tmp/cull_test_input/`, scorer `/tmp/sombo_cull_judge/compare.py`): No.4 306 keep **65.3%** (kept #129), No.6 329 keep **65.5%**. Not fully blind: No.6 copied per-reason totals from `ψ/focus.md` line 6 + the skill listed Bo's 5 (both my leaks; confirmed). Reported honestly to Bo.
- Job tokens to 12:50: fresh 770k / total 76.6M (`TOKENS.md`); not updated for 12:50→14:11.
- Hermes Prime sent 3 LC-retouch updates (blueprint, `00f375e` shader, model_9 inpaint claims) — summarised to Bo, **no GO**, nothing run.

## Pending
- [ ] Bo: cut tier B (31) or keep → if cut, rebuild delivery (re-number Club S-N + map)
- [ ] Bo: rerun seats with new skill as a truly blind test (keep answer out of focus.md / skill / handoffs)
- [ ] Commit photo-cull SKILL.md somewhere tracked (ask Bo/No.1: un-ignore `.claude/skills/photo-cull` or move skill into `scripts/lightcraft/skills/`)
- [ ] Food highlight cap is still a manual step (fix_food.py in /tmp) → fold into a repo script
- [ ] Update TOKENS.md for 12:50→14:11 (re-cull + lever + test)
- [ ] Hermes LC-retouch: waiting Bo GO (suggest blemish/model_9 first)
- [ ] Old: skin-masked WB for flash faces · Bo-Auto refit (ClubSGame 379) · ClubSGame MQTT inbound (No.1) · 172 unpushed commits
- [ ] Drift: No.1 model name mismatch (cc/claude-opus-5-5 vs opus-5.5[1m]) · No.2 focus stale

## Next Session
- [ ] Return report + check Bo's DM for tier B / rerun answers
- [ ] Move `fix_food.py` logic into `scripts/lightcraft/` and reference from skill
- [ ] Resolve where photo-cull skill lives in git

## Key Files
- `scripts/lightcraft/cull.py` · `.claude/skills/photo-cull/SKILL.md`
- `~/Downloads/14.10.69_Drager_Cooking_Class/` · `~/Downloads/10961014_edited/{categories.json,delivery_map.csv,TOKENS.md}`
- `/tmp/sombo_ev1014/` (ev_edit.py, fix_food.py, set/, _bak_*) · `/tmp/sombo_probe/` (compo.py, nice_tiers.json, mp_eyes2.py) · `/tmp/sombo_cull_judge/` (compare.py, run1/)
- Memories: `know-the-job-before-culling.md`, `event-cull-reject-patterns-bo.md`
