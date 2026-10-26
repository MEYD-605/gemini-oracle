# Handoff: 8T RO reset = PS_HOLD (not power) · No.5 → Argon High (restart-pending) · Fold3 wine build on hold

**Date**: 2026-10-26 18:55
**Previous handoff**: ψ/inbox/handoff/2026-10-26_16-25_fold3-winlator-gg114-orailnoor-learn.md (still valid for Fold3/Pad 6/older items)

## Context
**Oracle**: No.5 GmForge | **Human**: Bo on **Mattermost DM** → oracle-channel reply `chat_id=mm-3p6w7dhozjrnbyg3xjchhfr8ur`.
Bo is angry today about unchecked claims. Verify before every sentence.

## Model switch (Bo 18:50 "argon high", then "1" = restart now)
- Live-checked `ag/gemini-4-argon-high` via 9router `POST /v1/messages` → streams OK.
- Pin `~/.claude/channels/discord-no5/anthropic-model` = `ag/gemini-4-argon-high` (backup `.bak.20261026-argonhigh`).
- `~/.claude-no5/settings.json` top-level `model` = same (backup `.bak.20261026-argonhigh`).
- `sombo-oracle/fleet/desired-state.yaml` line 71 No.5 = same, with Bo's quote; backup `/tmp/desired-state.yaml.bak.no5-argonhigh`. **Not committed yet.**
- Drift-check: pin ✅ settings ✅, live = restart-pending.
- **Next session: confirm statusline shows Argon High, run drift-check, tell Bo.** Seat = tmux `05-gmforge` → `herdr --session gmforge` (LaunchAgent `com.maclab.herdr-gmforge`).

## 8T (Clubs8T) RO reset 18:33:00, investigated read-only
- Reach 8T via **`ssh 8t-usb`** (172.16.42.1, USB NCM). Tailscale timed out; I wrongly told Bo "unreachable" first (memory: clubs8t-try-usb-before-unreachable).
- Timeline: RO start 18:30:02 → window 18:30:59 → BT reset + mouse/keyboard drop 18:31:16–32 → back 18:32:13 → last journal 18:33:00 → boot 18:32:09 (clock).
- PON (`/var/log/clubs8t-pon.log`): `0x8c5=0x02` **PS_HOLD**, same as resets #1–#9 in `ψ/data/clubs8t/REPORT-fw-vs-errors-20261022.md`.
- `ramoops: uncorrectable error in header` this boot; no new pstore.
- Telemetry (`/var/log/powerlog/power-20261026.log` + `/var/log/clubs8t-charger.log`): charger **SUSTAIN (charging)**, vsys 7.84–7.90 V flat, vbus 4.58–4.95 V, ibus peak 2.18 A, tbat 37→40 °C, GPU mostly 305 MHz (one 587 sample). **Power/bypass hypothesis disproven** → option A cancelled (told Bo).
- No gpu fault in journal this time (journal loses last seconds, so not ruled out). 10-22 had `adreno gpu fault 00800005` ~40 s before one PS_HOLD.
- orailnoor methods don't address this (told Bo).

## Pending
- [ ] Bo pick for 8T: **C** netconsole live kernel log → maclab (old logs `~/oneplus-8t-prep/logs/netconsole/`), then Bo plays RO; or **B** GPU max lock 305 (a guess, no evidence behind it). Not answered yet.
- [ ] Fold3 Winlator GG 114: existing patched ntdll is **aarch64 Hangover 11.16** (`~/oneplus-8t-prep/wine-ntload/`), unusable as-is; need x86_64 build matching Winlator 11.2's wine version (unchecked). Waiting on GO. Fold3 adb `192.168.1.156:42741` was gone at 18:4x (port changes on re-pair).
- [ ] Commit desired-state.yaml No.5 model line (sombo-oracle).
- [ ] Older items: see 16:25 handoff.
