# Handoff: LightCraft DNG Spec Ch.6 Hue-Preserving Tone Map, ILCE-7M3 Profile & Zero-Smoothing ILCE-7C Crisp Renders

**Date**: 2026-10-14 20:01 +07
**Context**: 41% (412k / 1M tokens) · `ag/gemini-4-argon-high`
📡 Session: `f4ed81df` | `sombo-oracle` | 1h 28m

## What We Did
- **Deployed Official `LightCraft v0.7.1` onto P'Mo's MacBook Pro (`clubsamacbook-mo`, `100.82.0.2`, Apple M1) & MacLab**:
  - Downloaded official `lightcraft-0.7.1-macos-universal.dmg` and `lightcraft-cli-0.7.1-macos-universal.zip` from `storytold/lightcraft` release `v0.7.1`.
  - Installed `/Applications/LightCraft.app` (`v0.7.1` Universal) and `~/.local/bin/lightcraft-cli` (`v0.7.1`) on `clubsamacbook-mo` and synced `ILCE-7C.json`, `presets.json` (15 `Bo Signature Presets` `Bo 00–13`), and `prefs.json`.
- **Pulled & Compared Bo's 17 Test Photos (`9 × ILCE-7M3` + `8 × ILCE-7C`) on MacLab**:
  - Copied `~/Desktop/sombo/Club S-1..17.JPG` and `~/Downloads/New Folder With Items/DSC*.ARW` from `clubsamacbook-mo` to MacLab `/tmp/sombo_17_test/`.
  - **Built `ILCE-7M3.json` Camera Profile (P'Mo's Sony A7 III)**: Converted `DSC05765.ARW` to DNG via Adobe DNG Converter and extracted exact `ILCE-7M3` `ColorMatrix1/2`, `ForwardMatrix1/2`, `CameraCalibration1/2` (`[1.025, 1.0, 0.9425]`), `BaselineExposure` (`0.35`), and `ProfileHueSatMapData1/2` (`90×30×1`) + `Adobe Color` `LookTable` (`36×16×16`), saved to `/Users/admin/Library/Application Support/LightCraft/camera-profiles/ILCE-7M3.json` and synced to `clubsamacbook-mo`.
  - **Enabled `ILCE-7M3` Sony Lens Vignette (`0x7032`) & Distortion (`0x7037`) in `crates/raw/src/vendor/arw_lens.rs`**: Added `"ILCE-7M3" | "ILCE-7M4" | "ILCE-7CR" | "ILCE-7RM3" | "ILCE-7RM4"` to the model allowlist in `arw_lens.rs` (lines 21 & 102), reducing `ILCE-7M3` average RMS against Lightroom from `28.11` down to **`12.99`**.
- **Diagnosed & Fixed the 3 Root Causes on the 8 `ILCE-7C` Photos (`#10–#17`: `DSC09800` – `DSC09453`)**:
  1. **Eliminated Per-Channel Logistic Shoulder Yellow-Green Skin Twist (`finish.rs` & `finish.wgsl`)**:
     - Replaced raw per-channel `c.map(|v| tone.apply(v))` with **Adobe DNG Specification Chapter 6 Hue-Preserving 1D Tone Curve**:
       `mid' = min' + (max' - min') * (mid - min) / (max - min)`
     - Locked skin `R-G` and `G-B` ratios on `#10 DSC09800`, `#12 DSC09124`, `#15 DSC09434` to within **`0.1–0.5 / 255`** of Lightroom (`#12`: LR `R-G=39.5, G-B=25.7` vs LC `R-G=39.6, G-B=26.0`).
  2. **Fixed `apply_profile_dng_color` Ordering in `crates/engine/src/files.rs` (lines 185 & 430)**:
     - Called `apply_profile_dng_color(&mut raw.color, &raw.metadata)` BEFORE `WbScaleOf::new(...)` so camera-profiled `.ARW` files (`ILCE-7C`, `ILCE-7M3`) have `own_matrix = true` and `relative_wb = false`, enabling true Kelvin camera-space White Balance (`rebalance`).
  3. **Removed All Skin Smoothing (`texture = 0`, `clarity = 0`, `nr_luminance = 0`) per Bo's Directive ("ไม่ต้องใส่ผิวเนียน")**:
     - Re-rendered all 8 `ILCE-7C` photos (`#10–#17`) with zero skin smoothing (`texture: 0.0`, `clarity: 0.0`, `nr_luminance: 0.0`), deep black toe (`blacks: -18..-20`, `curve.darks: -8`, `Adobe Color + Medium Contrast` `Point {x, y}` curve), and `sharpen=screen standard`.
     - Synced `Club S-10_7C_Crisp.jpg` – `Club S-17_7C_Crisp.jpg` to Discord and `clubsamacbook-mo:~/Desktop/sombo_7C_beauty/`.

## Pending
- [ ] Await Bo's visual review of the 8 crisp zero-smoothing `ILCE-7C` renders (`Club S-10_7C_Crisp.jpg` – `Club S-17_7C_Crisp.jpg`)
- [ ] Apply the same zero-smoothing crisp tuning to the 9 `ILCE-7M3` photos (`#1–#9`: `DSC05765` – `DSC06117`) when Bo is ready
- [ ] Save the approved settings into `presets.json` (`Bo 00–03`) on MacLab, ClubSGame, and `clubsamacbook-mo`

## Next Session
- [ ] Check Bo's feedback on `Club S-10_7C_Crisp.jpg` – `Club S-17_7C_Crisp.jpg` and adjust or batch-render `#1–#9` (`ILCE-7M3`)
- [ ] Package updated `LightCraft.app` / `lightcraft-cli` binary if Bo wants the DNG Spec Ch.6 Hue-Preserving engine fix inside the GUI app on `clubsamacbook-mo`

## Key Files
- `/Users/admin/Code/github.com/storytold/lightcraft/crates/pipeline/src/finish.rs` & `/Users/admin/Code/github.com/storytold/lightcraft/crates/gpu/src/wgsl/finish.wgsl` (DNG Spec Ch.6 Hue-Preserving 1D Tone Curve)
- `/Users/admin/Code/github.com/storytold/lightcraft/crates/engine/src/files.rs` (`apply_profile_dng_color` before `WbScaleOf::new`)
- `/Users/admin/Code/github.com/storytold/lightcraft/crates/raw/src/vendor/arw_lens.rs` (`ILCE-7M3` added to Sony lens distortion/vignette allowlist)
- `/Users/admin/Library/Application Support/LightCraft/camera-profiles/ILCE-7M3.json` & `/Users/admin/Library/Application Support/LightCraft/camera-profiles/ILCE-7C.json`
- `/tmp/sombo_17_test/lc_7c_nosmooth/Club S-10_7C_Crisp.jpg` .. `Club S-17_7C_Crisp.jpg`
