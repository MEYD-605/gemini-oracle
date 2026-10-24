# Handoff: RO on vivo X Fold3 → try a Winlator fork with FEX · ROCK Pi pmOS+k3s done then stopped by Bo

**Date**: 2026-10-22 15:43 (+07)
**Context**: 42% of 1M · session cost ~$62
📡 Session: e7bfd248 | sombo-oracle

## ⚡ FIRST THING
1. Research DONE (subagent, verified in source): **Bannerlator 3.1.6** (github.com/The412Banner/Bannerlator, 2026-10-11) is the only fork with FEXCore for WoW64.
   - Use `Bannerlator-3.1.6-standard.apk` (551 MB, applicationId `com.winlator.banner`; it coexists with com.winlator). `gh release download 3.1.6 -R The412Banner/Bannerlator -p '*standard.apk'`.
   - FEXCore is NOT bundled: Container editor → Performance → Translator downloads → Download FEXCore (wcp). Container: emulator FEXCore (WoW64 32-bit path, fields fexcoreVersion/fexcorePreset).
   - Ruled out (0 FEXCore hits in source): StevenMXZ/EmuProto Winlator-Ludashi, Stredohori Winlator-CMOD.
2. Install it on the Fold3 over adb, set the 32-bit emulator to FEX, point it at RO (copy `C:\Ragnarok` from Winlator 11.2 container, or adb push from maclab), launch, screenshot.
3. Report to Bo in DM (1495648925640687727). If it still says 114 → offer: deep trace (like No.5 on the 8T) or stop.

## Fold3 access (verified)
- adb wireless `192.168.1.158:40265` (maclab already paired; the PORT changes when Bo toggles wireless debugging → ask Bo for a screenshot of the Wireless debugging page).
- Screenshot inner display: `/tmp/rockpi-fw/shot.sh <name>` (= `screencap -d 4630946650788219011`, then sips to 1100 px; view the -s.png copy). Default screencap grabs the off cover screen.
- Winlator UI: shortcuts screen, RO ▶ at about (385,769) or (298,769) depending on layout (screenshot first). Bo uses the phone too; if Discord is in front, `am start -n com.winlator/.MainActivity` first. XServerDisplayActivity isn't exported (can't start a shortcut by intent).
- Winlator data: `adb shell run-as com.winlator ...` → `files/rootfs/...`, container `home/xuser-1`, RO at `home/xuser-1/.wine/drive_c/Ragnarok` (4.6 GB, 2026-09-14). The shortcut is `.../drive_c/users/xuser/Desktop/RO.desktop`, now `Exec=wine C:/Ragnarok/Ragexe.exe -1rag1` (backup home/xuser-1/RO.desktop.bak-20261022).

## Box64 result (do not repeat)
- Winlator 11.2 = Box64 v0.4.4 only. Error 114 with -1rag1.
- Box64 already SIGILLs on `0F 3F` (x64run0f.c:750), so it's not the 8T cause.
- Brand-string patch (Intel i7-6700K, env BOX64_CPU_BRAND) built: maclab `~/oneplus-8t-prep/box64-gg/` (patch `box64-0.4.4-gg-brand.patch`, build script, binary `box64/build-winlator/box64-winlator` sha 6fe82177…). Tested on the phone with the hash confirmed during the run: **still 114**.
- **Restored the original** box64 (sha 9c151739…). Patched copy is `usr/local/bin/box64.gg-brand-20261022`, original also at `box64.orig-0.4.4`.
- Extra changes left on the phone: config.box64rc has [GameMon.des]/[Ragexe.exe] log sections appended (no effect; Winlator overrides the trace file). Backup `files/config.box64rc.bak-20261022` → restore it when done. Duplicate partial RO copy moved to `/sdcard/Download/.trash-ro-dup-20261022` (Bo can delete).
- Notes: ψ/learn/ro-fold3/2026-10-22_ro-winlator-fold3-gg114.md (62b8abb1) → append the Box64 brand result + FEX outcome there.

## ROCK Pi (DONE then STOPPED by Bo 14:51)
- pmOS on eMMC, k3s server works + survives reboot, WiFi OK, Tailscale 100.107.23.5 (rockpi-edge-1). Needs 5V/3A wall power (power bank = boot loop). Idle. No.5 removed k3s from the 8T and reverted its tailscale mode. Notes: ψ/learn/rockpi-cluster/ (commits 80cf5413 → 8d112c79).
- Bo optional: delete old Tailscale node rockpi-edge 100.80.0.4.

## Also this session
- Committed No.5's desired-state adsp_firmware F.67 (42a324c5).
- Unreported from boot: progress-log check (no files under progress/), drift-check ❌8 (No.1/4/6 model mismatch, No.6/8 focus stale, 3 sweep backlogs).

## Pending
- [ ] RO Fold3: Winlator+FEX fork test (Bo GO)
- [ ] Restore Fold3 config.box64rc from backup after testing
- [ ] Kali container on 8T: waiting on Bo's GO
- [ ] Bo: public gemini-oracle branch 042d1925
- [ ] 10-29: ADR-016 tally + lesson-loop report

## Retro
ψ/memory/retrospectives/2026-10/22/15.42_rockpi-pmos-k3s-and-ro-fold3-winlator.md (+3 Arra learnings)
