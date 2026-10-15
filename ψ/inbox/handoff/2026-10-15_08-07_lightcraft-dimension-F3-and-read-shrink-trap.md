# Handoff: LightCraft #12 dimension (F3 recipe, 17/17 rendered) + Read-tool shrink trap

**Date**: 2026-10-15 08:07 +07 (from `date`)
**Context**: 29% / 1M · model `fable-5.1[1m]` (Bo D-042 9router combo 01:04) · cost $17.32 this session
📡 Session: 03530ff4 | sombo-oracle | since 2026-10-14 22:21 /clear

## Bo's orders (all still in force)
- NO deploy anywhere (21:22). Per-photo, never one recipe (21:43). Beauty > LR parity.
- **22:42 "ใส่ผิวเนียนทำเหี้ยอะไร … ทำให้มันสวยกว่าเดิม มีมิติ แสงเงาครบถ้วน"** → skin smoothing was an unasked side quest. Goal = dimension: light→shadow, face shape, subject/bg separation, roll-off. Memory `dimension-not-smooth-skin.md`.
- **01:03 send photos as single full-size attachments, 4–5 in a row OK, never collages/contact sheets** (phone can't zoom). Memory `send-photos-individually.md`.
- 01:06 on D/A: "ผิวหน้าคนเขาดูเนียนกว่าเยอะ ของเราแข็งไป" → fixed by removing clarity + masking sharpen (NOT smoothing).

## What We Did (verified)
- Return report + drift 30/30 at 22:22.
- In-engine skin mask trial: People{skin} = saliency heuristic without SAM 3 (`masks.rs:259-270`); colorRange works only with OkLab samples in engine space (tonemapped linear 2020, skin L≈0.6; No.6 found it). mask17 rendered → **then Bo rejected smoothing**. mask17 / retouch / skinsmooth parked in `/tmp/sombo_dev/{mask17,mask5,retouch_out*}` (not deleted). retouch (dennisbrian) changes no skin → dropped.
- Dimension variants on #12 (`scripts/lightcraft/variants/d2_17/dim12/README.md` has the full log): A sculpt, B separate, C light-shape grading, D combo → D tinted neutrals (R−B +5..+11) and both A/D roughened skin (clarity +12 + sharpen high: hp2 3.63 vs LR 2.76).
- E-line (no clarity, low-freq tone) → still hard on 14/17 when rolled out.
- **F3 delta** = contrast 8, blacks −45, whites 8, shadows 4, texture −45, clarity 0, sharpen 35 / masking 50, vignette −10, mixer yellow/aqua sat −15, plus per-photo **relative** exposure +0.26 and highlights −13 on each frame's own fit17 settings. Rendered 17/17 full size: `/tmp/sombo_dev/dimF3/Club S-N.jpg`. `gate_set.py`: **16/17 pass** (only #1 skin hp2 4.92 vs LR 4.57); skinY 179–191, R−B ≤2.7, face shape = LR, clip = LR's own flash clip.
- #12 F3 sent to Bo 01:25 (full res) with correction note.
- **Trap**: Claude Code `Read` on a JPEG rewrites it on disk at 666×1000. The E4 sent Bo 01:16 was shrunk. Re-rendered, audited fit17/dimF3/dim17_E/mask17 = all full size. Memory `read-tool-shrinks-images-on-disk.md`; feedback draft queued. **View a copy, never the deliverable; check `Image.open(p).size` before measuring/sending.**
- Arra learns eOHsDDIC (People mask heuristic), 1pdiTlOt (colorRange engine space); HAOS milestone f6df3352 (mask17 — now parked).
- settings.json model changed to `fable-5.1[1m]` at 01:08 = Bo D-042 combo (desired-state.yaml line 18). drift-check ❌ "want cc/claude-fable-5-1" lines are the checker reading an old want, not real drift; also ❌ 9router 402 grok-cli/grok-4.7 at 01:08 (not mine). Not fixed — No.1/No.4 own D-042.

## Pending
- [ ] **Bo verdict on #12 F3** (sent 01:25, no reply by 08:07)
- [ ] If OK: send the other 16 from `/tmp/sombo_dev/dimF3/` one image per message (≤5 per burst), note #1 slightly harder than LR
- [ ] If still แข็ง: raise sharpen masking / texture only, keep the tone stack
- [ ] drift-check desired-state wants vs D-042 combo names (owner: whoever landed D-042; report to No.1, don't edit seats' models)
- [ ] Bo-Auto refit on 379 ClubSGame frames (GO pending since 10-14)
- [ ] #13 Upright geometry · #14 WB floor RMS 8
- [ ] 119 unpushed commits (Bo hasn't asked to push)

## Next Session
- [ ] DM Bo return report, then check Discord for his F3 verdict
- [ ] Act on the verdict: roll out 16 singles, or adjust masking/texture on #12 and re-gate all 17 with `dim12/gate_set.py`

## Key Files
- `/tmp/sombo_dev/dimF3/` — current candidate set (17, full size) + s_N.json
- `/tmp/sombo_dev/dim12/` — apply_delta.py, gate_set.py, delta_{A,D,E,F1,F2,F3}.json, #12 variant renders
- `scripts/lightcraft/variants/d2_17/dim12/` — repo copies + README (full numeric log)
- `/tmp/sombo_dev/fit17/` — base per-photo settings every delta is applied onto
- Memories: dimension-not-smooth-skin, send-photos-individually, read-tool-shrinks-images-on-disk, lightcraft-colorrange-mask-engine-space
