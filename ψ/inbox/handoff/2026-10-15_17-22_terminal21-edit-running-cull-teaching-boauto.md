# Handoff: Terminal 21 job (262 keep, edit running) + cull teaching loop + Bo-Auto v1

**Date**: 2026-10-15 17:22 (from `date`)
**Context**: 48% / 1M · opus-5.5[1m] · session cost $64
📡 Session: d5948dfe | sombo-oracle | since 14:16 /clear

## ⚡ FIRST THING NEXT SESSION — Bo said "มาทำงานนี้เสร็จก่อนดิ" (17:16): finish Terminal 21 before anything else
1. Check background edit: `ls /tmp/sombo_ev1510/out | wc -l` (expects 232) + `tail /tmp/sombo_ev1510/run.log`.
   Started ~17:18 as `uv run --with numpy --with pillow python ev_edit.py --final` in `/tmp/sombo_ev1510/` (renders work/ 1024 ×10 iters, then out/ 2048). If it died (session clear kills bg jobs!), rerun the same command.
2. Edit the 30 added near-dups: `cd /tmp/sombo_ev1510 && uv run --with numpy --with pillow python ev_edit.py --final $(python3 -c "import json;print(' '.join(map(str,json.load(open('added_dups.json')))))")`
   ⚠️ ev_edit.py rewrites result.json/edit_log for only the frames passed — fine, out/ accumulates.
   `frames.json` there already = 262 frames.
3. Gate: `uv run --with numpy --with pillow python /tmp/sombo_ev1510/ev_check.py /tmp/sombo_ev1510/out` (neutral R−B −5..+3, clip ≤0.5%, skin a*>0, skin Y 150..200). Pilot 5/6 PASS (#13 R−B −5.6 at 4 iters).
4. Deliver: `~/Downloads/15.10.69_Drager_terminal_21/Club S-1..262.JPG` (capture order, 2048, q99, 300ppi, EXIF) + `delivery_map.csv` + cuts in sibling folders by reason. Same as 14.10.69 delivery. Tell Bo "ใช้ 262 · ตัด 59" with sample photos SEPARATELY (not collage).

## What We Did (verified)
- Return report 14:16. food_cap.py (c522d07), skill copies synced, TOKENS.md to 14:16 (111.6M total / 2.30M fresh).
- **Cull teaching loop** (Bo: train seats "จนเกิน 100%"): `/tmp/cull_lesson/` (LESSON.md, train 1–250 labels+sheets, exam 251–498, LEDGER.md, feedback/). Held-out #375–498: No.4 r3 72.6% (I leaked "~160" count), No.3 69.4%, cull.py 66.9%, No.6 64.5%.
- **/learn** gaasher/agent-loop-skills + gepa-ai/gepa (2030d2b) → vision-judge hillclimb `scripts/lightcraft/cull_climb/` (5ef9bfd, 05a0790): val 77% but test 59.7% → prompt loop doesn't transfer with 1 event.
- **iMac 100.69.197.66 `/Volumes/Data`** (read-only, พี่โม's machine): RAW 121 shoots, BACKUP 77 delivered. 19 RAW↔delivered pairs by capture time = 10,229 frames (`cull_climb/imac/labels_19events.json`, 17449c6). Delivered sets OK as labels (Bo: Aftershoot + human check). i88l8li (ClubSGame) labels = Aftershoot only → don't use.
- cull.py fix: face-px thresholds scale with image size (6d475b2). iMac navy job: cull.py < keep-all (group-photo jobs keep several per pose).
- **Bo-Auto v1** (Bo "ลุย" 09:41 = GO): 3,910 A7C frames from iMac XMP, leave-one-shoot-out: Exposure MAE 0.30 vs 0.51 stop baseline, Temp 586 vs 1076 K (bc93c40, `scripts/lightcraft/boauto/`). Not usable yet. Crop/angle/Upright pass v2 running on iMac (`/tmp/sombo_7c_v2.log`). Upright never used; CropAngle used on ~all frames (−4°..+3.4°).
- **New job 15.10.69 Drager terminal 21** (`/Volumes/Club S/…`, 321 ARW, 7M3, all flash, 08:14–13:50): previews `/tmp/ev1510/prev`, cull.py `/tmp/ev1510/cull`. My cull v1 169 → Bo "ทำไมตัดเยอะ" → v2 226/229 → blur restore mistake (Bo "อย่ามั่ว") → v4 232 → Bo "260" → **v5 262 keep / 59 cut** (`/tmp/ev1510/result_sombo_v5.json`). Exam copies for seats: `/tmp/ev1510_exam` (No.6 done 213), ClubSGame `E:\Agents\ev1510_exam` (No.3 pending, has teach/TECHNIQUES.md + UPDATE_seminar.md).
- photo-cull skill updated with today's lessons (31761bb). Memories: cull-training-needs-more-bo-events; seat-facts-need-same-turn-evidence (+ "Bo's questions are hypotheses").

## Mistakes today (Bo called out)
- Over-cut Terminal 21 (applied cooking-class "back = cut" to a seminar).
- Agreed with Bo's guess "blur = focused on screen" and restored 8 without evidence; 5 had focus on the wall. Check first, then answer.

## Pending
- [ ] **Terminal 21: finish edit (232 + 30) → gate → deliver 262** ← Bo's priority
- [ ] Score my v5 / No.6 / No.3 vs Bo's verdict once Bo marks cut frames to keep (cut sheets sent were for v2/v4 — out of date after 260 change)
- [ ] No.3 result `E:\Agents\ev1510_exam\result_no3.json`
- [ ] cull.py blur: check if another region is sharp (intentional focus) — only after evidence; today's 100% check: 5/8 "blurs" focus on wall
- [ ] iMac jobs: preview conversion (`/tmp/sombo_prev.log`, low nice) + Bo-Auto v2 crop pass — both running on iMac; then train cull per job type + Bo-Auto with face brightness
- [ ] No.4 lent to Bo — don't task
- [ ] Old: tier B 31 (14.10 job) · Hermes LC-retouch GO · skin-masked WB for flash faces · 192 unpushed commits

## Key Files
- `/tmp/sombo_ev1510/` (ev_edit.py, ev_check.py, frames.json 262, added_dups.json, out/, run.log)
- `/tmp/ev1510/` (prev/, cull/, result_sombo_v1..v5.json, forbo/)
- `scripts/lightcraft/{cull.py,food_cap.py,boauto/,cull_climb/}` · `.claude/skills/photo-cull/SKILL.md`
