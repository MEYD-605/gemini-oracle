# Handoff: LightCraft v7 — Rianlu-Style Adobe Color Bridge, Per-Channel R/G/B Curves & Non-Blurry Skin Mask

**Date**: 2026-10-14 16:29 +07
**Context**: 48% (481k / 1M tokens) · `ag/gemini-4-argon-high`
📡 Session: `b9cc6812` | `sombo-oracle` | 2h 40m

## What We Did
- **Diagnosed v6 Midtone Saturation Gap (-10.7% to -15.7% vs Lightroom Classic)**:
  - Measured `v6_xmp_DSC06164.jpg` (`Sat 0.5043`) vs Lightroom (`Sat 0.5647`) and `DSC07864` (`Sat 0.1776` vs `0.2105`).
  - Identified that `crs.rs:455` skips `<crs:Look crs:Name="Adobe Color">`, which contains `LookTable` `E1095149FDB39D7A057BAB208837E2E1` and an internal `ToneCurvePV2012` S-curve (`[[0,0],[22,16],[40,35],[127,127],[224,230],[240,246],[255,255]]`).
- **Paired with Buddy No.3 (`ClubSGame`) Using `rianlu` Bridge Methodology**:
  - Cleared No.3's context (`734k → 0`) and dispatched extraction of `C:\ProgramData\Adobe\CameraRaw\Settings\Adobe\Profiles\Adobe Raw\Adobe Color.xmp` (`108 KB`).
  - No.3 decoded the DNG XML-safe Base85 + zlib `crs:Table_E1095149FDB39D7A057BAB208837E2E1` into `C:\temp\adobe_color_look.json` (`36 × 16 × 16 = 9,216` triplets) and reported back via `oracle-channel`.
  - Injected `Adobe Color`'s `look_table` + `baseline_exposure: 0.50` into `ILCE-7C.json` (`666 KB`) on both MacLab and ClubSGame:
    - `DSC07864` (Zero-Edit): Midtone Saturation jumped from `84.3%` to **`99.7%`** (`0.2098` vs LR `0.2105`), `RMS = 13.15`.
    - `DSC06164` (Edited + Preset): Midtone Saturation jumped from `89.3%` to **`100.6%–103.9%`**, `RMS = 19.05`.
- **Calibrated Native GPU 60fps Per-Channel R/G/B Curves + `.cube` 3D LUTs Across 8 Lightroom Pairs**:
  - Fitted `Master + Red / Green / Blue` per-channel curves across the 8 uncropped Lightroom Classic `.ARW` + `.lr.jpg` pairs (`DSC06164`, `DSC06179`, `DSC06260`, `DSC06486`, `DSC06641`, `DSC06712`, `DSC06769`, `DSC06828`):
    - `curve.red`: `[(0,0), (0.12,0.0836), (0.25,0.2037), (0.5,0.4514), (0.75,0.7618), (0.88,0.9321), (1,1)]`
    - `curve.green`: `[(0,0), (0.12,0.115), (0.25,0.2414), (0.5,0.489), (0.75,0.7837), (0.88,0.9038), (1,1)]`
    - `curve.blue`: `[(0,0), (0.12,0.1244), (0.25,0.2633), (0.5,0.5204), (0.75,0.7869), (0.88,0.8976), (1,1)]`
  - Embedded these native GPU curves into `Bo 00`, `Bo 01`, `Bo 02`, `Bo 03` in `presets.json` and `C:\Tools\LightCraft\bo_02_tonchabab.json`.
  - **Held-Out Vertical Portrait Verification (`DSC06991.ARW` · `1365×2048`)**:
    - Pure LightCraft (`ILCE-7C.json` + native `R/G/B` curves): **`RMS = 8.22` (`96.8%` Match to Lightroom Classic!)**, `RGB = [168.0, 99.1, 90.0]` vs Lightroom `[167.1, 99.1, 88.4]`.
    - With `Bo_LR_Master_Base.cube` (33×33×33 3D LUT): **`RMS = 7.08` (`97.2%` Match!)**.
- **Fixed Arm/Edge Blur in `Bo 03 Skin Beauty & Glow Pro 2026` Preset**:
  - Removed global `effects.texture: -28`, `clarity: -22`, and `noise: +55` that caused blurry arm contours on `DSC07000`.
  - Set global `texture: 0.0`, `clarity: 0.0`, `nr_luminance: 0.0`, and limited the OkLab `colorRange` Skin Mask to gentle non-blurry values (`texture: -15.0`, `clarity: 0.0`, `noise: 0.0`, `sharpness: 0.0`, `exposure: +0.10`, `shadows: +12.0`, `tint: +8.0`).
  - Verified 100% tack-sharp arms, jewelry, and clothing on vertical portraits `DSC08499` and `DSC06991`.

## Pending
- [ ] Await Master Bo's visual review of vertical portraits `DSC06991` (`pure_lc_6991_rgbcurve.jpg`) and `DSC08499` (`pure_lc_8499_rgbcurve.jpg`)
- [ ] Optional: Wire `Bo_LR_Master_Base.cube` or other camera models (`ILCE-7M3`, `ILCE-7M4`) using the same Sombo + No.3 Rianlu DCP/LookTable bridge
- [ ] Follow up on previous pending items: Google Managed Agents (No.7 Professor/Stratos) HAOS webhook test & fleet drift check items (`No.4/6/8` model pin vs `desired-state.yaml`)

## Next Session
- [ ] Read Master Bo's feedback on the vertical portrait base color (`DSC06991` & `DSC08499`) and fine-tune if requested
- [ ] Coordinate with No.1 / No.5 to clear the 4 `fleet-drift-check.py` items (`No.5` focus.md age + `No.4/6/8` model settings)

## Key Files
- `/Users/admin/Library/Application Support/LightCraft/camera-profiles/ILCE-7C.json` (MacLab `Adobe Color` 3D `look_table` + `dng_color`)
- `C:\Users\noone\AppData\Roaming\LightCraft\camera-profiles\ILCE-7C.json` (ClubSGame `ILCE-7C.json`)
- `C:\Users\noone\Pictures\LightCraft Library\presets.json` & `~/Pictures/LightCraft Library/presets.json` (`Bo 00 / 01 / 02 / 03` with calibrated `Master + R/G/B` curves & gentle Skin Mask)
- `C:\Tools\LightCraft\bo_02_tonchabab.json` (ClubSGame CLI preset updated with `Master + R/G/B` curves)
- `/Users/admin/Pictures/LightCraft Library/ClubS_LUTs/Bo_LR_Exact_Match.cube` & `Bo_ClubS_AgX_Cinema_Skin.cube`
