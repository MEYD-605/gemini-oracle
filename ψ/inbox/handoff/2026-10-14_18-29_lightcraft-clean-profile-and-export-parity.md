# Handoff: LightCraft Clean Adobe Color Profile & Lightroom Export Parity (2048px / 6000×4000 · 300 PPI · Screen Sharpen)

**Date**: 2026-10-14 18:29 +07
**Context**: 43% (425k / 1M tokens) · `ag/gemini-4-argon-high`
📡 Session: `e3d1cbda` | `sombo-oracle` | 1h 55m

## What We Did
- **Identified & Fixed Why Lightroom and LightCraft Held Different Profile Settings from the Start**:
  - **Camera Profile & `<crs:Look>` Mismatch**: Lightroom XMP sidecars (`DSC06991.xmp`, `DSC06164.xmp`) use `crs:CameraProfile="Adobe Standard"` + `<crs:Look crs:Name="Adobe Color">` (`LookTable E1095149FDB39D7A057BAB208837E2E1` `36×16×16` + `Adobe Color`'s internal S-curve `[[0,0],[22,16],[40,35],[127,127],[224,230],[240,246],[255,255]]`). Previously, `ILCE-7C.json` held only `Adobe Standard` (`36×8×16` identity table) and `crs.rs:455` skipped `<crs:Look>` (`"unmapped": ["CameraProfile", "Look"]`).
  - **Render Settings Mismatch Between `DSC06991` and `DSC08499`**:
    - First test of `DSC06991_v7_base.jpg` accidentally applied `DSC07000.xmp` (`Exposure = -0.50`) instead of `DSC06991`'s real XMP (`Exposure = -0.30`), making it appear darker and causing unnecessary `R/G/B` channel curve fitting.
    - `bo_02_tonchabab.json` had `wb: None` (causing `DSC08499` to render at `As Shot = 5850 K` instead of `Custom Kelvin`), `optics.lens_profile: False` (whereas Lightroom had `crs:LensProfileEnable="1"`, Vignetting `100%`), and `grading.blending: 50` (vs Lightroom `100`).
  - **Cleaned Up Presets (Zero Artificial R/G/B Curve Hacks)**:
    - Removed the artificial fitted `curve.red`, `curve.green`, `curve.blue` arrays (`[]` empty, matching Lightroom) from `Bo 00 / 01 / 02 / 03` in `~/Pictures/LightCraft Library/presets.json`, `C:\Users\noone\Pictures\LightCraft Library\presets.json`, and `C:\Tools\LightCraft\bo_02_tonchabab.json`.
    - Enabled `optics.lens_profile: True` (`profile_distortion: 100.0`, `profile_vignetting: 100.0`) and `grading.blending: 100.0` in `Bo 00 / 01 / 02 / 03`.
    - Verified pure `Adobe Color` + real `DSC06991.xmp` with zero `R/G/B` curve hacks matches Lightroom (`RGB = [168.2, 97.5, 87.1]` vs Lightroom `[167.5, 99.2, 88.0]`, `RMS = 10.77`).
- **Audited & Aligned Export Settings with Lightroom Classic (`prefs.json`)**:
  - **Caught In-Place `sips -Z 1000` Hook Trap**: `~/.claude/hooks/auto-downscale-image.sh` runs `sips -Z 1000` in-place whenever `Read` is called on an image >1000px, which previously shrank `1365×2048` (`4:4:4`, `300 PPI`) exports to `666×1000` (`4:2:0`, `155 KB`) and stripped XMP/ICC before Discord upload.
  - **Aligned All 5 Export Parameters in `prefs.json` (`lastExport` + `exportPresets`) on MacLab & ClubSGame**:
    1. **Resized Mode (`longEdge: 2048`, `dontEnlarge: true`)**: Outputs `2048 × 1365` (horizontal) and `1365 × 2048` (vertical).
    2. **Full Size Mode (`longEdge: 0`)**: Outputs `6000 × 4000` (horizontal) and `4000 × 6000` (vertical), verified on `DSC06991_Full_6000x4000.jpg` (`4000 × 6000`, `11.4 MB`, `300 DPI`).
    3. **Output Sharpening**: `sharpen: "screen"`, `sharpenAmount: "standard"` (brings edge sharpness from `3.309` up to **`3.542`**, matching Lightroom's **`3.601`**).
    4. **Resolution (`ppi`)**: `300` PPI (was `240` default).
    5. **JPEG Quality & Chroma Subsampling**: `quality: 96–98`, `colorSpace: "srgb"`, `4:4:4` (`1x1, 1x1, 1x1` Full Chroma), `metadata: "all"`.

## Pending
- [ ] Compare live with Master Bo's test export from P'Mo's MacBook (`macbook เครื่องพี่โม`)
- [ ] Avoid calling `Read` directly on final export JPEGs before uploading to Discord (or copy to a temp preview path first) so `auto-downscale-image.sh` (`sips -Z 1000`) never mutates the export file
- [ ] Follow up on Google Managed Agents (No.7 Professor/Stratos) HAOS webhook test when Bo is ready

## Next Session
- [ ] Receive and inspect Bo's comparison files from P'Mo's MacBook and verify pixel/color/export parity
- [ ] If Bo wants `LightCraft` installed or synced (`ILCE-7C.json`, `presets.json`, `prefs.json`) onto P'Mo's MacBook, prepare a one-command sync bundle

## Key Files
- `/Users/admin/Pictures/LightCraft Library/prefs.json` & `C:\Users\noone\Pictures\LightCraft Library\prefs.json` (`lastExport` + `exportPresets` for `2048px` and `6000×4000` full size)
- `/Users/admin/Pictures/LightCraft Library/presets.json` & `C:\Users\noone\Pictures\LightCraft Library\presets.json` (Cleaned `Bo 00 / 01 / 02 / 03` with `curve.red/green/blue = []`, `lens_profile = True`, `blending = 100`)
- `/Users/admin/Library/Application Support/LightCraft/camera-profiles/ILCE-7C.json` & `C:\Users\noone\AppData\Roaming\LightCraft\camera-profiles\ILCE-7C.json`
- `/tmp/DSC06991_LR_Parity_2048.jpg` (`1365×2048`), `/tmp/DSC08499_LR_Parity_2048.jpg` (`1365×2048`), `/tmp/DSC06991_Full_6000x4000.jpg` (`4000×6000`)
