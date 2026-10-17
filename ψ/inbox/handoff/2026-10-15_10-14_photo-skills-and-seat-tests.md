# Handoff: photo-cull/photo-edit skills + No.3/No.4/No.6 tests on the standard

**Date**: 2026-10-15 10:14 +07 (from `date`)
**Context**: ~38% / 1M · model opus-5.5[1m] · cost ~$39
📡 Session: f3b2309d | sombo-oracle | since 08:08 /clear

## Bo's orders today (all in force)
- Neutral base first, then one step at a time; detail = LR's exact values; no texture cuts or sharpen boosts; skin smoothing only as a later masked plugin ("อย่าฝังใจ").
- Fix only the photos Bo names. Never spread changes to frames he passed.
- Look at the photos BEFORE editing (cull stage notes which frames are over). Make it a STANDARD so other seats/people can follow it.
- Photo work runs on **MacLab only**.
- Task seats via `send_to_oracle` (Bo sees it), not by typing into a seat's terminal.
- Seats send their photo pairs to Bo's DM themselves when done.

## What We Did (verified)
- F3 → G3 → N0 → N1: Bo approved N1 (15 N0 + #5/#7 back to the 10-14 fit d). Root of the #5/#7 repeats: approvals lived only in logs, and a global "skin ≥ LR" rule re-copied LR's own over-exposure.
- `scripts/lightcraft/STANDARD.md` v2.1 (8 ordered steps + definitions), `standard_check.py` (gate: notes-before-render, skin/neutral/clip/edge, detail = LR, `--no-lock`), `variants/d2_17/approved/` (LEDGER, LOOK_NOTES, lock_check). Commits ecd8bf0, fe0c8ef.
- skill17 (my run of the 2 steps from scratch): passes all visual gates, clip ≤ N1 everywhere. 17 pairs sent to Bo (`/tmp/sombo_dev/pairsSK/`). **No verdict yet.**
- Skills **photo-cull** + **photo-edit** (`.claude/skills/`, tracked copy `scripts/lightcraft/skills/`), tools `photo_cull.py` / `photo_edit.py` (refuses while LOOK_NOTES has TODO rows). CLAUDE.md rule added. Commit 72f2a50.
- Gemini vision via 9router `ag/gemini-3.1-flash-image`: ~2,140 tokens/frame (≈2.1M per 1,000). Fine for culling; **wrong on face exposure** (called #5 "ok").
- **No.3** (ClubSGame, Hermes-style psmux Claude, highclass-oracle) did the 17 on MacLab: ≈ my set (RMS ~2). It wrote LOOK_NOTES after rendering. Its #13 has a white wedge; its settings re-rendered by me are clean → it used a different render path (not investigated). Its 5 "unclear" points were folded into STANDARD v2.1.
- **Pipe finding:** No.3 has no oracle-channel plugin. ClubSGame MQTT inbound is dead since 10-10 (task Ready, log 10-10). Sent to No.1 (8f1f988f). No.3 outbound `send_to_oracle` works.
- **No.4 + No.6** got the skill task via send_to_oracle (10:05). At 10:14: No.6 **17/17 rendered**; No.4 notes done (0 TODO), rendering not started. Both were told to send pairs to Bo's DM themselves.

## Mistakes today (memories saved)
- Called No.4 "agy": it is **Hermes** (`~/.hermes-no4/venv/bin/hermes chat`). Called its LARGE CONTEXT MODEL SWITCH screen a rogue change. Said MQTT to No.3 was "sent" (never arrived). → `seat-facts-need-same-turn-evidence.md`.
- Earlier: blurred photos (texture −45), over-sharpened, ignored my own lightcraft-pro skill. → `neutral-base-first-lr-detail-values.md`.

- **10:15 update:** monitor ended. No.4 **17/17 rendered** too. Both sets complete in /tmp/no{4,6}_photo17/out.

## Pending
- [ ] Bo verdict on skill17 (and No.3 / No.4 / No.6 sets)
- [ ] Check No.6's and No.4's pairs actually landed in Bo's DM. If not, find out why (seat's own Discord tool) and send on its behalf only if Bo wants
- [ ] Run `standard_check.py /tmp/no{4,6}_photo17/out --no-lock` myself + compare vs skill17; report the differences to Bo
- [ ] **No.4 model:** D-039 (10-14 14:03) = `ag/gemini-4-argon-medium`, but config.yaml:4 + desired-state = `ag/gemini-3.8-flash-medium` (comment "Bo 00:51", no decision on record). Asked Bo to confirm argon; don't change until he does. If yes: both files + D-044 + check the screen
- [ ] No.1: ClubSGame MQTT inbound for no3 + real ping test in drift-check
- [ ] No.3 #13 white wedge cause (ask over Discord or check its transcript)
- [ ] Delete ClubSGame copy `E:/Agents/highclass-oracle/sombo_photo17` (~525MB) only after Bo OK
- [ ] Old: Bo-Auto refit (ClubSGame 379 frames, GO pending), #13 Upright, 146 unpushed commits (Bo hasn't asked)

## Next Session
- [ ] DM Bo the return report, then check DM history for No.4/No.6 pairs + Bo's verdicts
- [ ] Verify No.4/No.6 sets with standard_check + side-by-side vs skill17; send Bo one short comparison

## Key Files
- `scripts/lightcraft/STANDARD.md`, `standard_check.py`, `photo_cull.py`, `photo_edit.py`, `skills/`
- `scripts/lightcraft/variants/d2_17/approved/` (LEDGER, LOOK_NOTES, s_N.json = N1)
- `/tmp/sombo_dev/{dimN1,skill17/final,pairsSK}` · `/tmp/no3_photo17/out` · `/tmp/no4_photo17/out` · `/tmp/no6_photo17/out`
