# Handoff: 8T r34 stable + fleet owner-DM hygiene

**Date**: 2026-10-19 20:23
**Context**: ~70% · 📡 SESSION: 20261019_180412_5371c1 | cc/claude-fable-5-1 → switching to glm-5.3 per Bo

## What We Did
- 8T: r33 (No.5 MP2762A driver) brownout ×3 → root cause `soc_bypass` CHG_EN=0 at ≥65% → rollback r32 → No.5 built r34 (bypass 0/0) → flashed r34 (boot_b sha 9935e288, #35)
- r34 reset once more (19:16): driver sets REG00 only; REG0F (IINLIM1) stuck 1.5A → `clubs8t-charger.service` keeper now pins 0x00+0x0f=0x3c and starts at sysinit (before game). 13-min soak: load 5.7, IBAT to -7A, no reset, no hang. Bo: "เกมเล่นโอเคละ"
- Wine: Thai fonts (Loma/Garuda/Noto Thai/Liberation copied into prefix, Tahoma→Loma substitutes), csmt=3, WINEDEBUG trimmed → text clean (screenshot verified), no CS hang
- `~/ro-x86/ro-kill.sh` — safe kill (old inline pattern killed own ssh)
- Camera: front IMX471 captures (58fps). Rear IMX586 identified but 0 frames; CSIPHY0 HW ver=0 → handed to No.5 (DTS/driver)
- Fleet DMs: GmAtom + GmBM/GmBoom/GmGuinness/GolfVm all intro-DM'd owners, verified via Discord API; purged 55 telemetry msgs; `quiet_chats.txt` support patched into sombo-discord-progress.py on clubs8t + grok-vm
- Arra memory cf924b86 (fleet DM lesson) written

## Pending
- [ ] No.5 r35: set MP2762_REG_IINLIM1 (0x0f) = 0x3c in driver init; then retire userspace keeper
- [ ] No.5 rear camera IMX586: csiphy0 power/clock (HW ver 0) + proper 586 mode table
- [ ] Lift 8T power cap MID → HIGH tier and re-soak
- [ ] FEX "FS selector in 64bit mode" (GameGuard) — latent SIGSEGV risk
- [ ] RO window decorations (close/min/max) Bo asked earlier
- [ ] GmBoom earlier DM (18:21/18:53) leaked backend names to พี่บูม — consider deleting those 2 msgs
- [ ] Z Flip 5 (SM-F731B THL, 2,700฿ S2 bootloader) purchase pending Bo

## Key Files
- 8T: /usr/local/sbin/clubs8t-charger.sh · /etc/systemd/system/clubs8t-charger.service · ~/ro-x86/{run-ro-light.sh,ro-kill.sh,fonts.reg,d3d.reg} · ~/.claude/hooks/sombo-discord-progress.py
- maclab: ~/oneplus-8t-prep/r34-stage/boot-r34.img · backup-boot-20261019/boot_b-r32.img
- grok-vm: ~/.claude/hooks/sombo-discord-progress.py · ~/.claude/channels/discord-*/progress/quiet_chats.txt
