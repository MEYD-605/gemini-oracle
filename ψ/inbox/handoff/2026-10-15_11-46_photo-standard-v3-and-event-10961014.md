# Handoff: Photo standard v3 approved + event 10961014 (498 RAW) edited + Aftershoot face-blur cull

**Date**: 2026-10-15 11:46 +07 (from `date`)
**Context**: 44% / 1M · model opus-5.5[1m]
📡 Session: since 10:15 /clear | sombo-oracle

## Bo's orders this session (all in force)
- **How Bo edits** (mined 492 of his old XMPs): ONE preset per shoot, then per photo only **Temp + Exposure** (Tint a little). Never HSL / Vibrance / Calibration to "fix" colour. Don't cut orange beyond what the preset has.
- Bo is **colour-blind** → skin colour must be checked by numbers (CIELAB a* > 0 = not green; Y−M / vectorscope 123° for orange).
- Faces orange only on **flash** frames; whites must be white AND faces right.
- Bo 10:56: pf17 = "มาตรฐานแรก" (first standard), improve later. Stay on **LightCraft**, not Lightroom MCP.
- Log **tokens** (not $) per job — Bo wants to know cost per folder in tokens.
- Show samples (~10) before sending a whole job.

## What We Did (verified)
- No.4 + No.6 photo17 sets: byte-identical to each other and to my skill17 (photo_edit.py is deterministic; only LOOK_NOTES judgement varies). Sent Bo No.4's 17. Their feedback fixed: ARW preview orientation, `view_after/`, standard_check LRDIR (2db7dd4, efaa0f8 — the LRDIR edit was first blocked by safety hook; correction sent to seats).
- D-044: No.4 stays `ag/gemini-3.8-flash-medium` (Bo 10:25) — 401a514.
- **Standard v3** (dd8a522): `approved/` = pf17 (Bo XMP colour + HL −50, per-photo Temp → whites R−B −3.5, Tint +3, Exp −0.2/−0.1); old set in `approved_v2_N1/`. STANDARD STEP 3b + "How Bo edits". photo_edit.py v3 finish reproduces approved (lock ok, PASS). standard_check: skin LR−20..+4, R−B −5..+3, green gate.
- Known gap (in STANDARD): flash faces #7 #9 #12 still a bit orange (Y−M 14–16) → next = skin-masked WB.
- Research (deep-researcher): event-pro slider ranges; Bo's preset already inside them. Techniques: People-mask WB, per-scene WB, ½ CTO gel on flash. Sent Bo with sources.
- **Event job `~/Downloads/10961014`**: 498 ARW A7III, 17:58–20:05 14 Oct, flash 469, corporate Thai cooking class + dinner, warm tungsten ballroom. No XMP/LR export.
  - Preset: Bo OK'd **Bo_00_Clean_Skin_2026** (copied Bo Signature Presets from ClubSGame → `/tmp/sombo_presets/`).
  - Workdir `/tmp/sombo_ev1014/`: LOOK_NOTES.md, frames.json, sheets/, `ev_edit.py` (v3 per photo, targets from Club S: skin 178, over 170, whites −3.5), `out/` = **498 finals 2048px**, `set/s_N.json`, result.json, edit_log.txt.
  - 27 no-white frames fixed temp 4300→3600 (scene median). Temp range 2800–4874, median 3601.
  - 10 samples sent; Bo "พอได้" but caught **#301 (DSC01778) out of focus**.
- **Emanata** (our Aftershoot clone, `~/Code/emanata-setup`, RE'd models from 2026-08-21): needed `uv pip install onnx` in its venv for aldrich. Whole-image run 75s: 452 pick / 26 review / 6 reject / 14 dupe, but passed #301.
  - Fix that works: `the_four_kings` blur on each `melina` face crop of the 2048 renders, take **best face**; < 0.6 = soft. #301 0.51 vs sharp 0.82–0.86. Scan 82s, 0 tokens. 36 flagged; real misses #301 #163 #300 #114; rest = no-face food/hands or small far faces (false positives). Results `/tmp/sombo_ev1014/face_blur.json`.
- Token ledger `/tmp/sombo_ev1014/TOKENS.md` + `tok.py` (sums transcript usage since 04:07Z). At 11:46: 88 turns · fresh 434,296 · cache_read 34.1M.
- Memories: `bo-colour-blind-check-skin-numerically.md`; Arra milestone "photo standard v3".

## Pending
- [ ] **Bo**: where to deliver 498 (Drive / ClubSGame folder?) and whether to cut #301 #163 #300 #114 — asked 11:45, no answer yet
- [ ] Face-blur gate: skip frames with no face / tiny faces (≈ −20 false flags), then add it as a step in `photo_cull.py` + photo-cull SKILL (copy model loading from emanata; needs its venv or onnxruntime in /tmp/sombo_xmp_diff/.venv)
- [ ] Final token total for event job → report to Bo (tokens per folder / per photo)
- [ ] Skin-masked WB for flash faces (#7 #9 #12 Club S; same risk in event) — STANDARD next step
- [ ] Bo asked phone vs iMac speed test (No.4/No.8 test not found in memory) — offered 3-machine benchmark, no answer
- [ ] Old: Bo-Auto refit (ClubSGame 379), ClubSGame MQTT inbound (No.1), No.3 #13 wedge, delete ClubSGame sombo_photo17 (Bo OK), 160 unpushed commits

## Added 11:55 (Bo 11:50: also cull for closed eyes, occlusion, bad pose/motion, composition — not just blur)
- `/tmp/sombo_ev1014/faces.json` = per-face area/blur/eyegaze/emotion/yaw/pitch for all 498 (81s).
- Emanata's `mimic_tear` "eyegaze" is ~1.0 on every face (0.996–1.022 over 1,869 faces) → NOT a usable closed-eye signal as wired.
- Unwired RE models in `~/Code/aftershoot-re-models/ai_models/`: `cant_see` (224² → 5-class + 4) likely occlusion/visibility, `cloudy` (224² + res → 3-class), `micolash` (192²×3 → 212 = 106 landmarks; tried, points misplaced = wrong crop/normalisation), `the_kindling_maiden` (640² YOLO, 300×6 boxes), `mimic_tear_opt_in`, `astel`, `nameless_king` (256² → 256² mask).
- Plan: build a labelled check set from this event (Bo-named closed-eye / blocked / bad-pose frames + known good) and probe each model against it before trusting any.

## Next Session
- [ ] FIRST: identify closed-eye / occlusion models (mimic_tear_opt_in, cant_see, micolash eye landmarks → EAR) against a labelled set; ask Bo for 3–5 example frames
- [ ] Return report, then check DM for Bo's delivery answer
- [ ] Deliver event set per Bo; finish token summary for the job
- [ ] Build face-blur step into photo_cull.py (no-face exclusion) + commit

## Key Files
- `scripts/lightcraft/STANDARD.md` (v3), `photo_edit.py`, `standard_check.py`, `variants/d2_17/approved/` (LEDGER)
- `/tmp/sombo_ev1014/` (ev_edit.py, out/, LOOK_NOTES.md, TOKENS.md, tok.py, face_blur.json, ema_out/report.html)
- `~/Code/emanata-setup/emanata` (+ `/tmp/sombo_ema_models` symlinks incl. aldrich.onnx), `~/Code/aftershoot-re-models`
- `/tmp/sombo_presets/` (Bo Signature Presets), `/tmp/sombo_boxmp/` (885 old XMPs)
