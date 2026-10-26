# Handoff: cull v2 done · LC 0.14 verified · No.4 re-editing Velaa with 2-stage + Blessing.cube

**Date**: 2026-10-26 13:11 · **Context**: 41% (auto-forward)

## ⚡ FIRST THING
- Bo talks on **Mattermost DM** (oracle-channel `mm-zxbf5ks4gbrf7jz4zzaqk97pfy`). Bridge works for text; for images post via MM API (token `~/srv/mattermost/bridge/.sombo-token`, `/api/v4/files` then `/posts` with file_ids), **one photo per post, numbered**.
- **Waiting on No.4**: Bo 13:06 ordered No.4 to edit the WHOLE Velaa set with its technique (2-stage backlit S-curve + `lut:clubs-blessing` @85%, Bo liked it on #296 "เออสวยเลยสัตว์"), cull it with cull.py v2, then **I compare against yesterday's delivery** (`/Volumes/Club S/Clubs Back Up/18.10.69_Velaa_Clinic/2048`, settings `~/Downloads/cull-18.10.69/final/*.jpg.json`) and tell Bo whether it's much better. No.4 sends its output folder via MQTT. Compare: face L*/hue/chroma (artist_dna inspect), Gemini, pairs one per message.

## Coordination rules (Bo 10-25 20:25 "คุยกันให้เรียบร้อย")
- No.4/No.6 ↔ me = **MQTT only** (`oracle-send <seat> "..."`), no MM mirror. One owner per task; others verify from logs/files, never re-run.
- **Before any cargo/render/onnx batch: `pgrep -fl 'cargo|rustc|lightcraft-cli render'`**. My cargo test collided with No.4 build 10-25 → 79°C (memory `one-cargo-at-a-time-check-before-build`).
- Owners: LC build/test + artist_dna + LUT = No.4 · cull.py + Velaa delivery = me · Aftershoot model research = No.6.

## Done this session (verified)
- **Velaa 18.10.69 delivered v2**: 404 × 2048 on SSD (Bo "ดีมาก"). #317 −1.0EV; cut #76 #82 #95 (eyes) + #129 #136 #559 #565 #570 #391. v1 (407) in `~/Downloads/cull-18.10.69/delivered_v1_407`. Bo: this job 2048 only.
- **LC 0.13+hue2** installed by me 10-25 20:10 (Bo "แพทดิ"); **LC 0.14+hue2** by No.4 21:54 (Bo order) — I verified == 0.13 Δ0.00 on 10 Velaa frames. No.4 then rebuilt again 10-26 12:14 (tetrahedral LUT + CLI auto-loads `scripts/lightcraft/luts`) — no-LUT renders still Δ0.000. Backups: `~/.local/bin/lightcraft-cli.0.13.0.bak`, `.0.7.1.bak`. **No backup of 0.14 21:54 build (sha 55fb81f2)**; No.4's main.rs/lut.rs edits uncommitted in worktree `~/Code/github.com/storytold/lightcraft-v013` (branch sombo/hue2-on-v014), profile.import block duplicated — told No.4.
- **.cube research** → `ψ/research/2026-10-26_cube-lut-on-raw-lightcraft.md`: LUT runs last on display sRGB, can't recover DR. No.4's Blessing/MarryMe LUTs lift brightness + toe and shift hue to 53°, but skin chroma doesn't rise (16.7→16.4) vs Bo's old look 22–25.
- **cull v2** (commit `ebc69dac`, /goal DONE 6/6, Bo got numbers): `scripts/lightcraft/models` symlink → aftershoot-re-models (gitignored) · `CULL_MODELS.md` (No.6 spec) · `cull.py` adds cant_see P(open) + pitch per face and hint `eyes_vs_burst` (open<0.1 and an eyes-open shot ≤8s, drop ≥0.85) · `cull_exam.py --check`. Velaa eyes 0/3→3/3 (+15/409 to look at); Dräger 12/20→13/20 (+12/329). cant_see alone = looking down reads closed (101/409, 156/329 FP) → hint only, never auto-cut. Pitch gate doesn't separate (#76 −0.29, #95 −0.11).
- Bo asked about type-aware culling (posed / candid / atmosphere) — I proposed rules per type; Bo: "ทดสอบจนแน่ใจแล้วจัดการได้เลย". **Only the eye part is built.** Type-aware rules (no mouth_open on candid, no face rules + no no_flash on atmosphere) still TODO, test with cull_exam before use.

## Pending
- [ ] Compare No.4's re-edited Velaa vs delivered → report Bo (main open item)
- [ ] Type-aware cull rules (above) + exam
- [ ] No.4: commit LC main.rs/lut.rs, keep .bak before installing; artist_dna flags 2/6 Bo-approved (#296, #050)
- [ ] Uncommitted in my repo by No.4: artist_dna.py, luts/clubs/*.cube — No.4's, leave it
- [ ] Old: 7 HAOS merges held · Bo decisions (github connect, gemini-oracle history)

## Memory written this session
`ask-delivery-size-before-full` · `judge-eyes-on-face-crops-not-thumbnails` · `one-cargo-at-a-time-check-before-build`
