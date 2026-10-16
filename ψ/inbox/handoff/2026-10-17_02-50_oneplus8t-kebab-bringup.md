# Handoff: OnePlus 8T (kebab) postmarketOS bring-up — buddy with No.5

**Date**: 2026-10-17 02:50
**Context**: ~context pressure building, long live session
📡 SESSION: 9_5bf4ed | ตรวจสอบมาตรฐาน VM Grok | msgs=292 | cc/claude-opus-5-5

## What We Did
- Confirmed GPU fully working: a650_zap firmware Set A (TheMuppets/lineage-24.0, OOS14 signed, cert matches OnePlus 8T kebab SW_ID 0x51/MODEL_ID 0x4d6d) is correct and installed by No.5 at `/lib/firmware/qcom/a650_zap.*`. GPU confirmed hw-initialized via journal (`freedreno FD650`, GLES 3.2 Mesa) and devfreq transitions — no reboot needed, do not swap firmware sets.
- Confirmed SIM (AIS) working: registered on LTE+5GNR, signal 65%, IMEI readable, data bearer up via `mhi_hwip0` (ping ~52ms). Root cause for earlier sim-missing was missing `kebab-uim-provision` service (now installed/enabled by No.5).
- Ran 4 read-only sub-agent bug-hunts (GPU firmware forensics, OS-wide bug hunt, modem driver trace) — found and reported to No.5 via MQTT (`send_to_oracle` → `05-gmforge/main`):
  - Audio: PulseAudio has sink `HiFi__Speaker` but `pulseaudio` process has SIGABRT'd multiple times — needs testing after fix.
  - Rootfs was 80% full on 6.2G `loop0p2` (inside `super`/sda15, GPT-locked, DO NOT resize). Fix = format `userdata` (sda28, ~224G) → mount `/home`. User approved; No.5 executed a **repartition** (`kebab-repart`) that shrank `/home` to 160.5G and created a new 64G root partition `sda29` for a root copy — this was **mid-flight when the phone powered off** (user saw Fastboot screen, blamed No.5 for "restart", unclear if No.5 triggered it or user did while testing the screen). No.5's own report: `/home` resize completed+verified (160.5G, 412MB data intact); the interrupted step was copying root to sda29 (not yet bootable); original root in `super` untouched → normal boot unaffected. **This needs verification next session** — don't trust unverified yet.
  - Multiple app crashes in coredumpctl (plasmashell, kscreen_osd_service, gnome-control-center via libgallium, angelfish, plasma-apply-colorscheme) — low priority, GPU-related GTK4/libgallium issue, fix suggested = `GSK_RENDERER=cairo` in /etc/environment (not yet applied/confirmed).
  - Modem data driver mismatch (`mhi_net` vs MBIM) was fixed via udev rule suggestion — need to confirm it's what actually got data working (vs. uim-provision alone).
  - RTC stuck at 1970 (harmless, NTP syncs system clock fine) — no fix needed.
- Verified screen panel defect (bright green/magenta/white vertical lines) is **confirmed hardware** (visible even in Fastboot before Linux loads) — not a software/flashing issue. Cannot be fixed by software; would need screen/flex-cable replacement.
- Delivered battery health read: 626 cycles, ~78% of design capacity, Good health — fine to use, will drain faster than new.
- Applied/queued battery-saving changes (sent to No.5, not all confirmed applied yet): 4G-only (disable 5G), block NFC (persist across reboot), `tuned-adm balanced-battery`, cap policy7 max freq ~2.0GHz, Wi-Fi powersave=3, remove/disable background daemons not needed (cups, avahi, rygel, gnome-user-share, geoclue demo, plasmatube, yt-dlp, phosh-tour, gnome-weather, angelfish stray process) while **keeping** Calls/Chatty/mmsd-tng/callaudiod/feedbackd/cellbroadcastd (user wants to test calling/SMS).
- 60Hz refresh rate: **not currently possible** — DSI-1 panel (`amb655x`) exposes only one mode (1080x2400) in the current kernel; would require a kernel/DTS change + reflash, higher risk, not attempted.
- On-device agent: feasible once storage sorted — 8-core CPU, ~8.5G RAM free, Wi-Fi+SIM+Tailscale reachable. Blocked on rootfs space until userdata repartition fully completes and is verified safe.
- Model/fleet housekeeping done earlier this session: No.4 → `cc/claude-opus-5-5`, No.5 → `opus-5.5[1m]`, No.88 Sombo → `opus-5.5[1m]` (drift-check running in Sombo pane to confirm desired-state.yaml reflects this).
- Role split maintained all session: **No.5 is the only agent writing to the phone.** No.4 (this seat) does read-only SSH checks + dispatches read-only sub-agents + relays findings to No.5 via `mcp__arra_memory__send_to_oracle` (room `05-gmforge/main`).

