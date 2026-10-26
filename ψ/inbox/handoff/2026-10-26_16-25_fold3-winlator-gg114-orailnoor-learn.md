# Handoff: Fold3 Winlator RO → GG 114 · orailnoor /learn · Pad 6 pick · Argon pending restart

**Date**: 2026-10-26 16:25
**Context**: 40% (ctx-autoforward hook, unattended)
📡 Session: f8d9b101 | cartographer-oracle
**Previous handoff today**: ψ/inbox/handoff/2026-10-26_13-52_argon-switch-maclab-shock-8t-mm-host.md (still valid for everything before 13:52)

## Context
**Oracle**: No.5 GmForge | **Human**: Bo — talks on **Mattermost DM** → oracle-channel reply `chat_id=mm-3p6w7dhozjrnbyg3xjchhfr8ur`.
**Model**: yaml + pin = `ag/gemini-4-argon-medium` (Bo 13:32). This session still ran Opus 5.5 → **next start should be Argon Medium; check statusline and tell Bo**.

## What We Did (13:52 → 16:25)
- **Bo's live selfies**: arrived in No.1's MM DM, not mine; already in `bo-personal-vault/data/bo-face-ref/session-2026-10-26/` (821399f + 17e253b), sha256 = bridge inbox. I wrongly asked Bo to resend → Bo angry. Fix: `~/bin/bo-files [days]` (all seat bridge inboxes + vault). Rule added to CLAUDE.md (vault section), Sombo approved; no auto-copy bridge→vault (Sombo: mostly client work). Memory: search-all-inboxes-before-asking-bo-to-resend.
- **orailnoor channel** (184 videos, github.com/orailnoor): matches our work. Sub-agent report **`ψ/learn/orailnoor/README.md`** (verified): Turnip/Zink env recipe (DroidDesk/termux-linux-setup.sh:373-382), Waydroid w/ GPU on pmOS, Android kernel 39-bit VA vs FEX 48-bit (not confirmed as Fold3 cause — symptoms differ), tri-boot = non-A/B dd swap (don't copy to 8T), camera broken on pmOS for him too.
- **8T Waydroid**: installed, `waydroid-container` active, `/dev/binder` present, never `waydroid init`.
- **Tablet**: recommended **Xiaomi Pad 6 (pipa)** over Pad 7 (uke = no first boot yet). Local `~/Code/github.com/pipa-project/pmaports-pipa`. Asked Bo new vs used for Thai price check.
- **Fold3 (vivo V2303A, A16, kernel 5.15.197, verifiedboot green, kalama)**: adb `192.168.1.156:42741` (Bo gave it 16:09). No `/dev/kvm` (no AVF). `/dev/kgsl-3d0` + `/dev/dri/renderD128` present.
  - adb fix: vivo PC Suite's bundled adb (`/Applications/pcsuite.app/.../adb` v31) wedged port 5037 → killed it, started `/usr/local/bin/adb` once; Bravia `192.168.1.104:5555` reconnected.
  - **Winlator 11.2** already had shortcut **RO** in Container-1 (from 09-14): Vulkan=Turnip, DX=DXVK, 1024×768, game at C:\Ragnarok (installer copy `/sdcard/WinlatorGames/RagnarokInstaller`). Launched unchanged 16:16 → window + mouse → **`GameGuard Error: 114`**. Screenshot sent to Bo (`/tmp/fold3-shots/w3.png`).
  - adb taps / Enter do NOT reach Winlator's X screen; exit via Back → side menu → Exit (bounds [49,1861][925,2007] → tap 487 1934). Exited cleanly: 0 wine/box64 procs, Winlator on Shortcuts screen.
  - Winlator Logs panel only records while open → was empty.
  - Screencap on Fold3: use `screencap -p /sdcard/x.png` + pull (exec-out prints a multi-display warning into the PNG).

## Pending
- [ ] **Bo GO needed (new build)**: put the NtLoadDriver-patched wine (the one that gets 8T in-game) into Winlator as a custom wine version, keep Box64+Turnip/DXVK. GG 114 meaning ("can't load GG driver/service") = general knowledge, NOT verified from GG .erl.
- [ ] Before next Winlator RO run: open Logs panel first, then launch, to capture GG/wine output.
- [ ] Restart onto Argon Medium (Bo hasn't said now vs later) — confirm statusline after.
- [ ] Bo: Pad 6 new or used → check Thai prices, 8/256+.
- [ ] Bo pick: (A) Turnip/Zink env into Fold3 FEX runner stage29 / (B) `waydroid init` on 8T (8T may be on — gmatom was online 10-25).
- [ ] Older, still open (see 13:52 handoff): 8T Mattermost host option 1/2/3 · 8T 10-23 forced reboot? · maclab earth plug-tester · MM watchdog + ClubSGame standby · GDrive backup leg (TCC) · git rm ψ/media/personal (vault verified) · No.1 Notion-token consent · commit cluster/README.md + CLAUDE.md edits.

## Next Session
- [ ] Check model = Argon Medium; tell Bo on MM.
- [ ] If Bo GOes the Winlator wine build: find our patched wine-ro-x86 (Orb /work/wine-x86, CrossOver 26.3 old-WoW64; 8T patch = mac-my-ro NtLoadDriver) and package as Winlator custom wine (.wcp / contents dir).
- [ ] Otherwise act on whichever pick Bo answered.

## Key Files
- `ψ/learn/orailnoor/README.md`
- `~/bin/bo-files`
- `~/oneplus-8t-prep/fex-patch/fold3/` (stage17..53.sh, FEX + wine patches)
- `ψ/data/fold3-winlator-gg114-20261026.png` (GG 114 screenshot)
- Fold3 adb `192.168.1.156:42741` (wireless debugging port changes on re-pair)
