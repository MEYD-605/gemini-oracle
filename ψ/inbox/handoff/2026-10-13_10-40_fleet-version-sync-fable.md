# Handoff: Fleet version sync — maclab + ClubSGame → Fable 5.1 / Hermes 0.21.7
**Date**: 2026-10-13 10:40 · Tag: [maclab:04-mimo] · Model: cc/claude-fable-5-1
Bo: "ลุยเลย… อันไหนทำเสร็จแล้วก็อย่าลืมบันทึก"

## Done (verified by command output)
- maclab No.4 default model → `cc/claude-fable-5-1` (config.yaml + tmux 04-mimo). `hermes config set` broken (ruamel missing) → python replace.
- maclab rtk 0.45 → 0.51.0 (brew)
- maclab bun 1.4.0 → 1.4.3 via official installer `~/.bun/bin/bun`; `/usr/local/bin/bun` now symlink there. **Pitfall**: `brew upgrade bun` tried to build cmake from source (no bottle, CLT 26.3 missing) and UNLINKED bun for ~10 min → killed brew, relinked. Running bun processes (No.1/Sombo discord bridges) were unaffected.
- maclab hermes-agent checkout 0e21933 (0.21.5) → `v0.21.7`; gateways gmgrok + no4 restarted via tmux helper `~/.hermes-no4/cache/scratch/kick.sh` (gateway self-restart guard blocks launchctl from inside). gmgrok verified 0.21.7 connected; no4 restart executed (session restored).
- Backups: `~/hermes-backups/hermes-{no4,gmgrok}-cfg-20261013-102*.tgz`
- ClubSGame WSL Claude Code 2.1.292 → 2.1.296 (`npm i -g` as root; onexplaye lacks perms for `claude update`)
- ClubSGame seats → Fable 5.1: start-no3.sh / start-gmlab.sh / start-gmaicore.sh (was gemini-3.8-flash) + start-gmatom.sh (was opus-5.5); `.bak-fable-20261013` kept. Pins `~/.claude/channels/discord-*/anthropic-model` all fable-5-1. gmlab + gmaicore live-switched (status bar "Fable 5.1"). gmatom has unsent draft "ลองแก้ WSL vsock ให้รัน agy ได้ก่อน" → not touched, picks up Fable on next restart. no3 runs via Windows Hermes profile (not tmux).
- ClubSGame Windows Hermes 0.21.5 → **0.21.7** (`C:\Users\noone\AppData\Local\hermes`). Local patches (discord role-mention trigger + voice_turn getattr fix) stashed/re-applied clean. Backup `backups\pre-v0217-20261013-1033\` (+ local-patches.diff). Gateway restarted via Hermes_Gateway task: ver=0.21.7 discord+golf connected, profiles default,golf,no3.

## Pending
- [ ] ClubSGame bun 1.4.2 / rtk 0.50 (now behind maclab) — minor
- [ ] ClubSGame Hermes → Home Assistant retrying since 10-01 (Discord unaffected)
- [ ] Windows Hermes local patches are uncommitted on detached HEAD v0.21.7 — consider a branch
- [ ] gmatom pending draft (Bo's?) still in prompt
- [ ] maclab CLT 26.3 missing → brew source builds fail; `brew upgrade` anything needing cmake will hang

## Update 10:50 — Bo reversed WSL model choice
- Bo: "เปลี่ยนโมเดล agent บน wsl เป็น Gemini 3.8 ด้วย" → ClubSGame WSL seats no3/gmlab/gmaicore/gmatom back to `ag/gemini-3.8-flash-high` (start scripts + pins). gmlab/gmaicore live-switched (status bar verified). gmatom (was opus-5.5 before today) now gemini on next restart — Bo's choice. Fable 5.1 stays on maclab only.