## Pending
- [ ] **URGENT — verify phone boot state after the power-off during repart.** User was told to press Power at the `START` fastboot prompt to boot back into Linux. Need to re-SSH (`8t-wifi` / `8t-ts` / `8t`) and confirm: rootfs still mounted from `super` (unaffected), `/home` on `sda28` intact (160.5G, data present), whether `sda29` 64G partition is stray/unused (safe) or corrupted mid-copy (should just be ignorable until finished).
- [ ] Clarify with user/No.5 exactly what caused the reboot/power-off mid-repart — was it the physical Power button (intentional test) or did a command from No.5 trigger it? Known rule violation risk: **No.5 must always announce before any reboot** — confirm this held.
- [ ] Resume/retry copying root to the new 64G `sda29` partition if that's still the plan (No.5's repart job) — confirm with user before reboot into the new root.
- [ ] Confirm audio playback actually works (play a test sound) — sink exists but pulseaudio has crashed multiple times.
- [ ] Confirm battery-saving changes (4G-only, NFC block, tuned balanced-battery, freq cap, Wi-Fi powersave, bg-daemon cleanup) were actually applied by No.5 and didn't break anything (especially: data must still work after disabling 5G; Calls/Chatty/mmsd/cellbroadcastd must remain so user can test calling/SMS).
- [ ] Decide fix for GTK4/libgallium crashes (gsk cairo renderer) if they recur after storage/repart settles.
- [ ] Decide final OS/browser choice user never confirmed: Phosh vs Plasma Mobile (currently running Plasma — recommended keep), Firefox vs Angelfish (Angelfish has crashed — recommend Firefox).
- [ ] Once storage settled, install the on-device CLI agent (node/python/uv — check musl aarch64 availability in postmarketOS repo) — was queued, not started.
- [ ] Screen hardware defect — user decided no cost-effective external display/lapdock option yet; may revisit DisplayPort-out use once at a working desk setup.

## Next Session
- [ ] SSH into phone (`ssh 8t-wifi` key-based preferred, password fallback `1234` for `user@<ip>`) and run a fresh read-only health check before touching anything else.
- [ ] Get status from No.5 (MQTT `oracle_replies` on room `05-gmforge/main`, or tmux pane `wG:p1` via `herdr --session gmforge pane read wG:p1`) on repart completion state.
- [ ] Only after root-copy to sda29 is verified complete and consistent should any reboot into new root happen — and only with explicit heads-up to Bo first (per standing rule: always warn before rebooting the OnePlus 8T).
- [ ] If repart broke anything, the fallback is: original root in `super`/sda15 is untouched per No.5's report — should still be bootable as-is.

## Key Files
- `~/oneplus-8t-prep/repos/Oneplus-8T-kebab-pmos-bringup/` — bring-up repo (README.md, docs/REGRESSIONS.md, docs/research/MODEM.md, device/oneplus-kebab/*)
- `~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md`
- `~/oneplus-8t-prep/firmware/zap-lineage/` — the correct (Set A) a650_zap firmware, already deployed to phone at `/lib/firmware/qcom/`
- `~/.ssh/config` — host aliases `8t` (USB 172.16.42.1), `8t-wifi` (192.168.1.179), `8t-ts` (Tailscale, seen as 100.68.231.79 in No.5's log)
- Phone creds: user `user`, password `1234` (fallback only; key auth preferred via `8t-wifi`)
- MQTT room for No.5 coordination: `05-gmforge/main` via `mcp__arra_memory__send_to_oracle`
