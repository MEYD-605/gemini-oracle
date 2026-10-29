# Handoff: Z Flip 5 (Jayson unit) — Samsung account ghost, Knox Guard, gm-aicore path fix

📡 SESSION: 20261028_184308_2cfa608b | Mattermost DM khunbo | cc/claude-opus-5-5

**Date**: 2026-10-29 11:35
**Context**: high (~120 turns)

## Device map (do not confuse)
| | Bo's unit (gm-aicore) | Muk's unit (Rdda) |
|---|---|---|
| Tailscale name | z-flip5--jayson | z-flip5--chutinun |
| IP | LAN 192.168.1.197 / TS 100.95.245.81 | TS 100.80.103.72 |
| Serial | R5CW813M11T | unknown (ADB unauthorized — never touched) |
- Bo bought the Jayson unit outright as a broken/salvage phone. It is Bo's property — do not question ownership again.

## What We Did
- **gm-aicore control path fixed** (Muk iMac 100.83.15.49): `nc -z -w 1` does NOT bound connect time on macOS → 75s hangs. Changed to `nc -z -G 1 -w 1` in `~/.ssh/config` (Host zflip5) + `/usr/local/bin/zflip5-adb`. Backups: `~/.ssh/config.bak-20261028-nc`, `~/zflip5-adb.bak-20261028`. Verified 4s round-trip, works with phone Tailscale OFF.
- **maclab rebooted itself ~20:47 on 10-28** → gm-aicore gateway lost arra-v4/structor MCP. Restarted via `~/.hermes-gmaicore/start-gateway.sh`; 0 reconnect errors after. Root cause of the reboot NOT investigated yet.
- **Cover-screen QS**: Samsung whitelists subscreen tiles; Rotation + Tailscale cannot be added (reverted in ~10ms). Plan offered: overlay bar in `dev.opencover` (source `~/z-flip5-prep/OpenCover`). Awaiting Bo go.
- **Account audit** (skill `android-account-and-identity-triage`):
  - Google: old accounts removed 10-27 20:24, ours `ai.no.1bro@gmail.com` added 20:26 ✅
  - **Samsung account `jaysonknappy@gmail.com` still signed in** (com.osp.app.signin + coreapps + mobileservice). Child accounts re-created 10-27 16:01 by mobileservice → why the email "comes back".
  - scloud daily sync jobs push contacts, calendar, **Wi-Fi profiles**, Samsung Pass, Notes to Jayson's cloud. FMM (Find My Mobile) service running → previous owner can locate/lock/wipe.
  - `knox.kg.state=Checking` (KG device admin `com.samsung.android.kgclient`, enforced). Checking = not locked; release timing NOT verifiable from device. My earlier "7 days and it clears" claim was unverified — corrected to Bo.
  - Suspicious: `com.comos.themes.merrychristmas` (uid 10366) called account_remove dozens of times since 2025 (never succeeded).

## Pending
- [ ] Bo decision: pause Samsung cloud sync to Jayson's account (reversible, no deletion) — offered, not done
- [ ] Bo decision: uninstall `com.comos.themes.merrychristmas`
- [ ] Bo to ask seller about removing Samsung account / KG history; fallback = Samsung service center with receipt
- [ ] Bo decision: build OpenCover overlay (Rotation + Tailscale) for cover screen
- [ ] Investigate maclab self-reboot ~20:47 10-28
- [ ] Bo asked about "ใบแรก" (first receipt/document?) — unclear, asked him to clarify / send photo

## Next Session
- [ ] If Bo approves: `pm disable-user`/sync-off for scloud on R5CW813M11T, re-run `dumpsys content | grep osp` to confirm jobs gone
- [ ] Re-check `getprop knox.kg.state` daily
- [ ] Never factory-reset this unit while Samsung account is attached (FRP lock)

## Key Files
- /Users/admin/.hermes-no4/skills/mobile-devops/android-account-and-identity-triage/SKILL.md
- Muk iMac: ~/.ssh/config, /usr/local/bin/zflip5-adb, ~/.hermes-gmaicore/start-gateway.sh
- ~/z-flip5-prep/OpenCover (cover-screen app source)

## Lesson
- Bo's DMs: plain Thai, no raw logs. Don't imply a device is stolen or ask ownership questions — Bo buys salvage units outright.
- Typing text before `/forward` (e.g. "คำสั่ง/forward ...") is not parsed as a slash command — it arrives as plain text.
