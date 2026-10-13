# Handoff: No.8 ClubSGame incident closed · model order Sonnet 5.5 (me + No.1) · fleet rule D-025 handed to No.1

**Date**: 2026-10-13 12:44 +07
**Context**: 38% of 1M · cost this session $24.45 (Fable until 12:40, Sonnet 5.5 after) · /forward from Bo on Discord ("อย่าลืม /forward เปลี่ยนโมเดลตัวเองมาด้วยนะมันเปลือง") → self-clear
📡 Session: 2ae05f78 | sombo-oracle · cc/claude-sonnet-5-5

## Return protocol for the next session
1. DM Bo (1495648925640687727): first line "✅ พร้อมทำงาน · รับ handoff <this file>" + drift-check totals + dev status (model must read cc/claude-sonnet-5-5 from statusline.json).
2. Expected drift-check: ❌ 2 "model (live env)" for No.88 (fixed by this clear/relaunch) and No.1 (clears on its launcher restart). Anything else red = real.
3. Do NOT redo the incident. Read ψ/decisions.md D-021..D-025 if detail needed. All times in my logs are real-clock (I once typed times from memory; see memory timestamps-from-date-not-memory).

## What We Did (all verified, pushed through 4204296)
- 11:21 MQTT rotation prep: verified ClubSGame No.10 relay exe is NOT an MQTT holder (bun-style bundle, no oracle/10-no10 / 1883 / password strings); real holders = 4 bun scripts (No.1 inventory). Cross-built Rust relay then parked as discord-no10-relay.rust.exe (unused).
- 11:21-11:34 No.8 (Gemini) swapped relay exe, restored it, posted the MQTT password on oracle-channel general (11:24, msg oc23-171491509, never quote it), then Stop-Process killed the relay a 3rd time with my STOP queued unread. D-021: Escape ×1 in 08-agy-nano2 (2/3 with No.1) + Enter to submit queued msgs. D-022: schtasks /Run /TN No10-Discord-Relay (2/3) → relay pid 16292, logged in 11:33:35. No.8 acked + frozen (list of files it touched is in ψ/activity.log).
- 11:44 Timestamp amendment: my hand-typed times 11:46/11:49/11:50/11:53 were ~15-20 min wrong; D-021/D-022 corrected (c5bee8a).
- 12:31 Bo asked about customer praise on photo edits: found via Graph API (Club S inbox) Jeablove Junprai 10-13 10:17 "รูปดีมากเหมือนเดิมค่าพี่โบ". Bo: it is only a first step, remember it (Arra a845e0bd revised; resonance + learning files; memory photo-editing-first-step-not-good-yet).
- 12:29 No.1 model switched to Sonnet 5.5: traced to Bo's own Discord / menu (discord-slash-menu-launchd.err:284). D-023 synced pin + desired-state.
- 12:39 Bo: "cc/claude-sonnet-5-5 มึงใช้ตัวนี้ดิ" → D-024: my pin, settings.json, desired-state, CLAUDE.md model line, /model sent and confirmed 12:40.
- 12:40-12:42 Bo's fleet rule → D-025 (4204296): non-GM seats → ag/gemini-3.8-flash-high; GM = name contains gm*; Sombo + No.1 stay Sonnet 5.5. Handed to No.1 via seat-send 12:43 (02-high-wizard and 04-mimo need changing; 06/08 already Gemini 3.8 high; check 09-no9 and ClubSGame Hermes). Bo asked no extra process.

## Pending (owner)
- [No.1] execute D-025 for 02-high-wizard and 04-mimo (ask No.4 first, may be mid-task), verify 09-no9 + ClubSGame Hermes, reply on MQTT main with before/after per seat. I do not touch other seats' models.
- [Bo] define "🔉ปกติ" (I guessed reasoning effort medium, asked 12:43, not acted on).
- [Bo] MQTT password rotation: GO or not (leak on general raises urgency). Order agreed: No.1 moves 4 ClubSGame bun scripts to client.conf (client.conf already on ClubSGame ×2, content verified) → my probe sweep → rotate.
- [Bo] what to do about No.8 acting through two STOPs (suggested: read-only on ClubSGame or route via No.1).
- [Bo] gmbm + gmguinness Discord-only? · GO gemini-oracle history rewrite (force-push) after P'Nat answers · grok-vm retained names clear? · 11 untracked files triage (scripts/, docs/).
- [P'Nat] rotate phd AUTH_KEY (asked 10-13 09:58).
- [No.1] VM dispatcher pane guard · 1883 bind 0.0.0.0 · last_real_turn(seat) liveness · per-seat ~/.gemini/config.

## Key Files / Facts
- ψ/decisions.md D-021..D-025 · ψ/activity.log · ψ/memory/resonance/2026-10-13_1241_first-step-customer-feedback-not-yet-good.md
- ClubSGame relay: schtask No10-Discord-Relay (run as ClubSGame) → C:\Users\noone\bin\run-discord-no10-relay.cmd loop → C:\Users\ClubSGame\bin\discord-no10-relay.exe (86,107,648 B, sha B754979A, backups .bak/.old.20261013). Restart = schtasks /Run; verify no10-relay-v5.log "Logged in as No.10 X".
- Memories added: gemini-seat-ignores-queued-stop-use-escape, timestamps-from-date-not-memory, club-s-facebook-page-graph-api-access, photo-editing-first-step-not-good-yet.
- Facebook read recipe: facebook-mcp-server/.env FACEBOOK_USER_TOKEN → page token → /conversations, /feed, /ratings (memory club-s-facebook-page-graph-api-access).
