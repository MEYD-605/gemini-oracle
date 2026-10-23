# Handoff: 8T — STOPPED per Bo 12:12 · next session pointer

**Date**: 2026-10-20 12:17
**Context**: 63%
📡 Session: 16ba4194 | cartographer-oracle

## UPDATE 12:46 (supersedes lines below where they conflict)
- 8T now runs **r34 (#35)** on boot_b (No.4 rollback 12:22 + cold boot 12:41 via Bo), NOT r36. actual_brightness blackout is live again; brightness sysfs 0444 lock is load-bearing. Modem + display clean at boot.
- r37 (#38) built + No.4-ACKed, NOT installed: ~/oneplus-8t-prep/r37-stage/INSTALL-r37.md. Needs Bo's explicit "ลง r37".
- r38 sensor swap plan: ~/oneplus-8t-prep/stock-oneplus/PLAN-sensors-swap.md (stock OnePlus configs obtained; project_name=19805).
- 12:16:20 silent warm reset with NO seat activity → "experiments cause resets" is not the whole story. 12:12:28 DPMS-off followed 15 physical power presses (not a seat).
- Full chronology: ψ/inbox/handoff/2026-10-20_11-43_8t-r36-live-goal-sensors-rearcam.md (commit 4f91cd0).

## READ FIRST
- Full detail (chronological, all evidence, corrections): `ψ/inbox/handoff/2026-10-20_11-43_8t-r36-live-goal-sensors-rearcam.md` (commits 09305d2, 4d3eeb7)
- No.4's joint brief + rules: `ψ/inbox/handoff/2026-10-20_11-50_8t-fresh-start-brief-from-no4.md`
- Model now: cc/claude-fable-5-1 (Bo 11:50). Bo: Thai only, short, no raw logs.

## What We Did (today, short)
- r36 kernel (#37) installed + verified: reading actual_brightness no longer kills DSI (rollback /root/r36-rollback/).
- Found every "black screen" = dpms=Off; only `kscreen-doctor --dpms on` lights it. Power button was ToggleScreenOnOff (128, my 10:30 change) → set to LockScreen (32) 12:12. Band-aid clubs8t-screen-on removed (backup ~/bak-no5-20261020/).
- BUT dpms went Off again 12:12:28 with 32 live → second DPMS-off source UNKNOWN. Bo said stop.
- Sensors: served SLPI tree is Xiaomi Apollo's (my 10-18 import); real IMU per persist = lsm6dst_0 on I3C bus1 @0x6A; need OnePlus KB2001 stock vendor/odm sensor files.
- r37 folded 0001/0025 verified (git apply) in ~/oneplus-8t-prep/r37-stage; 0030 debug withdrawn.

## Pending
- [ ] Bo: is the screen lit? read-only OK or full stop? (asked 12:14, Discord DM)
- [ ] No.4: ack/nack r37 (REVIEW-r37.md); stock OnePlus vendor/odm sensor files (sent via send_to_oracle 12:14)
- [ ] GmAtom: full change list; any caller of dpms-off; update verify-all to expect PBA=32 (sent 12:14)
- [ ] Revert persist symlink → /mnt/vendor/persist (needs Bo OK)
- [ ] Find the second DPMS-off source (read-only first: powerdevil "could not check for screen configuration", kwin idle, ksmserver/lockscreen)

## Next Session
- [ ] `/recap` → read the two handoffs above → check Discord DM + oracle_replies(04-mimo, gmatom) BEFORE any ssh to 8T
- [ ] Do NOTHING on 8T until Bo answers. Then only what he allowed.
- [ ] /goal file is BLOCKED (ψ/goals/2026-10-20_11-30_*). Re-check with `goal.py check` only after Bo's go.

## Key Files
- ~/oneplus-8t-prep/r37-stage/{0001,0025}-*.patch, REVIEW-r37.md
- ~/oneplus-8t-prep/goal/check.sh (uses host 8t-wifi)
- 8T: ~/.config/powerdevilrc (PBA=32; backups .bak-gmatom-0637=8, .bak-no5-1212-toggle128=128), ~/bak-no5-20261020/, /root/r36-rollback/
