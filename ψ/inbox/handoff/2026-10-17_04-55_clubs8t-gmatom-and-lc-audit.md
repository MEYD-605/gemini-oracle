# Handoff: Clubs8T phone + GmAtom move · LC audit · maclab disk

**Date**: 2026-10-17 04:55
**Context**: 41% (opus-5.5[1m])
📡 Session: 879febdb | sombo-oracle

## What We Did
- **gemini-3.7 404 caller** = No.00 gmgrok Hermes aux slots (~25) in `~/.hermes-gmgrok/config.yaml`; stopped since 07:00. Asked Bo A (→3.8) / B (leave) — **no answer yet**.
- **LightCraft audit** (Bo "lc มีบัคไหม"): cargo check ok; pipeline 186/187 — `all_masks_overlay` is an upstream bug (fails on clean HEAD, fixed upstream `5e9a1b6e`); gpu marker tests flaky only in parallel; installed CLI sha = target build. Repo: 20 uncommitted patch files (tone.rs +905) + 2 `UU` (no markers), 702 commits behind upstream. Asked Bo A (commit to branch) / B (merge upstream) — no answer.
- **No.6 "new system"** = `oracle-substrate` seat_state.py (8 commits 10-15). Not enabled in meyd; shadow dry-run only; not the 03:50 cause. Risks: :607 send-keys into ❯, :595 silent fallback.
- **Heat**: told Bo avg 57 / max 69 °C — that was powermetrics die temp at 100 ms (spiky); Bo sees ~44 (osx-cpu-temp). Corrected. `~/.claude/runcat-machine.sh:30` could sample longer — waiting on Bo.
- **maclab disk**: 140 → 170 GiB free. cargo clean on 6 Rust projects (lightcraft 18.5G…), npm cache, brew cleanup. Skipped `discord-reply-rust` + `bangkoklife` (live services run from target/release) and `.cache/uv` 11G (lock held by discord-slash-menu + chroma-mcp). 🟡 list (HAOS bak 29G, duplicate NAS_Photo_Hub 29G, Desktop/test 11G…) untouched, awaiting Bo per item.
- **OnePlus 8T → Clubs8T** (Nura/pmOS): hardware sheet `ψ/hardware/oneplus-8t-kebab.md` (commits e61e433, 1937a78, 448adef, 0147ee0, cedea48). No.5 did repartition: `/` = sda29 62G, `/home` = sda28 157G (verified 03:26). Resets = broken DSI panel + any sustained load (No.5: one heavy job at a time). Battery 626 cycles / ~78%. Charger disabled in DT → no charge-limit menu.
- **GmAtom moved to Clubs8T only** (Bo "ให้มันอยู่ที่เดียวบนมือถือ"): claude 2.1.301 musl + bun 1.4.3 in user space, repo from WSL `/mnt/e/Agents/gmatom-oracle` → `~/gmatom`, `gmatom.service` (user, greetd autologin, waits clock+net). Discord bot GmAtom#6838 answered Bo 3× from clubs8t. **grok-vm**: meyd.yaml gmatom `enabled:false` + launcher -x + token parked (meyd has no reload → empty tmux loop until next meyd restart). **WSL**: stopped, token parked, launcher -x.
- **No.5 model**: live = Opus 5.5 (not stuck, one 47s upstream drop). Someone edited `fleet/desired-state.yaml` No.5 → `gcli/grok-4.7` (uncommitted, not me) — asked Bo which; no answer.

## Pending
- [ ] Bo: gmgrok aux 3.7 → 3.8 (A/B)
- [ ] Bo: LC — commit patch to `sombo/local-patches` (A) / merge upstream 702 (B)
- [ ] Bo: No.5 model Opus 5.5 vs Grok 4.7 (desired-state dirty)
- [ ] Bo: maclab 🟡 disk items one by one; uv cache needs No.1 to stop 2 uv procs
- [ ] Bo/No.1: GmAtom → HAOS `:8099` needs phone IP 100.68.231.79 added to `SOVEREIGN_CORE_IPS` in `~/.local/bin/haos-arra-forward.py` (security wall; currently on isolated `:8102`)
- [ ] sudo on phone (No.5 has pw, only if Bo OKs): `sudo mkdir -p /etc/claude-code && sudo cp ~clubslinux8t/managed-settings.json /etc/claude-code/` → then set `oracle-channel@oracle-registry: true` in `~/.claude-gmatom/settings.json` + re-add `--channels plugin:oracle-channel@oracle-registry` to `~/gmatom/start-gmatom.sh`
- [ ] Phone: install `ripgrep jq tmux` (sudo)
- [ ] Carried: MEYD launchd + drift check · reboot plan · O+Connect · 03:50 tmux die-off (parked) · photo backlog

## Next Session
- [ ] Verify GmAtom on Clubs8T still alive after any reset (`ssh 8t-wifi 'systemctl --user is-active gmatom; tail /tmp/discord-mcp.err'`)
- [ ] Chase Bo's open A/B answers above; do them with No.1 where 2-of-3 applies
- [ ] grok-vm: when meyd restarts, confirm empty `gmatom` tmux is gone

## Key Files
- ψ/hardware/oneplus-8t-kebab.md (full phone + GmAtom sheet, rollback steps)
- ~/oneplus-8t-prep/runbook/INSTALL-RUNBOOK.md (No.5's phone runbook)
- ssh aliases: `8t-ts` / `8t-wifi` / `8t` (user clubslinux8t) · `grok-vm` (box) · `ClubSGame` → `wsl -d Ubuntu-26.04 -u root -- bash /mnt/c/Users/ClubSGame/<script>` (pipes break Windows quoting — use a script file)
- ~/.local/bin/haos-arra-forward.py (sovereign IP allowlist)
- memory: oneplus-8t-linux-phone.md
