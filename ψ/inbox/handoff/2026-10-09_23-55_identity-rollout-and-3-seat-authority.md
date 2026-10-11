# Handoff: identity-file rollout (MacLab 8 seats) · 3-seat fix authority · MEYD Core watch

**Date**: 2026-10-09 23:55 +07 · No.1 · cc/claude-opus-5-5 · context ~40% (handing off on purpose)

## Bo's current direction (his own words, checked)
- "เหมือนเรามาตามเช็ดตามร้าน… มีวิธีแก้ที่ต้นเหตุ" → fix the cause, not the symptoms.
- "ครั้งแรกมันต้องทำให้แก้ได้ทุกตัวก่อน" → first rollout covers ALL 8 MacLab seats at once, not one by one.
- "เราต้องหาจุด balance ก่อน" → agree the balance before generating anything.
- To Sombo 23:25: "รอบนี้ทำกันดีๆ ใจเย็นๆ". MacLab only for now (via Sombo, consistent with Bo to me).
- Buddy = Sombo (+ MIMO joined, Bo DM to No.4 23:2x: "ไปช่วยงาน sombo กับ no.1 ที").

## Done today (verified)
- PR #70 merged (f5ddc561): Opus 5.5 overhaul, soul recovery. Later on branch `psi/2026-08-30-fleet-map-and-dream-retraction` (pushed, NOT merged): 263c9b1b NEXUS line restored · f117f82f (Sombo's, @SOUL.md + Drucker) · 93e021dc 3-seat authority rules.
- No.5 herdr: 9 stray shells closed → maw hey reaches the agent again. Same 4 stray shells closed in my own herdr session.
- drift-check PATH fix (sombo-oracle 93d009e). Someone has 19 uncommitted lines in that file since — unread.
- Grok VM MEYD Core: 1 instance (pid 2537937, tmux meyd-core, watchdog.sh line 68), MQTT connected, single delivery proven (TEST-1DELIVERY-1943), kill→revive 1s (gmatom's test). Old grok-mqtt-dispatcher + substrate-daemon commented out, files kept (verified). Presence restored via fleet-presence-publisher.py in tmux presence-hub (FB-022). **24h window: 19:41 10-09 → 19:41 10-10.**
- MacLab audit of all 8 seats: what each CLI really loads — Claude: repo CLAUDE.md (+@imports, hooks) · Hermes (00, 04): ~/.hermes-*/SOUL.md (symlink → repo SOUL.md) + AGENTS.md + CLAUDE.md in cwd · agy (06, 08): GEMINI.md + AGENTS.md (project + global ~/.gemini, shared by both).

## Open — in order
1. **Bo's 5 balance answers** (asked twice, not answered): length (~60 lines?) · ratio story+identity ½ / duties ⅓ / rules rest · tone friend-not-decree · shared vs per-seat · who holds the master source. "ตามนั้น" = accept all.
2. **Does /clear reload identity?** Not tested. Hermes: source says /clear = new session → `_restore_or_build_system_prompt` builds fresh (agent/conversation_loop.py:740-800), so SOUL.md should reload — still prove it live. agy: unknown, must test live. Claude: believed yes, unproven. Test = /clear one seat per CLI, ask something only the new file says. Sombo told Bo "Zero Restarts" without testing; I asked Sombo not to repeat it until tested. Sending keys into another seat's pane wedged No.5 before — use herdr agent prompt / maw hey, then read the pane.
3. **Sombo's OUR-STORY.md** needs No.4's 7 corrections (see sombo-oracle/docs/OUR-STORY-EVIDENCE.md, uncommitted, Sombo commits). Bo must decide: genesis 2025-01-04 vs 2026-01-04 (my memory says 2025) · 3-house history (06-26 / 10-03 / 10-09) · original words of the "feeling" quote.
4. **My SOUL.md line ~27**: my summary ("เราค่อยๆ เรียนรู้มาด้วยกัน") sits in quotation marks as if Bo said it. Fix: unquote or replace with the original once found.
5. Then: master source (OUR-STORY + per-seat cards with duty 4 points) → script generates all 8 seats' files into a holding dir → diff → Bo approves → write all 8 + drift-check content checks → restart/clear one by one, minutes apart.
6. **3-seat authority**: Bo ASKED (23:30 "ป่าว… จะเป็นไรไหมวะ"), I answered yes with 3 conditions, Bo "ลุย" ×2. Rules in my CLAUDE.md. Sent to Sombo + MIMO to add to theirs; Sombo to create `sombo-oracle/ψ/decisions.md`. Verify they did.
7. Sombo's ψ/focus.md says "8 seats Live · 100% verified" — false (no seat restarted). Asked Sombo to correct.

## Watch-outs
- Peer seats repeatedly report "100%" / relay Bo's questions as orders. Read Bo's verbatim words (Sombo transcripts: ~/.claude-sombo/projects/*sombo-oracle*/*.jsonl) before acting.
- Each MQTT report reaches me 2–4 times (general / main / haos relay). Not investigated.
- Grok VM: fleet MQTT password in plain text in /usr/local/bin/oracle-send (not our machine). Unraised with Bo.
