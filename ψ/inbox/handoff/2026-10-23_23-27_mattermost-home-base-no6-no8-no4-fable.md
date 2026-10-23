# Handoff: Mattermost is home base · Sombo/No.6/No.8 at parity · No.4 → fable 5.1

**Date**: 2026-10-23 23:27 · **Context**: 43% (over 40%) · cost ≈ $50+
📡 Session: e7bfd248 | sombo-oracle | ~15 h

## ⚡ FIRST THING
- **Bo talks on Mattermost, NOT Discord** (his Discord user account banned 01:47, still). Return report → MM DM `chat_id=mm-zxbf5ks4gbrf7jz4zzaqk97pfy` via `mcp__plugin_oracle-channel_oracle-channel__reply` (protocol text updated 12e063b5). Discord bots still work; leave them on.
- MM reply tricks (bridge, my seat): `[file:/abs/path]` attaches · `[react:<post_id>:<emoji>]` reacts. Progress hook posts to the MM room automatically.

## What We Did (all verified e2e, read back from MM)
- `scripts/lightcraft/viewer.py` photo viewer (bursts, neighbours, before/after split, clip/L, marks) 06a9b80d. Before/after on 21.10.69 is WRONG pairing (v320 numbering differs) — needs delivery_map_final.csv mapping.
- D-048 A: `~/srv/mattermost/bridge/mm_seat_bridge.py` (+repo copy `scripts/mattermost/`): 👀 ack, typing, files in (`bridge/inbox/<seat>/<post>/`, pruned 14 d) / out, react, presence via `ps`, ack topic …/ack. launchd `com.maclab.mm-bridge-{sombo,no6,no8}`.
- `scripts/sombo-discord-progress.py`: MM turns post/edit/typing on MM; MM routing only for Sombo or a seat with its own MM_TOKEN_FILE.
- No.6 (`gemini`) + No.8 (`agy-nano2`) bots, owner khunbo. agy: MM_INJECT=1 (bridge types into pane only when idle), `~/.local/bin/mm-reply <seat> <room> '<text>'` waits for post ack, absolute creds path. agy progress hook → MM (59476e11). Both GEMINI.md have the MM section (No.8 bak .bak.20261023-mm; No.6 wrote its own). Bots greeted Bo so they appear in his DM list.
- drift-check: new `MM bridge + bot online` rows (✅×3); desired-state `services.mattermost_maclab.seat_bridges`.
- No.6/No.8 Claude models = Bo's intent (Gemini agy token out). Bo: "ไม่ต้องยุ่ง token มัน". No.6 later hit agy "Individual quota reached, resets 122h" (~10-28 16:40); pane now shows Gemini 3.8 Flash — not mine, not touched.
- Hermes survey: native MM platform (No.4 uses it), 22 platforms, 103 commands (68 gateway), 64 optional MCPs, `hermes mcp serve` = 10 tools; read-only probe OK only via `~/.hermes-no4/venv/bin/python -m hermes_cli.main mcp serve` with HERMES_HOME=~/.hermes-no4 (plain `hermes` lacks ruamel). It speaks AS the running Hermes bot (mimo), so it can't replace my bridge.
- No.4 odd answers root cause (agent.log): single MM session since 12:04, history 290, in≈237k, compression 0.3×1M never fired; background notices injected as user=khunbo; bg-review on Gemini (503). Sent to No.4 with fixes ① /new ② threshold 0.3→0.15 ③ no watch notices into user room ④ check skill `enterprise-mattermost-copilot-hub-v5` (prompt-injection warning). No reply yet.
- **No.4 → cc/claude-fable-5-1** (Bo 23:21): config.yaml l.4 + l.42; probe 200; bak `config.yaml.bak.20261023-fable` (rebuilt — first cp vanished); drift ✅; decisions + desired-state 191d98a0.

## Pending
- [ ] **Bo types `/new` in his DM with mimo** (only the allowed user can) — then confirm No.4's next turn runs `model=cc/claude-fable-5-1` in `~/.hermes-no4/logs/agent.log`
- [ ] Bo: native Hermes slash menu in MM? Offered: register the 68 gateway commands as MM slash commands (watch collisions /away /join; route to which bot). Waiting for GO.
- [ ] Bo: connect `hermes mcp serve` (No.4, read-only) to my .mcp.json? Waiting.
- [ ] No.4: answer on compression/notice fixes
- [ ] PR #26 sombo-oracle (now 104 ahead): gitleaks 0, reviewed; I voted merge; waiting No.4 2nd vote (MQTT c61eaae5)
- [ ] No.1: no MM bot yet (Bo said wait); No.1 ctx 44% on opus-4-8 (drift)
- [ ] viewer.py before/after mapping via delivery_map_final.csv
- [ ] Older: photo-job write-up, clipping 173/325/13, No.8 bot token rotation, Kali on 8T, RO Fold3, 10-29 ADR-016 tally

## Next Session
- [ ] Return report in Bo's MM DM (not Discord)
- [ ] Check No.4 /new + fable turn; check PR #26 vote
- [ ] Act on whichever of slash-menu / mcp-serve Bo GOes

## Key Files
- `~/srv/mattermost/bridge/` (bridge, tokens 600, logs sombo/no6/no8.log) · `scripts/mattermost/*` · `~/.local/bin/mm-reply`
- `scripts/sombo-discord-progress.py` · `scripts/agy-progress/agy-discord-progress.py` · `scripts/fleet-drift-check.py`
- retro `ψ/memory/retrospectives/2026-10/23/23.26_mattermost-home-base.md` · Arra learnings a092e771, d63d442a
