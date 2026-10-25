# Handoff: Velaa 18.10.69 edit — 413 rendered with Bo's recipe · LC v0.13 update with No.4

**Date**: 2026-10-25 15:25 · **Context**: 42% (auto-forward)
📡 Session: 4c84aa7c | sombo-oracle

## ⚡ FIRST THING
- Bo talks on **Mattermost DM**. The bridge is broken (lost MQTT ~12:34; attachments `files=0`) → **post via MM API**:
  token `~/srv/mattermost/bridge/.sombo-token`, channel `zxbf5ks4gbrf7jz4zzaqk97pfy`, upload `POST /api/v4/files` then `POST /api/v4/posts` with `file_ids` (build the JSON in Python, not shell). No.1 was asked to restart `com.maclab.mm-bridge-sombo`; once it's back, test one `[file:]`.
- **Send photos ONE per message, numbered** — MM reorders multi-attach posts (I fixed the wrong frames twice because of this).
- **Bo 15:25 on the last 10**: "9 เอาออก — มึงแต่งภาพมึงไม่รู้เหรอว่าอันไหนควรไม่ควร" → #391 removed (keep now **412**, `final/391*` moved to /tmp/old_final). Others in that set not objected. **Lesson: Bo expects me to cull by taste too** — before Full/SSD, look through all 412 (heads.py + view sheets) for frames like #391 (awkward pose/expression, hand on face, unflattering) and propose cuts in one list.

## Job: 18.10.69 คลินิก Velaa (repeat client, paid another 3,000)
- RAW `/Volumes/Club S/18-10-2026` (618 ARW) · workdir `~/Downloads/cull-18.10.69/`
- Cull: `out2/result.json` keep 413 (dup 174 · blur 10 · beauty 20 · no_flash 1 · eye swaps 3). Swaps `#478→#477 #51→#50 #6→#4` (plan.json also swapped).
- **Recipe (all Bo-passed)** = `~/Downloads/cull-18.10.69/setrender.py`: s_1 + Tint 3 + Orange −22 + Temp by room: curtain 5306 · facial 4800 · procedure 4732 · bench 4922 · counter 4600 · arch 4600 · **drip 4300 (#≤167, midday, Bo 15:17) / 4600 (afternoon)**. Procedure session #550–594 = #580 recipe (Orange −5, −0.2 EV, Highlights −60). Per-frame devs: `296:1.1 515:-0.2 335:-0.4`. Exposure base = `ed/plan.json` ev.
- **Renders**: `final/NNN.jpg` 413/413 (2048, 300ppi, EXIF kept) + `.jpg.json` settings. Verified 7 Bo-approved frames match exactly.
- **Gemini check**: `gemini_final.txt` ran on the OLD drip/swap renders (~240/413 when I left). Re-run on the 21 drip midday frames + #4 #50 #477, then read flags: real ones = colour/face light; ignore composition notes and #172 "upside down" (true orientation).
- Gemini also flagged **#171 #173 face too bright, #104 backlit dark** — check 1:1 before proposing.

## Tools built this session
- `scripts/lightcraft/gemini_look.py` — Gemini 3.8-flash-high via 9router (`stream:false`), full 1536px → skin/face_light/WB per frame. Calibrated: agrees with Bo on every judged frame.
- `scripts/lightcraft/ev_velaa.py` — ZONES (room labels by frame range), plan/render/deliver modes. **Its BO_OK temps are now stale vs setrender.py** — setrender.py is the truth.
- `~/Downloads/cull-18.10.69/`: `setrender.py` (recipe), `heads.py` (crop every head → eye check), `skinref.py` (face skin Lab), `wbsolve.py`, `faceclip.py` (flash clip on faces only), `rejudge.py` (cull overrides).

## What We Did (verified)
- Return report sent; venv `/tmp/sombo_xmp_diff/.venv` rebuilt.
- Cull 618→413; cull.py blur cuts were wrong 15/25 (focus on clothes) → restored.
- Edit iterations with Bo: time-scene WB → room WB (Bo: same zone same WB) → orange fixes → numeric R−B over-correction (Bo: only ONE was orange, others just dark — I over-fixed) → Gemini as eye → per-frame fixes Bo OK'd (#139, #296, #580) → full 413.
- MQTT reply to No.4 (room main) on LC update plan + skill inputs.

## Pending
- [ ] Bo verdict on last 10 → then **Full renders** (`--size 0`, 2 parallel) + delivery: `/Volumes/Club S/Clubs Back Up/18.10.69_Velaa_Clinic/{2048,Full}/Club S-N.JPG` (capture order) + `delivery_map.csv`. Folder name NOT confirmed by Bo — ask in one line. Layout = same as `21.10.69_Graduation_Party`.
- [ ] **LC update (Bo 15:20)**: No.4 leads. Installed `lightcraft-cli 0.7.1` has local patches the hue2 profile needs (No.4: dng_color, FM/CM rebalance, scene-linear, tone). Local repo `~/Code/github.com/storytold/lightcraft` is **mid-merge** (UU camera_preview.rs, media.rs), 1669 behind origin, latest tag v0.13.0. Plan: branch-save → rebase 4-file patch on v0.13 in a worktree → build to /tmp → A/B 10 frames with `final/*.jpg.json` (Gemini + skinref) → Bo decides. **Never overwrite ~/.local/bin/lightcraft-cli.**
- [ ] **/goal (Bo 15:21)**: build the LC photo skill with No.4 (MQTT buddy) — fold today's lessons into `.claude/skills/photo-cull` / `photo-edit` + No.4's `clubs-photo-cull-and-edit-v3`: room/session WB, head-crop eye check every frame, Gemini on every frame, one-photo-per-message numbered, fix only what Bo names (orange→Temp, dark→exposure), flash spill measured on faces only, ambient/weak-flash split (No.4 point).
- [ ] MM bridge restart (No.1) · 7 HAOS merges held · sync-job consolidation · gmgrok/mimo secrets (No.1/No.4) · Bo decisions from earlier handoff (github connect, gemini-oracle history, old vault copies).

## Memory written
- `one-wb-per-room-not-per-time` (+ MM reorder lesson) · `gemini-is-my-photo-eye`

## Next Session
- [ ] DM Bo back (MM API) + read his reply on the last 10
- [ ] Re-Gemini the changed frames; finish flags; Full + SSD after Bo OK
- [ ] Sync with No.4 on LC A/B + skill
