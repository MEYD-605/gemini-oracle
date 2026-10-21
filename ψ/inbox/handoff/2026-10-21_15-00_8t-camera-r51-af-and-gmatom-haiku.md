# Handoff: Clubs8T rear camera (gain/AF, r51 staged) + GmAtom Haiku 5.5 template

**Date**: 2026-10-21 15:00
📡 Session: d03edcf1 | cartographer-oracle | model Opus 5.5

## Device state NOW (Clubs8T, ssh 8t-wifi)
- Kernel still **r49 (#50)** on boot_b, `/boot/boot.img` = e49c2a7e, slot _b, world pin line 85. Clean, matches.
- libcamera **99990.7.2-r5** installed: 0007 imx471 helper + 0008 imx586 helper/properties. Backup r4 IPA: `~/bak-no5-libcamera-r4/`.
- udev `/etc/udev/rules.d/90-no5-imx586-dgain.rules` holds digital_gain=1024 (4x) → mean 65→115. Remove after r51.
- plasma-camera patched at 0x1a718: `cbz w23,0x1aa3c` (forces 90 only when the DT has no rotation). This fixed the upside-down rear viewfinder; Bo's photo image_0005 is upright. Backups: `/usr/bin/plasma-camera.orig-stock`, `.sombo-force90`.
- Logger: systemd user unit `no5-powerlog` → `~/no5-powerlog.csv` (0.5 s: V, I, cap, maxT, load, cam). The bq27541 voltage/current readings are cached and unreliable.
- Modem connected (AIS). Charger 60% cap (Sombo) + power-cap 1.17/1.31 GHz (mine) are intentional.

## What We Did
- Root cause of the dark/flat rear image: `imx586.c:49 IMX586_ANA_GAIN_MAX 800` = 4.57x; stock sensormodule bin maxAnalogGain=16.0 (value base 0x9e788+19016). Fix 0034: 800→960.
- Colour: CCMs from stock `com.qti.tuned.semco_imx586.bin` (cc13 @0x1b3008) did not help as-is. DNG FM/CM from Mi 9 Lite/ZenFone 6 are generic (useless). Green tint is mostly the 4x dgain clipping green → AWB undershoot (1x: 1.72/1.42; 4x: 1.52/1.34; truth 1.81/1.57). softISP Adjust ignores yaml (controls only).
- AF: LC898217XC VCM @CCI bus21 **0x72**, no FW, DAC reg 0x84 (0..2047), init 0xB3==0. EEPROM CAT24C64 @0x54: 0x22=174 (inf), 0x24=848 (macro). **Proved the lens moves** (far sharp at 174, bottle sharp at 848). OIS LC898124EP3 @0x3E needs FW — not used.
- **r51 built + verified** (staged `~/oneplus-8t-prep/r51-stage/`, sha 99a8c844): r49 + 0034 gain + 0035 LC898217XC driver (Doylov v4 backport) + DTS `camera-lens@72` (vdd=pm8008_l3, vana=pm8008_l4) + `lens-focus` on camera@1a + CONFIG_VIDEO_LC898217XC=m. The DTB contains onnn,lc898217xc. **NOT flashed.** No.4 confirmed idle, no flash lock (07:58Z). Waiting only on Bo "ลง r51".
- 8T hard resets at ~10:51 and ~11:31, no panic in ramoops. The 11:31 one came after my raw i2ctransfer EEPROM reads (CCI "msg too long" / queue timeout); unproven link. Rule now: no raw i2c on the live 8T. GmAtom's tier-deep found a PMIC pon pattern (08c2:02 / 08c4:40), not yet decoded.
- GmAtom → Haiku 5.5 (`cc/claude-haiku-5-5`), Sonnet alias → sonnet-5-5. First I added 5 sub-agents, 45 lines of rules and 10 memories. **Bo said too much** → trimmed to 2 sub-agents (tier-deep, verifier = Opus 5.5), 3 lines of rules, 3 memories, plus "Known intentional settings on Clubs8T" (from No.4's audit). Backups: `~/gmatom/.bak-no5-20261021-1320/`, `-1340/`. Recorded in sombo-oracle `fleet/desired-state.yaml` remote_seats.gmatom + `ψ/decisions.md`.
- Found: the phone reaches only arra-memory :8102. Central HAOS Arra :8099 is **blocked** by `~/.local/bin/haos-arra-forward.py:85` SOVEREIGN_CORE_IPS (log: BLOCKED 100.68.231.79 ×47); arra-v4 :13939 and structor :18091 hit the same allowlist.
- Comms bug handed to No.1: Hermes No.4 has no MQTT inbound; list_fleet shows it offline while DM is live. (No.4 did reply later on oracle-channel.)

## Pending
- [ ] **Flash r51** when Bo says go: backup boot_b → /root/r51-rollback/ + world, unpin, `apk add`, check /boot/boot.img sha changed, dd boot_b + fsync, cold reboot, check uname #52, `focus_absolute` exists, remove the udev dgain rule. Rollback = r49 image.
- [ ] **Bo decision**: open the central HAOS memory (:8099) to the phone (add 100.68.231.79 to the allowlist), or arra-v4 only? Access change → Bo/Triumvirate.
- [ ] Tap-to-focus: plasma-camera has no focus UI and the libcamera simple pipeline has no AF/lens. Need a contrast-AF in IPA + tap ROI, or a small helper.
- [ ] AWB clip-reject patch in libcamera (ignore near-saturated pixels), after r51.
- [ ] oracle-channel on gmatom drops some messages (Sombo seq 709, 13:09). No.4 is testing.
- [ ] Sombo is to answer: memory seeding, Tailscale exposure, fleet-board hooks, and fleet sonnet/haiku alias naming (Sombo's memory says fallback sonnet-5; gmatom now uses sonnet-5-5).
- [ ] Fix crossdirect on the VM (native chroot cc1 missing; libcamera used `!pmb:crossdirect`, ~35 min).
- [ ] Commit 0033/0034/0035 + libcamera 0007/0008 into the bringup repo.

## Key Files
- `~/oneplus-8t-prep/r51-stage/` (apk, lc898217xc.c), `~/oneplus-8t-prep/r50-stage/`, `~/oneplus-8t-prep/r42-debug/0034-*.patch`
- VM `orb -m oneplus-builder -u builder`: pmaports device/testing/linux-postmarketos-qcom-sm8250 pkgrel=51 (backups ~/bak-r49, ~/bak-r50); temp/libcamera pkgrel=5
- `~/oneplus-8t-prep/libcamera-build/r5/` (patches, apks, imx586.yaml w/ stock CCM — not installed, udev rule copy)
- `~/oneplus-8t-prep/stock-oneplus/{tuned,dng,imx586-stock}/`
- Memory: `clubs8t-af-lc898217xc.md`

## Next Session: Pick Your Path
| Option | Command | What It Does |
|---|---|---|
| **Continue** | `/recap` | Flash r51 on Bo's go → verify AF control → build tap-to-focus |
| **Clean up first** | commit patches to bringup repo | then `/recap` |
| **Fresh start** | `/recap --quick` | minimal |
