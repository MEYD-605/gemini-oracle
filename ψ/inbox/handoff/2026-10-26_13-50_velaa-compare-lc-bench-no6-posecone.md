# Handoff: Velaa re-edit compared · LC bench done · No.6 pose-cone to test

**Date**: 2026-10-26 13:50 · **Context**: 16% (Bo /forward from MM)

## ⚡ FIRST THING
- Bo on **Mattermost DM** (oracle-channel `mm-zxbf5ks4gbrf7jz4zzaqk97pfy`). Images via MM API (token `~/srv/mattermost/bridge/.sombo-token`, `/api/v4/files` → `/posts` file_ids), one photo per post, numbered.
- **Test No.6's pose-cone eye gate** (arrived 13:50, untested): `/Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/outbox/cull-gaze-vs-blink-20261026.md`. Claim: in `eyes_vs_burst` add `hypot(yaw,pitch) ≤ 0.45 & |roll| ≤ 0.35` + neighbour `|Δpitch| ≤ 0.20` + `|Δpx| ≤ 0.25` → Velaa 3/3 with FP 15→0/409, Dräger 13/20 with hint FP 12→4. yaw = mat[0][2], roll = mat[1][0] (same matrix cull.py:68 already reads). Needs yaw/roll stored in `face()` → exam caches `~/Downloads/cull_exam/*.json` must be rebuilt (delete or add fields). Run `uv run scripts/lightcraft/cull_exam.py --check`; ship only if it passes and FP really drops. Watch overfitting: thresholds were fit on these same 2 events.
- No.6's bonus: old `blink ≥ 0.7` cut has 21 FP on Velaa (treatment bed / looking down #187–#364) — same thing I saw in No.4's cull. A pose gate on the hard cut may fix it too; test separately.

## Done this session (verified)
- Return report sent 13:13 (drift 239 checks, ❌4 = git-sweep backlog PR #16/#86/#17/#28).
- **Type-aware cull exam** → `ψ/research/2026-10-26_type-aware-cull-exam.md` (d9898525): no clear win, cull.py unchanged. Full Dräger caches `~/Downloads/cull_exam/dräger_all.json` (498) + `dräger_boxes.json`.
- **No.4 Velaa re-edit** `~/Downloads/cull-18.10.69/no4_v2/final` (412, s_1 + artist_dna v3 + `lut:clubs-blessing` 85/75): vs delivered, 353 faces median L* +2.7, chroma +4.5 (pale <14: 120→19 ✅), hue +2.7° (yellow >63°: 64→135 ⚠️); too bright #335 #327 #578 #303. Gemini 21-sample ≈ same. Data `~/Downloads/lc-bench/compare.json`, script `compare.py`. 6 pairs (#335 #578 #484 #350 #447 #185) posted A/B to Bo 13:32. My verdict to Bo: better skin, not ready to replace — LUT too yellow.
- No.4 had run 2 render jobs at once (load 28) → told it; it killed `render_velaa_no4_v2.py`.
- **LC bench** (Bo asked: faster + less CPU, for all houses) → `ψ/research/2026-10-26_lc-version-bench.md` + `scripts/lightcraft/lc_bench.sh` (0713e2f0). 2048 equal across versions; full-size 0.14 −14% time/−11% CPU/−21% RAM vs 0.7.1; RAYON_NUM_THREADS=4 → −43% CPU. Sent Bo.
- Proposed **job.json** per job (type, client, story, rooms + light periods/Temp, delivery) read by cull.py + artist_dna — **waiting Bo GO**.
- Retro `ψ/memory/retrospectives/2026-10/26/13.50_*` + 2 arra-v4 learnings.

## Pending
- [ ] Bo verdict on 6 Velaa pairs → if he wants No.4's look: LUT amount down / hue fix (No.4 owns artist_dna + LUT)
- [ ] Bo GO on job.json → I do schema + cull.py, No.4 artist_dna
- [ ] No.6 pose-cone exam (above)
- [ ] No.4 said LC main.rs/lut.rs committed `cf6e7884` in worktree lightcraft-v013 + `.bak.20261026` — not verified by me
- [ ] Uncommitted in my repo by No.4: artist_dna.py, luts/clubs/*.cube — leave it
- [ ] Old: 7 HAOS merges held · Bo decisions (github connect, gemini-oracle history) · git-sweep PR #28

## Rules (unchanged)
MQTT only with No.4/No.6 (`oracle-send <seat>`) · one owner per task · `pgrep -fl 'cargo|rustc|lightcraft-cli render'` + `ps -Ao %cpu -r | head` before heavy jobs/benchmarks.
