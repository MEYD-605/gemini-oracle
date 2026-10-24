# Handoff: D-036 Fleet Skill & 7-Tube Routing (196/196) + Grok VM Anti-Freeze Fix + No.3 LightCraft Root Causes

**Date**: 2026-10-14 09:02 +07
**Context**: 50% of 1M (`ag/gemini-4-argon-high`)
📡 Session: 2b64d583 | sombo-oracle

## What We Did (Verified)
- **D-036 Fleet-Wide Skill & 7-Tube MCP Routing Standardization (Sombo + No.1 Buddy Audit, Commits `46e3ed4`, `c520418`, `13a0820`, `1548bd4`, `19c98c0c`, `efe54c8`)**:
  1. **Fixed AGY (`06-gemini`, `08-agy-nano2`) Missing Oracle Skills**: Discovered `agy` binary reads `~/.gemini/antigravity-cli/skills/` (had only `office-suite-notes`) and `~/.gemini/config/skills/` (had only 32 BigQuery defaults), while 72 older `v26.5.16` skills sat unused in `~/.gemini/skills/`. Symlinked all 58 canonical `v26.8.23-alpha.2112` entries from `~/.claude/skills` into both directories and wired `/Users/admin/.claude/hooks/cbm-session-reminder` to AGY `SessionStart`.
  2. **Archived Shadowing `v3.6.1` Skills on `No.2`**: Moved `high-wizard-oracle/.claude/skills` (21 files from April 2026 `v3.6.1`) → `high-wizard-oracle/ψ/archive/dot-claude-skills-v3.6.1-20261014` so `~/.claude-no2/skills` (`v26.8.23-alpha.2112`) is unshadowed.
  3. **Hermes (`00-gmgrok`, `04-mimo`) Skill De-Duplication**: Removed redundant `HERMES_HOME/skills` self-reference from `skills.external_dirs` in `config.yaml`; archived 2 duplicate skills in `No.00` (`209` active) and **106 superseded `-v1..-v14` / duplicate skills in `No.4`** (`413 → 308` active, shrinking system prompt by `10.2 KB` per call) into `.archive/dedup-20261014/`.
  4. **Embedded `🧭 7 Vital Tubes & Skill Routing Matrix` Across All Seats**: Updated `~/.claude/hooks/cbm-session-reminder` and instruction files across all 8 MacLab seats (`sombo-oracle/CLAUDE.md`, `lord-knight-oracle/CLAUDE.md`, `high-wizard-oracle/CLAUDE.md`, `cartographer-oracle/CLAUDE.md`, `gmforge-oracle/CLAUDE.md`, `gemini-oracle/GEMINI.md`, `agy-nano2-oracle/GEMINI.md`, `gmgrok-oracle/SOUL.md`, `mimo-oracle/SOUL.md`) + ClubSGame (`E:\Agents\no10-oracle\GEMINI.md`, `joker` & `golf` `SOUL.md` via No.1). Standardized inter-seat messaging on `mcp__arra-memory__send_to_oracle` (`oracle-channel` MQTT) instead of `maw hey`.
  5. **ClubSGame Pending Work Completed by No.1**: Centralized MQTT credentials into `C:\Users\ClubSGame\.config\fleet-mqtt\client.conf` across 5 scripts in `C:\Users\ClubSGame\bin\`, wired `arra-v4` (`:13939`) + `structor` (`:18091`) to `10-no10`, and verified D-025 models.
  6. **Enforced in `scripts/fleet-drift-check.py`**: Added 16 new checks → **`196 checks · ❌ 0 · ❓ 0`**.
- **No.3 LightCraft Rust Engine Root-Cause Analysis (`Arra fb7f7226`)**:
  - Received and archived `No.3`'s 4 root causes for `storytold/lightcraft`:
    1. Silent Rejection Gate (`crates/engine/src/camera_preview.rs:665-742`): `MAX_HOLDOUT_RMS = 0.10` against embedded Sony JPEG causes custom Adobe Standard matrices in `<model>.json` to return `None` at line 741 and silently fall back to `profile = false`.
    2. `fit_chroma` Bleaching Bug (`crates/engine/src/camera_preview.rs:1164`): Silver foil background on `DSC07864.ARW` suppresses chroma at luminance `0.50–0.85` by 25–30%, bleaching skin tones.
    3. Missing `ILCE-7C` Alias (`crates/raw/src/spectral_table.rs:315-339`): PR #560 omits `("Sony", "ILCE-7C", "ILCE-7M3")` in `ALIASES`.
    4. Luminance-only Tone Map (`crates/pipeline/src/finish.rs:524-526`): Open `PR #514` fixes this with Per-Channel RGB Tone Curve (`BASE_SLOPE = 1.56`, `BASE_WHITE_EV = 1.30`).
