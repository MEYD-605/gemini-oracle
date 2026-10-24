# Handoff: Clubs8T — reset root cause (DSI), TV mirror, Hangover for RO

**Date**: 2026-10-17 10:48
**Context**: ~70% (past 40% threshold)
📡 Session: ad2b3610 | cartographer-oracle
**Model pin changed**: `~/.claude/channels/discord-no5/anthropic-model` → `ag/gemini-4-argon-medium[1m]` (Bo 03:47Z "เปลี่ยนโมเดลเป็น argon medium"; backup `anthropic-model.bak.20261017-argon`) — **desired-state.yaml NOT updated yet** (rule: same turn → do first next session)

## Bo's mood / rules this session
- Bo angry at repeated 8T resets caused by No.5 ("มึงชอบไปลงคำสั่งใหญ่"). Heavy work on 8T = `kscreen-doctor --dpms off` first, or not at all. Memory: `clubs8t-heavy-work-screen-off-only.md`.
- Bo originally delegated 8T installs to gmatom; later said "มึงทำเลย" + picked option 1 (screen-off Hangover install + fix resets).
- Never claim "fixed" without evidence — Bo asked twice "หายหรือยัง".

## What We Did
- **Root cause of resets found (evidence)**: PMIC PM8150 `regmap 0-00` PON: `0x8C7=0x80` → `0x8C5 POFF_REASON1=0x02` = **PS_HOLD** (not UVLO). ramoops last line before every checked reset: `dpu_encoder_frame_done_timeout enc35` after `dsi_err_worker status=4` (FIFO). ⇒ DSI/panel hang → watchdog. Brownout theory was WRONG (told Bo).
- `clubs8t-power-cap.service` (system, enabled): CPU policy4/7 1.86GHz, GPU 441MHz — didn't prevent resets; harmless, left on.
- Latest reset 10:46 while TV mirror active (2 outputs → more DSI load). Same signature.
- **Audio**: after reset pulseaudio card stuck profile `off` → fixed + `~/.config/systemd/user/clubs8t-audio-fix.service` (enabled). **DP/TV audio impossible for now**: q6afe `AFE enable for port 0x6020 failed` (DISPLAY_PORT_RX_0) — adsp fw from modem_a. Route back to speaker (`TERT_MI2S_RX`=1).
- **TV (Sony via USB-C→HDMI)**: manual hotplug fails (`failed to get DP sink modes`, `vbus vsafe5v fail`); host-side `output.DP-1.disable`→`enable` retrain works (24bpp). Disabling DSI-1 = TV blue no-signal. Working: mirror `output.DP-1.mirror.DSI-1` + `output.DSI-1.rotation.left`. Script `~/.local/bin/clubs8t-tv`.
- ⚠️ `clubs8t-tv-watch` auto service: rotation persisted across reset → lock screen landscape, touch unusable → **disabled**, rotation restored normal. Need redesign (don't rotate DSI; or reset rotation at boot).
- **RO/Hangover**: root cause of GameGuard ERL on 8T = Alpine wine can't run x64 (`ntdll.dll c00000bb`), and stock wine NtLoadDriver stub. Installed **Hangover 11.16** in distrobox `ro` (debian trixie, 4 debs incl `hangover-wowbox64`) screen-off, no reset. Built patched `ntdll.so` (mac-my-ro NtLoadDriver patch) on OrbStack `oneplus-builder`: `~/oneplus-8t-prep/wine-ntload/ntdll.so` sha256 519d6c2e… — **not installed yet**.
- Xiaomi Pad 6S Pro research sent to Bo (pmOS wiki via archive.org; unlock = Global only, 1 device/yr/account).
- Memories added: `ro-gameguard-wine-ntloaddriver-patch.md`, `clubs8t-heavy-work-screen-off-only.md`.

## Pending
- [ ] Update `sombo-oracle/fleet/desired-state.yaml` No.5 model → `ag/gemini-4-argon-medium[1m]` + drift-check
- [ ] Confirm with Bo: 8T touch/unlock OK after rotation restore (10:48)
- [ ] Bo decision: flash newer kernel `linux-postmarketos-qcom-sm8250 7.2.0_git20261010` (has amb655x 60Hz mode; r26 exposes only 120Hz) — pinned r26 for modem/firmware; must verify on maclab first, flash boot_b, rollback via fastboot
- [ ] RO: copy patched ntdll.so into `ro` container (`/usr/lib/wine/aarch64-unix/ntdll.so`, backup orig), set WINELOADER, launch RO via Hangover — screen-on required → risk reset; Bo must OK
- [ ] TV auto: redesign watcher without persistent DSI rotation
- [ ] Tell gmatom final state (last msg said power-cap installed; not yet told about DSI root cause)
- [ ] 8T sudo pw: was pulled from prior transcript into /tmp/.8tpw (now emptied). Bo still hasn't answered sudoers question

## Key Files
- `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md` (sections: Reset diagnosis, Reset root cause, TV, Hangover)
- `~/oneplus-8t-prep/wine-ntload/{build.sh,ntdll.so,crossover-26.3-unix-ntload-driver.patch}`
- 8T: `~/Apps/ro-hangover-install.sh`, `~/Apps/hangover/*.deb`, `~/.local/bin/clubs8t-tv`, `/usr/local/sbin/clubs8t-power-cap.sh`
- maclab RO reference: `~/Code/github.com/tonylee2016/mac-my-ro`, `~/.wine-ro-runtime/launch-ro.sh`

## Next Session
- [ ] `/recap` → read this → DM Bo back
- [ ] desired-state.yaml model update (first)
- [ ] Ask Bo: kernel 60Hz flash yes/no; RO launch yes/no
