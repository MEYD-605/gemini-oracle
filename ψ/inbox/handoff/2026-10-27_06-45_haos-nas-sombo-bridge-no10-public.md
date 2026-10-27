# Handoff: HAOS update · NAS drive E · MM bridge fix · token leak · no10 public ψ

**Date**: 2026-10-27 ~06:45 (+07)
**Context**: 40% → auto-forward by ctx-autoforward hook
📡 Session df65ee4a | lord-knight-oracle

## Done this session (verified)
- Read Bo↔Sombo MM chat; auto-forward hook proven end-to-end; Sombo's 5% test file gone.
- Power cuts 10-24 11:09 / 10-25 08:29, 10:14: nothing broken. Fixed `~/.maw/maclab-boot-recovery.sh` empty-array + set -u (lines 119/142, bak `.bak.20261025-lightwave`). fleet-health-check stale FAIL re-run → PASS.
- **HAOS**: Core 2026.10.2→**2026.10.4** (full backup `fbd47998` pre-core-2026.10.4-20261025); repairs 0; core_samba boot=manual (never configured). desired-state commit `deb3578c`. HAOS = No.1's job (told Bo).
- **Notion token leak** (D-036 batch 10-14 committed `.claude/mcp.json`): token still LIVE (200 on 10-26 00:30). Untracked mcp.json: gmgrok 85f7505 · gmforge 3fc8b2f · cartographer c50a022 · mimo 14f7359 (No.4, PR #17 merged). gitleaks hook added to gmforge. decisions `a902f637`. gmgrok (132 held) + gmforge (2 held) frozen until Bo rotates.
- **Overheat**: full-history gitleaks/`git log -S` scans → killed; rule: nice + scoped `--log-opts`.
- **ClubSGame**: disabled dead task `ClubSGame-Arra-D1-Sync` (pointed at its own Off HAOS VM). Move to P'Mo's house is safe (all via Tailscale; Tailscale+sshd auto-start).
- **NAS drive E**: user `khunbo` created on ClubSGame (Bo's password; creds `~/.config/clubsgame-nas/creds` 600). MacLab mount = No.8's `com.maclab.clubsgame-nas-mount` → `~/NAS`; I rewrote `~/.local/bin/mount-clubsgame-nas.sh` to read creds (No.8 had embedded the **ClubSGame Windows account password** in a 755 script → recommend Bo change it).
- **MM bridge (Sombo) half-dead**: python child lost :1883 while WS stayed up (12:34–13:21 10-25), Bo's 6 msgs lost. Kickstarted + resent from Postgres. New watchdog `com.maclab.mm-bridge-mqtt-watch` (`~/.maw/mm-bridge-mqtt-watch.sh`, 120 s). Bug review of `mm_seat_bridge.py` sent to Bo; **fix waits until Sombo's Velaa job is done** (Bo's order).
- hermes-inbound: Sombo's `--continue mqtt-<seat>-<room>` (370625aa) reviewed OK.
- Merged own sweep PR lord-knight #86. SOUL: `~/bin/bo-files` clause (10d94bbb).
- Bo avatar: Gemini Flash Image failed likeness (Bo angry). Built real-photo cut-out (macOS Vision, `/tmp/no1-avatar/tool/{cutout,person}`) → 3 options sent (`/tmp/no1-avatar/real{1,2,3}.jpg`). Grok/xAI login expired (403) so No.6's method unavailable. Bo's selfies stored in vault `data/bo-face-ref/session-2026-10-26` (821399f; restored 2 refs image-gen rewrote, 17e253b).

## Pending
- [ ] **Bo decides**: no10-oracle public ψ/inbox (390 files, Bo's June DMs; no secrets found) → 1 make private (recommended) / 2 untrack / 3 leave. My 10-25 "nothing leaked" was WRONG (git quotepath). PR #7 closed.
- [ ] **Bo**: pick avatar 1/2/3 → set via MM API `POST /users/<khunbo id 67d1r8ui3ffipdkacpxx1udzmr>/image` (need admin token or Bo's session).
- [ ] **Bo**: rotate Notion token → swap into ~/.claude-no5/mcp.json etc → filter-repo gmgrok + gmforge → unfreeze.
- [ ] **Bo**: Sombo pane stuck on "switch to ag/gemini-3.8-flash-high? 1 Yes 2 No" — Bo's call, don't press.
- [ ] **Bo**: netbird keep/remove · confirm channel split (MM fleet / LINE OA customers / Discord+Telegram outsiders) → then write decision · change ClubSGame Windows password · Grok re-login if wanted.
- [ ] **Disk 91%** (92 GB free): uv cache 64 GB, 52 envs from Velaa photo scripts. After Velaa done: `uv cache prune` (it timed out on lock) or remove old env dirs not in use. If >95% act immediately. Also make HA disk alert fire on change only (repeats every 30–60 min).
- [ ] **HAOS NAS**: No.8's mount `nas_clubsgame` uses LAN 192.168.1.159 + Windows ClubSGame account + whole `NAS` share, usage=share. Told No.8: replace with `clubsgame_backup` (Share, backup, default) + `clubsgame_media` (Media) as khunbo via 100.87.51.122; test 1 backup. Not confirmed done.
- [ ] Soul portal: Sombo building in `sombo-oracle/scripts/soul-portal/` — 4 fixes sent (dedup, no hardcoded name/pillar — No.1=NEXUS, read-alias map, per-kind fetch, local add-on ingress). I install after review. No arra /api/merge (veto).
- [ ] MM bridge patch (on_disconnect/reconnect, check publish rc, guard on_out, exit on dead MQTT) — after Velaa; test on no1 first.
- [ ] No.4: find who runs `pkill -9 -P` in its MM session; daily-rotate mqtt session names; make git-sweep report on change only.
- [ ] maw-ssh-src: owner rebase, then allow-list rtc.ts:42 (TURN cred already public since 07-23).
- [ ] desired-state:235 still says D1-Sync task repointed — it's DISABLED now; fix the comment.

## Key files
- `~/.maw/mm-bridge-mqtt-watch.sh` · `~/.local/bin/mount-clubsgame-nas.sh` · `~/.config/clubsgame-nas/creds`
- `sombo-oracle/ψ/decisions.md` (a902f637) · `sombo-oracle/fleet/desired-state.yaml`
- `/tmp/no1-avatar/` (avatar work, 600) · `/tmp/no1-retired/` (old scripts, no10 scan)