- **Grok VM Anti-Freeze Fix (`Commit bff9860`, Verified 35+ Min Zero Freezes)**:
  - **Root Causes Found**:
    1. In `scripts/maclab-grok-lifeline.py`, `resp.readline()` on `/local-exec/requests` blocked for 35s until timeout, so the `POST /local-exec/responses` ping below it never ran; when Anyrun's edge proxy (`*.us13.cursorvm.com`) saw no bidirectional traffic for `resume_upper_s=300` (5 min), it hibernated the Pod (`47s` / `1m32s` freezes at `07:28`, `07:34`, `07:41`, `08:06`, `08:24:59`).
    2. Background `/Applications/Grok Bot.app` on MacLab sent `setWindowFocused({isFocused: false})` when unfocused.
    3. `/home/box/keepalive/boot.sh` on Grok VM lacked `flock` and `agent-sentinel-watch.py` triggered `boot.sh` on 1s blips, stacking 12 `boot.sh` processes.
  - **Fixes Applied**:
    1. Rewrote `scripts/maclab-grok-lifeline.py`: separated `/events` and `/local-exec/requests` SSE reader threads from a dedicated 8s `active_pinger_loop` that sends `POST /events/echo` (`streams: 2`), `POST /api/setWindowFocused(true)`, `POST /local-exec/responses` (`ping`), and touches `execDaemonUrl` with `x-anyrun-hibernation-lower-bound-s: 3600` / `upper-bound-s: 7200`. Fixed duplicate stdout+FileHandler logging.
    2. Updated `/home/box/keepalive/patch-sand-host-busy.py` on Grok VM to force `setWindowFocused(true)` and `ForeverBoxService.setBusy(true)` in `/opt/sand/sand-host/host-main.cjs`.
    3. Added `flock` (`$KA_RUN/boot.lock`) to `/home/box/keepalive/boot.sh` and 3-strike debounce to `/home/box/keepalive/agent-sentinel-watch.py`.
  - **Verification**: 35+ minutes (`08:25:34` → `09:02`) with **0 `time jump detected`** in `/var/log/tailscaled.log`, 30+ consecutive `💚 pulse OK (isBusy=True)`, and Grok VM load dropped `3.05 → 0.74`.
- **Diagnosed 31-Min `429` Quota Lockout on `kanawut.chunchom@gmail.com` (`08:27:29 – 08:58:38`)**:
  - `No.3` (`no3-clubsgame`) ran a 1h 18m LightCraft session up to `1,265 MSG` (`674,569` uncached input tokens per call), exhausting `gemini-4-argon-high` individual quota for 31m8s. `No.3` has now finished its turn and is idle at `❯` (`674k/1M`).

## Pending & Next Session
- [ ] [Bo / Sombo] If Bo approves, send `/clear` to `no3-clubsgame` (`psmux` `no3` on ClubSGame) now that its LightCraft review is saved in memory, preventing another 675k-token / 429 quota spike.
- [ ] [Sombo] Continue monitoring `grok-lifeline.log` & Grok VM `tailscaled.log` to confirm multi-hour zero-freeze stability.

## Key Files
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/maclab-grok-lifeline.py`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/fleet-drift-check.py`
- `/Users/admin/.claude/hooks/cbm-session-reminder`
- `/Users/admin/Code/github.com/MEYD-605/sombo-oracle/ψ/decisions.md`
