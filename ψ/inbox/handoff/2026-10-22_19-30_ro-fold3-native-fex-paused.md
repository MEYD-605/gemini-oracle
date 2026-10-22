# Handoff — RO on vivo X Fold3, native FEX lane (PAUSED by Bo 12:17Z via Sombo)

## Result of final round (19:27 local)
Native FEX in Termux (no proot), patched FEX.stealth + openat2 fallback + SIGSYS→ENOSYS handler:
- `FEXInterpreter uname -m` → **x86_64** ✅
- `wine --version` → **wine-11.0** ✅
- `wine cmd /c ver` → ❌ `wineserver: mkdir /tmp/.wine-10359: Permission denied`
  (created ~/.wine-ro fine; rootfs /tmp 1777 didn't help → wineserver hits host /tmp, Android has no writable /tmp)

## Why SIGSYS happened
Android app seccomp RET_TRAPs: `openat2` and `set_robust_list` (strace 19:07, si_code=SYS_SECCOMP).
Fix 1: FileManagement.cpp openat2 probe → openat fallback (Sombo-noted 10:28 patch, never built before today).
Fix 2: SignalDelegator.cpp generic SIGSYS host handler: si_code==1 → x0=-ENOSYS, return (pc already past svc).

## Artifacts
- ~/oneplus-8t-prep/fex-patch/fold3/: FEX.stealth-oa2-sigsys (sha 5a14855f…), FEXServer (94e9c1eb…), patch, stage17/18/19/19b.sh
- Source tree: /tmp/no5-fex/fex2610 (docker ubuntu:noble, /tmp/no5-fex/build-scripts/build.sh; incremental ninja)
- Fold3 /sdcard/no5-ro-fold3/ (FEX.oa2 etc.), installed $HOME/fex/bin in Termux (patchelf → $PREFIX/glibc)

## Next (when Bo resumes)
1. wineserver tmp: FEX does not redirect host-side /tmp for wineserver → try TMPDIR inside wine env? wineserver uses hardcoded /tmp/.wine-$UID → patch wine server/request.c (or FEX path redirect for /tmp → $PREFIX/tmp).
2. Then wine cmd /c ver → winecfg prefix i386 (old-WoW64) → RO with GG, minimal WINEDEBUG.
3. Display: no X server yet (needs Termux:X11 or similar) — not started.

Bannerlator APK: only 64-bit libproot/loader — borrow-proot lane dead.
