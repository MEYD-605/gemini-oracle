# Handoff: RO on vivo X Fold3 — wine draws windows, Ragexe dies after SETUPAPI

**Date**: 2026-10-22 20:41 (GMT+7)
📡 Session: c97bdb38 | cartographer-oracle
**Prior handoff (full lane history)**: ψ/inbox/handoff/2026-10-22_19-30_ro-fold3-native-fex-paused.md

## What We Did (this session)
- FEX (stealth + openat2 fallback + generic SIGSYS→-ENOSYS handler) runs natively in Termux on Fold3 — no proot. Build tree /tmp/no5-fex/fex2610 (docker ubuntu:noble, build-scripts/build.sh), FEX sha 5a14855f.
- wine-ro-x86 (CrossOver 26.3 old-WoW64) patched in Orb /work/wine-x86: WINE_SERVER_TMPDIR (server/request.c, ntdll/unix/server.c) + accept4 (server/request.c, server/sock.c). Incremental rebuild ~4s; shipped 12MB tar (wineserver + both ntdll.so).
- Prefix ~/.wine-ro: dosdevices/z: → FEX rootfs (Android / unreadable → kernel32 c0000135). `cmd /c ver` 64+32-bit OK.
- Termux:X11 1.03.01 installed (Bo tapped) + termux x11 apt repo. x86 X clients must use TCP: `termux-x11 :0 -ac -listen tcp`, DISPLAY=127.0.0.1:0.
- ✅ Screenshots sent to Bo: x86 glxgears on Fold3 (20:35) and wine notepad 32-bit window (20:38). Key: Termux:X11 activity must be FOREGROUND (`am start -n com.termux.x11/.MainActivity`), else server stalls and winex11/explorer hang.
- Game copied to internal ~/.wine-ro/drive_c/Program Files (x86)/Gravity Game Tech/RagnarokOnline (sdcard → glibc buffer overflow). Overrides: winebus/wineusb/winebth=d; d3dx9_43=b. X11 Driver reg: UseXRandR/UseXVidMode/UseXIM/UseSystemCursors=N.

## Where it stands (run13, 20:38)
- Ragexe loads game dlls + ws2_32/opengl32/wined3d + SETUPAPI, handles GG VMware probe (c0000096), then exits; wineserver hit `device.c:832 device_manager_destroy: Assertion !irp->file && !irp->async` at teardown. No exe left running. NO RO window yet.

## Pending / Next Session
- [ ] Rerun RO (stage29.sh, X11 front) with WINEDEBUG=+seh,+process,+loaddll to see why Ragexe exits after SETUPAPI (GameGuard spawn? GameMon.des CreateProcess? compare 8T run-light.log: GG drops GGKernel64 then wined3d init)
- [ ] Check GameGuard/*.erl in internal game dir for GG error code
- [ ] Keyboard trap: Fold3 IME is Thai — first char of adb `input text` sometimes dropped; prefix extra char / verify with screenshot before Enter
- [ ] Bo rule: next BUILD needs Bo's order; report RO only with screenshot

## Key Files
- Scripts: ~/oneplus-8t-prep/fex-patch/fold3/stage17..53.sh (runner stage29.sh, X restart stage49.sh, notepad test stage53.sh)
- Patches: ~/oneplus-8t-prep/fex-patch/fold3/{fex2610-no5-stealth-openat2-sigsys.patch, wine-android-tmp-accept4.patch}
- Fold3 adb 192.168.1.158:40265; screencap /tmp/rockpi-fw/shot.sh <name>
