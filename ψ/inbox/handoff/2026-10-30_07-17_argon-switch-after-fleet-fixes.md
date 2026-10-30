# Handoff: switch to `ag/gemini-4-argon-high[1m]` (Bo 10-30 07:15) after 10-29 fleet fixes

**Date**: 2026-10-30 07:17 +07 · **Why restart**: Bo MM "เปลี่ยนเป็น argon high" → "ของมึงนั่นแหละ" (= Sombo). Pin, settings.json, desired-state.yaml, CLAUDE.md updated (470825c4). Verified 9router serves `ag/gemini-4-argon-high` for my key (200, model gemini-4-argon).

## FIRST THING ON RETURN
1. Read `~/.claude/channels/discord-sombo/progress/statusline.json` → model.id must be argon-high. Tell Bo in MM DM (`mm-zxbf5ks4gbrf7jz4zzaqk97pfy`). If not argon, say ❌ and fix.
2. `send_to_oracle 01-lord-knight` "sombo respawned on argon-high".

## Done 10-29 (verified, all reported to Bo)
- HA OS 18.3→18.4 (No.1, backup f976b845) · Core 2026.10.4 RUNNING, 156 entities.
- herdr 0.9.3→0.9.5 live-handoff on gmforge + no1 (No.1). Side-effect fixed: meyd-core spawned plain claude into tmux holders → `tmux respawn-pane -k -t <holder>:0.0 "herdr --session <s>"`.
- Shutdown post-mortem 10-28 20:20 (vfkit PUT 404, logout stall, power cut): ψ/memory/logs/2026-10-29_maclab-shutdown-stall.md · scripts/maclab-shutdown.sh (462bb46d, ec6b2b98, f1bb2dff No.1 review). Dry-run only — first real use must be watched.
- MM tokens rotated (Bo delegated): khunbo t57gs8 + sombo bot txtdeh revoked (401); new in ~/.config/mattermost/{admin,sombo-bot}.env + hermes-mattermost-daemon.py. decisions.md 6d4fd348.
- Hermes MQTT reply-forward: maclab-hermes-inbound.ts (lord-knight-oracle 7b5141bd, unpushed — repo pushes via sweep PR) + ClubSGame fleet-mqtt-inbound.ts (No.4 port, timeout 120→600s by me). Tested: No.6↔No.4 pong-06, Joker joker-fwd-ok.

## Pending (owner)
- ADR-015 Phase 1 GO — **Bo** (asked 10-30 05:2x in DM; embedder now green 30,353/30,353).
- No.1 model: live Opus 4.8 vs pin opus-5.5[1m] — **Bo** (asked; unanswered).
- No.4 model: live cc/claude-opus-5-5 vs yaml ag/gemini-4-argon-high — **Bo** (asked; unanswered).
- Seat launchers wait for :3939/:8099 before claude (boot race) — **No.1**, not urgent (decisions 48b930fd).
- meyd-core should skip herdr-held seats (handoff respawn) — **No.1**.
