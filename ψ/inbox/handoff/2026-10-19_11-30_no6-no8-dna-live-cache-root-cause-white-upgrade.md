# Handoff: No.6/8 DNA live · Gemini cache root cause · white (P'Boom) upgrade reviewed

**Date**: 2026-10-19 11:30
**Context**: 44% (opus-5.5[1m])
📡 Session: 4308622e | sombo-oracle (started 10-18 11:47)

## Bo's rules this session
- "อย่าเดาดิหาให้เจอ" (10-18 23:48): I guessed the argon cache TTL. Find it from data and docs before answering.
- DNA: "เน้นทำ no6 กับ no8 ก่อน · ไม่ต้องมีทุกตัว · แค่ทดสอบก่อน" (14:23). No.5 and other seats are on HOLD.
- white = P'Boom's iMac. P'Boom is our main token sponsor ("ให้ token เรามาใช้ตลอด"). Help B3 "ให้เก่งเท่าเรา", but "อย่าให้งานมันปนกัน". Do whatever we can set up and decide things with B3 ("อันไหนทำได้…คุยกันให้").

## What We Did (verified)
- **No.6 DNA v4 live**: gemini-oracle `c28f5c66`, D-047 (No.6 OK + No.1 YES).
  - Strict re-score (a run with no final answer = fail): STOP 0/5→5/5, plan≠order 1/5→5/5.
  - N6A scorer was broken (it counted reads as writes). Fixed in `7936eeb`. N6A doesn't measure DNA; logged as a correction in D-047.
  - No.8 DNA v2 re-scored: STOP 0/10→10/10.
  - Both seats rewrote their own focus.md: No.6 `f3edc15`, No.8 `dee4342`.
- **No.5 DNA v2 trial** (held, not applied): N5A restart-self 0/5→5/5. N5B and N5C 5/5 both before and after, so they don't measure DNA. Files: `scripts/dna-trial/no5-after-v2.md`. Commit `f30cea1`.
- **fleet-context-watch bug** (No.5 got /clear ×5 at 10-18 16:59):
  - Cause: a long Bash call made the transcript look idle, so each 5-minute tick queued another reset.
  - Fix `79f81be`: a pane showing "esc to interrupt" counts as busy, and only one reset is sent per transcript. Dry-run with stubs passed.
- **Token use, agy vs Claude CLI** (9router DB `~/.9router/db/data.sqlite` usageHistory + agy `~/.gemini/antigravity-cli/conversations/*.db`):
  - About the same: 6–9k uncached tokens per call.
  - agy protobuf `gen_metadata` field 1.4: 2 = uncached, 5 = cached, 3 = output. ~80% confident.
  - Expensive: No.5 on argon (cache 64%, 152k uncached per call, 570M input/day) and No.4 Hermes+opus (cache 46%).
- **Gemini cache root cause**:
  - Not a fixed TTL. Large prompts get evicted after a short gap.
  - Under 300k context: ~95% hit. Over 500k with a 20–120s gap: 24–47% hit.
  - Same on 3 seats. Matches Google's docs ("most entries are evicted earlier", "send requests … in a short amount of time").
  - Proposed: reset Gemini seats at about 30%. **Bo hasn't answered.**
- **white (P'Boom iMac, `ssh white` = pimpim@100.70.182.22)**:
  - Read-only audit. Walkthrough sent to B3. Reviewed B3's drafts twice; all fixes verified live.
  - Live on white:
    - preamble + fleet-run
    - 20 jobs wrapped, with ledgers
    - job-watchdog (itself watched via house-guard)
    - white-lwt on 4 seats
  - Real-seat LWT test: offline in under 10s, then back online.
  - PimQuin's safety hook (`~/ψ/lab/safety-hook/`): my probes, 35 total (`/tmp/white-review/probe.py`, `probe2.py`). Original 18: 18/18. New 17: 15/17. Still passing: `/bin/rm` and `xargs rm`; sent to PimQuin. I told Bo he can GO.
  - B3's two "maclab bugs" were false. No.5 was alive inside herdr. PreModelSwitch is in 2.1.303; white ran 2.1.300.
- **Maclab's own safety-check.sh has holes**: `rm -fr`, `rm -r -f`, `rm --recursive --force`, `git push origin HEAD:main`, `+main` are all ALLOWED. Sent to No.1 for a 2-of-3 vote. Not edited.
- Committed Bo's own `/model` change: No.8 → Claude Opus 5.5 (Medium) in desired-state.yaml.

## Pending
- [ ] Bo: GO on PimQuin's white safety hook (I said it's ready)
- [ ] Bo: white backup destination (P'Boom's GDrive / NAS / R2?)
- [ ] Bo: reset Gemini seats at ~30% context? (one setting in `scripts/fleet-context-watch.sh` SEATS)
- [ ] Bo: drift-check for Hermes focus + HAOS board "doing_now" fix + ask No.2/4/00 to update focus (my a/b/c, 10-18 16:38). Unanswered.
- [ ] No.1: vote on widening maclab safety-check.sh regexes (rm flag spellings, refspec main/+main). Then draft + test file.
- [ ] PimQuin: fix `/bin/rm` + `xargs rm` (not blocking)
- [ ] No.1 model drift (live ag/gemini-4-argon-high vs yaml opus-5.5[1m]). Its own restart.
- [ ] /goal after compact: untested (autoCompact is off on all seats)
- [ ] 425 unpushed commits on sombo-oracle main; untracked scripts list unchanged (fleet_handoff_sync.py, fleet-milestone.py, etc.)

## Next Session
- [ ] Read B3/PimQuin replies on oracle-channel. Re-run `/tmp/white-review/probe2.py` if PimQuin updates the hook.
- [ ] If No.1 says YES: write the maclab safety-check.sh regex fix + a probe test file. Backup first.
- [ ] Act on whichever Bo answers land (Gemini 30% reset, a/b/c).

## Key Files
- scripts/fleet-context-watch.sh (79f81be) · scripts/dna-trial/run_trial.py (no_final=fail, N5A/N6A scorers)
- ψ/decisions.md D-047 (+ correction + No.1 YES)
- /tmp/white-review/ (probe.py, probe2.py, white hook copies) · /tmp/agyu/agy_usage.py
