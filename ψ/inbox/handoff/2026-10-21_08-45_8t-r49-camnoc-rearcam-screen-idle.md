# Handoff: Clubs8T — rear cam IMX586 FIXED on r49 (camnoc_axi), screen idle fixed, modem needs cold boot

**Date**: 2026-10-21 08:46
📡 Session: c97bdb38 | cartographer-oracle | model Opus 5.5

## Device state NOW (Clubs8T, ssh 8t-wifi)
- Kernel **r49 (#50)** on boot_b (boot.img/boot_b sha e49c2a7e, vmlinuz 657e3293). apk pkgrel 49. **No debug code.**
- Rear IMX586 4000x3000 **30 fps** ✅ · front IMX471 57.8 fps ✅ · screen On, dsi_err 0.
- ⚠️ **Modem: registration fails after warm reboot** (`qrtr3 timed out`, Network timeout, state enabled). Needs COLD BOOT: `sudo poweroff` → Bo unplugs Type-C 5 s → power on. Asked Bo 08:30, no answer yet.
- Rollbacks: `/root/r48-rollback/boot_b-r46.img` (r42e debug, rear works), `/root/r42-rollback/boot_b-r41.img` (r41).
- Charger bypass = Sombo's (don't touch).

## What We Did
- r42..r42e debug kernels (CSID RX/RDI + VFE bus dumps). Found DT 0x12 embedded unmapped — RED HERRING (front has it too). CSID clean (15,000,000 B/frame).
- r42e forced IFE 680 + camnoc 400 → frames. r48 "IFE fix" → no frames; clk trace showed csid_set_clock_rates (camss-csid.c:596) resets vfe0 clk to freq[0]=350. **Real root cause: camss never sets `camnoc_axi_src` rate → stuck 19.2 MHz.**
- **r49 = `0033-media-qcom-camss-vfe-set-camnoc-axi-rate.patch`**: in vfe_set_clock_rates set camnoc_axi_src to table max (400 MHz). Proven single-variable (IFE stays 350).
- "Dark image" = camera face-down. CCI live read: exposure/gain latch fine (no group hold needed). First real image 08:13 (sideways, washed colors).
- **Screen idle (Bo ask):** never configured for AC (WhenIdle=false since before 10-20). Set Plasma Mobile defaults: AC dim 300/off 600, Bat 60/120, Low 30/60, no lock, PBA=128. Needed powerdevil restart (refreshStatus doesn't reload). Verified 07:43 dim, 07:48 off, 0 key presses. Backup `~/bak-no5-screen-1021-0724/` (+ maclab copy).
- My wrong claims retracted to Bo: DT0x12 cause, "powerdevil race / DPMS not loaded", "IFE clock" cause. Memories: clubs8t-powerdevil-reload-and-dbus; arra memories b835926e (IFE — now superseded), 861f7c25 (first image).

## Pending
- [ ] Cold boot for modem (Bo's hands).
- [ ] Revise arra memory b835926e (says IFE clock cause — wrong; real = camnoc_axi).
- [ ] Verify DTS `rotation = <90>` is in the built r49 dtb (stage DTS has it) — image still showed sideways in cam (libcamera may not apply).
- [ ] libcamera: imx586 camera sensor helper + tuning (softISP "Failed to create camera sensor helper for imx586").
- [ ] Consider upstreaming camnoc fix (Bryan O'Donoghue / linux-media).
- [ ] Venus (Sombo's dtsi proposal) — separate round after camera.
- [ ] ModemManager segfault ×2 at boot (10-20 23:13) — watch.

## Key Files
- `~/oneplus-8t-prep/r42-debug/0033-media-qcom-camss-vfe-set-camnoc-axi-rate.patch` (production), debug patch `0033-DEBUG-*.patch`, apks in `out/`.
- `~/oneplus-8t-prep/cphy-apply-test/a` (git stash "r42-debug-a-e" holds debug).
- VM oneplus-builder: pmaports `device/testing/linux-postmarketos-qcom-sm8250` pkgrel=49; old patches in `~/bak-r46/`.
- Running log: `ψ/inbox/handoff/2026-10-20_11-43_8t-r36-live-goal-sensors-rearcam.md`.

## Next Session: Pick Your Path
| Option | Command | What It Does |
|---|---|---|
| **Continue** | `/recap` | Cold boot modem with Bo, then libcamera imx586 helper/tuning |
| **Clean up first** | revise arra b835926e, commit patches to repo | then `/recap` |
| **Fresh start** | `/recap --quick` | minimal |
