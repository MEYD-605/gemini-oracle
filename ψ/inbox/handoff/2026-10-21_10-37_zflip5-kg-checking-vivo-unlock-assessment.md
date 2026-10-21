# Handoff: Z Flip 5 arrival — KG Checking blocks OEM unlock · vivo unlock assessment · UPS runtime

**Date**: 2026-10-21 10:37 (+07)
**Seat**: [maclab:04-mimo] · cc/claude-opus-5-5
📡 SESSION: 9_5bf4ed | msgs=292
**Context**: high

## What We Did
- **UPS / ไฟดับวันเสาร์ (เช้า–เที่ยง)**: maclab has no UPS driver link (`pmset` → `UPS Installed: No`). Unit per memory = EcoFlow River 3 (AC pass-through). Estimate ~1.5–2.5 h at idle iMac Pro (~90–130 W) → NOT enough for 3–4 h. `Automatic Restart on Power Loss: Yes` already set. Offered: load-shed Fri night + timed graceful shutdown ~1.5 h after outage. **Bo did not confirm yet.**
- **Z Flip 5 arrived & on adb (USB serial `R5CW720FCDZ`)**:
  - SM-F731B / b5q / THL / Android 16 / FW `F731BXXS7GZI1` (NOT HZIJ as old handoff said)
  - `ro.boot.flash.locked=1`, verifiedboot green, warranty_bit 0 (Knox not tripped)
  - **`knox.kg.state=Checking`**, `com.samsung.android.kgclient` is an active **Device Admin** → OEM unlocking toggle hidden. No adb way to force it; refused to bypass (finance lock).
  - Good: no accounts (no FRP), 512 GB (3.3 GB used), battery healthy 84%, modem sees dtac (no SIM).
  - Auto Blocker was greying out USB debugging → Bo disabled it → adb works.
- **vivo X Fold 3 (V2303A)** reconnected via wireless adb `192.168.1.156:41779` (also :5555). Verified **bootloader LOCKED** (`flash.locked=1`), SM8550/kalama, OriginOS 6, no OEM-unlock prop. Assessed: no official vivo unlock path; only paid EDL service tools → high brick risk + wipe of REA/Termux/AndroidMCP setup. **Recommended NOT to unlock.**
- No.88 Sombo alignment (MQTT): no pmOS/mainline boots on SM8550 yet; BLUEPRINT-B5Q marked THEORETICAL RESEARCH ONLY. KG Prenormal ~168 h.

## Pending
- [ ] Z Flip 5: wait for KG `Checking` → `Completed`; keep Wi-Fi on, do NOT factory reset
- [ ] Bo to ask seller whether device was on installment (which shop / paid off)
- [ ] Bo to decide UPS plan for Saturday outage (load-shed + timed shutdown)
- [ ] After KG clears: OEM unlock → Magisk patch boot (stock FW `F731BXXS7GZI1`) → dd EFS backup to maclab w/ sha256
- [ ] `~/z-flip5-prep/firmware` + `tools` are EMPTY on maclab host (staging claimed in Orb VM `oneplus-builder` — verify)

## Next Session
- [ ] `adb -s R5CW720FCDZ shell getprop knox.kg.state` — check KG state; offered hourly cron watcher → DM Bo on change (not yet created)
- [ ] If Bo wants Linux tonight: Termux + Debian proot on Flip 5 (no unlock needed); real Linux = OnePlus 8T pmOS
- [ ] Download `F731BXXS7GZI1` (matching current FW) via samloader for Magisk patch

## Key Files
- /Users/admin/Code/github.com/MEYD-605/mimo-oracle/ψ/blueprints/BLUEPRINT-B5Q.md (theoretical)
- /Users/admin/z-flip5-prep/ (firmware/ tools/ empty)
- Prior: ψ/inbox/handoff/2026-10-20_19-15_clubs8t-remote-screen-and-zflip5-blueprint.md
