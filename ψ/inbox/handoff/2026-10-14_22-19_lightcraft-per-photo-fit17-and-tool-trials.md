# Handoff: LightCraft per-photo fit17, D2 → "พอดี", tool trials (rawmakase ✗, retouch pending)

**Date**: 2026-10-14 22:19 +07 (real clock, from `date`)
**Context**: 47% (465k / 1M) · `cc/claude-fable-5-1` · cost $35.5 this session (since 21:12 /clear)
📡 Session: `11d91235` | `sombo-oracle` | since 21:12

## Bo's orders this session (all still in force)
- 21:22–21:23 **NO deploy to any machine** (not clubsamacbook-mo, not anyone). "มึงทำให้มันสวยก็พอแล้ว"
- 21:32 D2 picked for #12 → "ลองทำทั้ง 17 รูปดิ"
- 21:39 "#5 กับ #7 สว่างไปด้วย" + asked how to judge พอดี
- 21:43 "**เหมารวมไม่ได้** แต่ละรูปแสงไม่เท่ากัน" + "หา repo เครื่องมือแต่งรูป"
- 21:44 "ทำถูกแล้ว ทำไมก่อนหน้าไม่ถูก" → answered 3 root causes (copied LR over-exposure; one-photo recipe generalised; LC Kelvin ≠ LR Kelvin)
- 21:49 "ได้ๆ" = fit direction + repo trials approved (in /tmp only)
- 22:04 "repo อื่นมีน่าสนใจไหม" → recommended retouch / lookmatch / pyiqa; proposed retouch trial on #5 (no explicit yes yet, but 21:49 covers trials)

