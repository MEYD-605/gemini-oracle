# Handoff: Ragnarok Online old-WoW64 (stage2) Gate Test PASS (Login Screen + GGKernel64.sys) + FEX RootFS Staged

**Date**: 2026-10-19 01:44
**Context**: 38%
📡 Session: d2ed5ffe | cartographer-oracle

## What We Did
- **Ragnarok Online (`thRO GGT`) `old-WoW64` (`stage2`) Gate Test on `oneplus-builder` VM (`PASS`)**:
  - Tested `/work/wine-x86/stage2/opt/wine-ro-x86` (`old-WoW64` `i386` + `x86_64`, built from `crossover-sources-26.3.0` + `crossover-26.3-unix-ntload-driver.patch` + `wine-11.0-winhttp-number64.patch`) with `WINEPREFIX=/work/ro-test/prefix2` inside `sudo unshare -m --propagation private` (OrbStack VirtioFS unmounted, `dosdevices/z:` unlinked, `HOME=/home/admin`).
  - Installed missing 32-bit Mesa packages in VM (`mesa-vulkan-drivers:i386`, `libegl-mesa0:i386`, `libgbm1:i386`, `libwayland-client0:i386`, `libwayland-server0:i386`) and started `Xvfb :99 -screen 0 1920x1080x24 +iglx -ac` inside the isolated mount namespace.
  - Verified full GameGuard module chain loads cleanly with **zero `ggerror.des`**: `GameGuard.des` -> `npgmup.des.now` -> `ggexp.des` -> `GameMon.des` -> `ggscan.des` -> `GameMon64.des` -> `npggNT.des` -> `GGKernel64.sys` (`\Device\dump_wmimmc` / `\??\dump_wmimmc` in `winedevice.exe`) -> `npggNT64.des` -> `npsc.des`.
  - Automated `Setup.exe` OK click (`xdotool mousemove --window $W 272 442 click 1`) and captured live `1920x1080` Ragnarok Online Login Screen (`LogOn`: ID / Password / Connect) at `oneplus-builder:/work/ro-test/p2-login.png` and `MacLab:/tmp/p2-login.png`.
  - Cleanly stopped all Wine and Xvfb processes (`ALL_CLEAN`) per Master Bo's directive and delivered full report + DLL manifest to Team Lead `No.4` (`04-mimo`) via MQTT (`7c6acead94e844ce`) and to Master Bo on Discord (`1561449426474770446`).
- **FEX x86_64 RootFS Pre-Staged on MacLab for `Clubs8T`**:
  - Downloaded and verified both `Ubuntu_24_04.sqsh` (`501MB`, SHA256 `2854b06d3ff1b8f6e526135bfb6dd5b7b30ab3ab73e79ae933a3d9fed959a178`) and `Ubuntu_24_04.ero` (`844MB`, SHA256 `005ec6a45f014244feea7e5250a965b654d70c7ad048117288ba7f5532c33c02`) at `/Users/admin/oneplus-8t-prep/fex-rootfs/`.

## Pending
- [ ] Switch `No.5` (`05-gmforge`) model pin back to `ag/gemini-3.8-flash-high` per Master Bo's directive (`1561449652778442873`)
- [ ] Support `No.4` (`04-mimo`) with deploying `wine-ro-x86-oldwow.tar.gz` (`stage2`) + `Ubuntu_24_04.sqsh` under `FEX` on `Clubs8T`

## Next Session
- [ ] Verify `No.5` active model is `ag/gemini-3.8-flash-high` and `fleet-drift-check.py` passes
- [ ] Stand by to assist `No.4` (`04-mimo`) on `Clubs8T` Ragnarok `FEX` + `old-WoW64` run

## Key Files
- `oneplus-builder:/work/ro-test/run-stage2-full.sh`
- `oneplus-builder:/work/ro-test/p2-login.png` (`/tmp/p2-login.png`)
- `oneplus-builder:/work/wine-x86/wine-ro-x86-oldwow.tar.gz`
- `/Users/admin/oneplus-8t-prep/fex-rootfs/Ubuntu_24_04.sqsh`
