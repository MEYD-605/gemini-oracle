# Handoff: LightCraft v0.14.0 + 3D LUT (.cube) + Club S Artist DNA Clean Baseline

📡 SESSION: 9_5bf4ed | ตรวจสอบมาตรฐาน VM Grok | msgs=292 | ag/gemini-4-argon-high
**Date**: 2026-10-26 13:52
**Context**: ~85%

## Context
**Oracle**: No.4 MIMO (maclab:04-mimo) | **Human**: Master Bo (khunbo)
**Mode**: Full Soul Sync | **Memory**: auto
**Team**: MacLab Triumvirate (No.1 Lord Knight · No.88 Sombo · No.4 MIMO)

## What We Did
- **Upgraded LightCraft CLI to `v0.14.0` (`sombo/hue2-on-v014`, commit `cf6e7884` in `/Users/admin/Code/github.com/storytold/lightcraft-v013`)**:
  - Ported Sombo's custom Sony A7C camera profile (`ILCE-7C.json`) and `pr514` (`whites_scale`) onto `v0.14.0`, verified bit-for-bit pixel identity (`mean |ΔRGB| = 0.0000 / 255`) with `2x` faster CPU median filter.
  - Upgraded `crates/pipeline/src/lut.rs` from Trilinear to **Tetrahedral Interpolation** (zero skin banding) and patched `apps/lightcraft-cli/src/main.rs` to auto-import `.cube` 3D LUTs from `LIGHTCRAFT_LUTS_DIR` (`scripts/lightcraft/luts`).
- **Built Club S 33³ OkLCh 3D LUTs (`Blessing.cube` & `MarryMe.cube` in `sombo-oracle` commit `897174ff`)**:
  - Extracted Face DNA and tone curves from Bo's approved Facebook albums (`1FKX8sNJEG` office merit, `1Em5Sue2UT` garden proposal) with Neutral Axis Protection (`R=G=B` locked so white coats/shirts never pick up color cast).
- **Refined `artist_dna.py` (`sombo-oracle` commits `dc198375`, `00b2fd66`, `39189b0f`, `8190b3d1`)**:
  - **Stripped Hidden Blur & Cyan Tint**: Removed `effects.texture = -20.0` and `grading.highlights.sat = 5.0 (hue 210)` that were lurking in `s_1.json` (respecting Bo's strict rule: **zero skin blur**, keep 100% real pores/texture).
  - **Crisp S-Curve Backlit Archetype (`#296`, Bo-approved "เออสวยเลยสัตว์")**: `EV +0.96, Contrast +14, HL -38, SH +20, Whites +10, Blacks -10` + Face Dodge Mask (`+0.25 EV`) + `lut:clubs-blessing` @ `85%`. Restricted strictly to genuinely dark backlit faces (`face_L < 55` and `scene_p50 > 140`) so normal studio shots are never color-warped.
  - **Normal Shots Rule (Bo's directive 13:47)**: Do NOT apply heavy backlit overrides, `Dehaze`, `Blacks -24`, or `Yellow Hue/Sat` channel twisting to normal shots — keep normal shots on the **Clean Natural Golden Baseline** (`s_1.json` with `texture: 0.0`, room WB, and gentle exposure nudges only).
  - Sent 2 sets of 10 normal shots (`Set 1`: `#017, #050, #084, #182, #211, #255, #317, #422, #477, #516`; `Set 2`: `#001, #057, #100, #228, #305, #345, #408, #476, #514, #559`) in 2 single 10-photo Mattermost posts to Bo's DM (`dbb7s39u1pndmmp3satsk8ekmr`).
- **Fixed `cull.py` (`sombo-oracle` commit `c5e7b050` + synced with Sombo's `cull.py` v2 `ebc69dac`)**:
  - Enforced eyes-open priority (`max_blink < 0.45`) ahead of sharpness when selecting burst winners.
- **MacLab Thermal & Process Hygiene**:
  - Added `.cbmignore` in `mimo-oracle`, placed `.metadata_never_index` on Rust `target/` and cache dirs, and reaped duplicate render/inbound workers to keep CPU `< 50°C`.

## Pending
- [ ] Await Bo's feedback on the 2x10 Clean Natural Golden Baseline photo sets in Mattermost DM (`dbb7s39u1pndmmp3satsk8ekmr`)
- [ ] Re-render full Velaa 404-photo album into `/Users/admin/Downloads/cull-18.10.69/no4_v2/final/` using the clean `8190b3d1` Golden Baseline (no global Dehaze/yellow twist, backlit S-curve only on `face_L < 55`) once Bo confirms the 2x10 normal sets
- [ ] Refresh expired Google Ads ConPass OAuth token (`~/.google-ads/google-ads-conpass.yaml` `invalid_grant`) when Bo is ready
- [ ] Apply Club S Google Ads (`9657319650`) `PRESENCE` geo-targeting and negative keywords upon Bo's confirmation

## Next Session
- [ ] Check Bo's reply on the 2x10 normal clean photo sets and coordinate with Sombo (`88-sombo`) via MQTT on final Velaa benchmark (`~/Downloads/lc-bench/compare.json`)
- [ ] If approved, run clean batch render (`8190b3d1`) across all 404 Velaa frames with max 2 workers (`< 55°C` thermal guard)
- [ ] Update skill `clubs-photo-cull-and-edit-v3` with the Golden Baseline vs Backlit S-Curve separation rule (never apply heavy Dehaze/Blacks/Yellow twisting to normal studio shots)

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/lightcraft/artist_dna.py`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/lightcraft/cull.py`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/lightcraft/luts/clubs/Blessing.cube`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/lightcraft/luts/clubs/MarryMe.cube`
- `/Users/admin/Code/github.com/storytold/lightcraft-v013/crates/pipeline/src/lut.rs`
- `/Users/admin/Code/github.com/storytold/lightcraft-v013/apps/lightcraft-cli/src/main.rs`
- `/Users/admin/.hermes-no4/cache/scratch/send_2x10_clean.py`
