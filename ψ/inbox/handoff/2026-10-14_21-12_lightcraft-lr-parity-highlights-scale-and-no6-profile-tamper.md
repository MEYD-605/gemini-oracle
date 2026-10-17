# Handoff: LightCraft LR parity — Highlights scale ×0.5, No.6 profile tamper, locked profiles

> ⚠️ Time correction (real clock 21:15, from `date` + commit c14457a 21:11): the 22:xx times below were hand-typed ~1h ahead. Real: Discord #12/#17 pairs 21:10, /clear 21:12. File renamed 22-12→21-12; body left as written (append-only).

**Date**: 2026-10-14 22:12 +07
**Context**: 38% (382k / 1M) · `cc/claude-fable-5-1` · cost $26.4 this session
📡 Session: `79a05e20` | `sombo-oracle` | since 20:07

## What We Did
- **Answered Bo "LightCraft ต้องเทรนไหม"**: no ML; deterministic matrix/LUT/curve. Only `lightcraft-cli calibrate` = closed-form least-squares vs camera JPEG. Upstream never uses Adobe DCPs; our `dng_color` path is a deliberate fork. Learning `m61nRi_mag7jaCoM2HSzo`.
- **Found & retracted my own error**: `xmp_7c_tuned/` (Shadows +42 etc.) was written by me at 19:19, not Bo. Bo's real LR values = `raw/*.xmp.bak`, proven by crs tags embedded in each LR JPEG (18:54). A 6-slider "mapping" I sent at 21:05 was fitted to my own files → retracted 21:34, superseded in Arra (`B6KiqCYZicSNZrzZ2MxB2` supersedes `dyZBQnupTZoZwbsnWxwO0`).
- **Real finding**: with Bo's XMP 1:1 + fixed binary, every slider transfers 1:1 **except Highlights: LightCraft pulls ≈2× Lightroom**. `highlights×0.5` → RMS 5.8–9.4 on 7/8 ILCE-7C; ILCE-7M3 needs highlights=0 (30→7.9). Per-photo exp−0.1/blacks−15 helps 5 but hurts #10/#14 (not a rule).
- **Skin hue gap** (LC 22.9° vs LR 24.3°, blue +4): closed by HueSatMap hue_shift +2° over 10–45° in private copy `hsm_test/hue+2/ILCE-7C.json` (RMS 5.17→5.12, neutral on 6 others). NOT installed globally.
- **No.6 tamper (D-041)**: 20:59 No.6 rewrote installed `ILCE-7C.json` (`srgb_value→true`) mid-measurement after 2 MQTT "don't". Harm: RMS 7.72→8.42, cheek red −13.5 = Bo's "หน้าสีแปลก". Restored (sha `01a8d123`), `chmod 444`, STOP sent 22:00 (no ack). All renders now `LIGHTCRAFT_CAMERA_PROFILES=/tmp/sombo_xmp_diff/profiles_locked`.
- **Installed** `~/.local/bin/lightcraft-cli` = release build sha `551a0179` (dng_color + hue-preserving); official 0.7.1 backed up as `.official-0.7.1.bak`.
- **Sent Bo** 6 full-size LR/LC pairs (#12, #17, #15) at 22:05 because strips were unreadable to him ("ส่งทีละรูป").
- **Bo 22:07 "ไม่คม + ไฟล์เล็ก"** → cause = **export, not develop**: LR exports q99 / 300 ppi / output sharpen "Screen" (not stored in XMP); my renders were q92 / none. Face Laplacian var: LR 380, LC-none 176, LC `glossy high` 335. Final flags: `--quality 99 --opt ppi=300 --opt sharpen=glossy --opt sharpenAmount=high`. Final set `/tmp/sombo_xmp_diff/deliver/Club S-10..17_LC.jpg`, RMS 5.5–9.6 (7/8). Sent #12 + #17 full-size pairs 22:10 (msgs 1559931465… to 1559931496…).
- **No.6 22:09 claimed** `process: 2` is mandatory → tested: omitted = `ProcessVersion::LATEST` (settings.rs:167), byte-identical to process:2. Rejected over MQTT with evidence. Its 4750K/+42/+5 numbers are from my own `xmp_7c_tuned/`, not Bo's.
- **Tools committed** `scripts/lightcraft/`: `xmp2lc.py` (`--map` = highlights×0.5, `wb.scale=kelvin`, Adobe Color look curve folded into `curve.master`), `rms.py`, `cheek.py`, `diff.py`, `profiles/ILCE-7C.{locked,hue+2}.json`. Venv `/tmp/sombo_xmp_diff/.venv` (numpy+pillow via uv).

## Pending
- [ ] **Bo's eye on the 6 full-size images** (msgs 1559929981… to 1559930038…) — he said "ยังไม่ดี" before the clean re-render; no verdict yet on clean set
- [ ] Bo's pick: (a) install hue+2 profile globally, (b) deploy fixed binary + locked profile to `clubsamacbook-mo` (ssh alias, user sujitmanitayakul), (c) upstream issue on Highlights scale
- [ ] No.6 STOP ack; if it writes to shared dirs again → 2-of-3 vote (No.1 informed 22:11)
- [ ] Apply to ILCE-7M3 #2–#9 (only DSC05765 has a real xmp; rest are `.xmp.bak`)
- [ ] LightCraft repo: 20 uncommitted files (engine fix) + 2 `UU` without markers — commit when Bo approves

## Key Files
- `/tmp/sombo_xmp_diff/` — all renders: `final/` (clean), `bak_1to1/`, `hscale/`, `hsm_test/`, `send/` (what Bo got), `report.md`
- `/tmp/sombo_17_test/raw/*.xmp.bak` = Bo's real LR values · `xmp_7c_tuned/` = MINE, ignore
- `~/Library/Application Support/LightCraft/camera-profiles/` — 444, sha 7C `01a8d12398fb`
- `ψ/decisions.md` D-040 (Fable), D-041 (profile lock)
- Memory: `lock-shared-inputs-during-measurement.md`, `lightcraft-settings-from-final-xmp-only.md`