## What We Did (verified)
- **3-way #12**: LR / mine (RMS 5.56) / No.6 (12.67) → Bo: mine better, "ยังไม่สวยกว่า LR"
- **Diagnosed tone gap** (skin −4 R/G, lights −3.5, blacks +2.4) → D1 (tone) / D2 (skin bright) variants; Bo picked D2
- **17 D2 renders** delivered one per message (`/tmp/sombo_dev/final17`). 7M3 #1–#9 need `highlights=0 + exp +0.2` (×0.5 gives RMS 16–18). 7M3 #4–#9 sharpen 40→60 = LR lapVar.
- **Export parity** confirmed: 2048px, 300ppi, q99, 4:4:4 both sides; LC files ~2× larger (more texture).
- **Gates** (`scripts/lightcraft/gates.py`): skin Y 165–185, clip <0.5%, median <235, p1 <20, neutral |R−B| ≤3. D2 set failed skinY on 12/17, WB on 12/17.
- **fit17** (`scripts/lightcraft/variants/d2_17/fit17/`, `/tmp/sombo_dev/fit17/Club S-N_fit.jpg`): per frame exposure = log2((175/skinY)^2.2) clamped [−0.6,+0.15], highlights ≤−20 when darkening, WB −45K per unit of R−B beyond ±2 (2 passes on #1 #3 #8 #9), vibrance 3 / red sat 0 / orange sat −22 lum 14, then `skinsmooth.py .35 σ3`. **All 17 pass gates** (skinY 172–186, |R−B| ≤3.6). Bo saw #8/#12 samples; "ได้ๆ".
- **skinsmooth.py** (skin-mask + freq-sep): #5 skin hp2 7.04→5.14 (LR 5.27), edges kept. LC `effects.texture` is global, LR's is skin-weighted → slider alone can't match.
- **rawmakase** (pch/rawmakase, MIT): binary needs rustc 1.98 (have 1.96). Ported its 8 LR-Auto fits to `scripts/lightcraft/lrauto.py`; on Club S high-key frames Auto is −0.72 EV vs Bo (skinY 136–161, oversat) → not usable as-is; method OK, coefficients must be refit on Bo's XMP.
- **Bo-Auto refit on 17**: Bo's XMP = constant preset (hl −58 sh +13 bl −7 tx −20, mixer orange −12/+9 red +8), only exposure (7 values) + WB vary; LOO fit = no signal at n=17. Need ClubSGame `C:\Users\ClubSGame\OneDrive\Desktop\i88l8li\Selected` = 379 ARW (8.5 GB) + 379 XMP + `xmp_backup_before_golf/` (read-only; only 51 hand-edited frames carry signal).
- **Research doc** `docs/photo-tools-research-2026-10-14.md` (12 verified repos). Top: dennisbrian/retouch (skin, MIT, py3.9–3.11), shawnzebley/lookmatch (per-photo solve + gates), pyiqa (MUSIQ/CLIP-IQA gate).
- **retouch trial**: cloned `/tmp/sombo_ext/retouch` (commit 08d6dec), venv `.venv` py3.11, `uv pip install -e .` running 25+ min at ~280 KB/s (mediapipe 0.10.5 / onnxruntime 1.19.2 / opencv). Background task may die on /clear → re-run `cd /tmp/sombo_ext/retouch && source .venv/bin/activate && uv pip install -e .` (cache keeps progress). Then: `./run batch /tmp/sombo_dev/retouch_in -o /tmp/sombo_dev/retouch_out --recipe natural --no-exif --no-review` on `Club S-5_raw.jpg` (= fit17/raw_5.jpg, pre-skinsmooth), measure with `/tmp/sombo_dev/cmp_skin.py 5 raw=... skinsmooth=... retouch=...` (LR 5.27 / mine 5.14 / raw 7.06), send Bo 3-way.
- **Fleet**: D-041 closed (No.1 YES = 2 of 3; No.6 ACK STOP 21:11; profiles sha 01a8d123 still 444). **My mistake**: 3 "tasks" to No.6 sent via oracle-channel `reply` = broadcast, never delivered (No.1 proved from dispatcher log). Re-sent via `send_to_oracle(name=06-gemini)` 22:24 (texture masking + exposure gain code reads); retracted "No.6 unresponsive". Memory `oracle-channel-reply-is-broadcast-not-inbox.md`, learning `lLyg5RQ0WGIpAYmSETx9S`.
- Handoff 22-12 → renamed 21-12 (previous session's hand-typed times ran 1h ahead); real times from `date` only.

## ⭐ No.6 finding 22:19 (answered in 5 min once sent via send_to_oracle)
- `effects.texture` is **global** (`crates/pipeline/src/finish.rs:220,524-536`, `local.rs:469-475`), no skin weighting.
- **LightCraft already has a skin-mask API**: `crates/develop/src/settings.rs:846-869` `LocalAdjustments { texture: f64, exposure, ... }`; `settings.rs:997-1000` `MaskShape::People { person, parts: ["skin"] }` → `crates/pipeline/src/masks.rs:74-84` `MatteKind::Skin`; also `MaskShape::ColorRange` (949-952); `Mask` struct (1020-1030) combines shape + adjust, read via `s.masks`.
- `light.exposure` = plain `2^ev` (`finish.rs:224-225,427`, `finish.wgsl:283-288`), no curve/clamp → the "LC darker than LR at same EV" effect is in tone mapping, not gain.
- **→ Next experiment (better than skinsmooth.py post-process)**: add `"masks": [{shape: People{parts:["skin"]}, adjust:{texture:-25}}]` to the per-photo settings JSON and set global texture back to −20 → skin smooth in-engine, edges untouched. Verify JSON key names in settings.rs before use.

## Pending
- [ ] **Try in-engine skin mask** (above) on #5 vs skinsmooth.py vs LR; if it works, drop post-process
- [ ] retouch install → run on #5 → 3-way to Bo (LR / skinsmooth / retouch)
- [ ] Bo's eye on fit17 full set (only #8/#12 seen)
- [ ] #13: XMP `PerspectiveUpright=1`, LC does no geometry (RMS 32, colour only −5). #14: floor RMS 8 at exp −0.3, residual = WB 4650K rendering
- [ ] No.6 answers on texture masking / exposure gain (sent 22:24, via correct channel)
- [ ] Bo GO for Bo-Auto refit on 379 ClubSGame frames (read-only fetch of XMP + flat renders)
- [ ] repo: 70+ unpushed commits, Bo has not asked to push

## Key Files
- `/tmp/sombo_dev/` — fit17/ (deliverable), final17/ (D2), fit/ (#5/#7 a–d, t35/t50, ss), auto/ (rawmakase), flat/ (1024px tone-0 renders), gates.py, skinsmooth.py, cmp_skin.py, lrauto.py, make17.py, render17.sh, perphoto_plan.json
- `/tmp/sombo_xmp_diff/profiles_hue2/` (444; 7C hue+2 sha c8dc427c890e, 7M3 74208562496e) — all renders use this
- `scripts/lightcraft/` — gates.py, skinsmooth.py, lrauto.py, xmp2lc.py, variants/d2_17/{README.md, fit17/, m3/, m3s60/, fit/}
- `docs/photo-tools-research-2026-10-14.md`
- Memory: `no-deploy-make-one-photo-beautiful-first.md`, `match-lr-is-floor-not-goal-per-photo-gates.md`, `oracle-channel-reply-is-broadcast-not-inbox.md`
- Arra learns: GrCAAdIT (tone gap), 4IPqua69 (พอดี criteria), lLyg5RQ0 (reply≠inbox); HAOS milestones 1d239617, 743040ba, 15f1d39c
