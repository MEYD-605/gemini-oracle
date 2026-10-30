# Handoff: no10 privacy leak (CONTAINED, purge PAUSED for Bo) + new fleet rule

**Date**: 2026-10-30 21:24
**Context**: ~40% (auto-forward at threshold)
📡 Session: 2c15d224 | lord-knight-oracle
**Model**: live=opus-4-8; pin now `ag/gemini-3.8-flash-high[1m]` (live on next relaunch)

## ⚡ FIRST THING NEXT SESSION
1. **Read Bo's latest MM DM** (chat_id mm-z4mw3sczibr7mcnzfrfxpkizta) — I asked him to confirm "stop the no10 history purge, leave it private". Act on his answer. DO NOT rewrite no10 history / force-push without Bo's EXPLICIT yes (and note: no10's own CLAUDE.md forbids force-push "บิดเบือนอดีต").
2. Obey the **NEW FLEET RULE** (below) — talk until mutual understanding before any irreversible/sensitive action.

## 🔴 no10-oracle privacy incident — CONTAINED, remediation PAUSED
- **Found**: no10-oracle origin was PUBLIC with Bo's personal data in ψ/: **111 `*discord-dm-bo*` files** (ai-core June imports) + 3 personal images + 354 ψ/inbox total on origin/mainn. Violates "Bo personal data → never public repo".
- **Done (safe, reversible)**: made repo **PRIVATE** (`gh repo edit ... --visibility private`), verified. Full backup bundle: `~/secure-backups/no10-oracle-pre-psi-purge-20261030-211915.bundle` (chmod 600, contains the data).
- **NOT done (awaiting Bo)**: history purge (git filter-repo --path ψ --invert-paths) + force-push. Bo's last signal "ไม่แล้ว อันนี้ปกติแล้ว" ≈ he may want to STOP the purge and just leave it private. I asked him to confirm + clarified that private stops public access but DMs still live in repo history (fleet-visible). **Waiting on his confirm.**
- **Local MacLab checkout** (~/Code/.../no10-oracle, branch mainn, behind 9): has 348 uncommitted ψ/inbox working-tree deletions (an unfinished cleanup). DO NOT auto-commit, DO NOT restore.
- Memory: [[project_no10_public_leaked_bo_data_now_private]]. Log: sombo decisions.md a3e7a4e9.

## 📢 NEW FLEET RULE (Bo 2026-10-30) — applies to everyone incl. Bo
"ห้ามทำอะไรมั่ว — ถ้ายังไม่เข้าใจ/ไม่เข้าใจตรงกัน (seat↔Bo or seat↔seat) ต้องคุยกันจนเข้าใจก่อนค่อยลงมือ". Especially for irreversible/sensitive/cross-seat/Bo-personal-data/history-rewrite/visibility. "Lead don't ask" still ok for routine reversible work but does NOT override this. Memory: [[feedback_no_careless_action_talk_until_understood]]. Log: d3a66b81.

## Also this session (verified, earlier handoff 2026-10-30_07-16 has detail)
- HAOS OS 18.4 ✅ · herdr 0.9.5 on gmforge+no1 via live-handoff ✅ · gmaicore fake listener off ✅ · Ollama auto-recovery ✅ · ADR-016 detect-only ✅
- Secret blocks cleared: gmforge PR #5 merged (40ba7a2), lord-knight PR #107 merged. Token rotation (Bo delegated) — verified 0 401 on no1 side.
- shutdown script: my 2 adds committed (f1bb2dff), verdict YES.
- No.1 model: opus-4-8 → argon (14:05) → **ag/gemini-3.8-flash-high[1m]** (14:08, current pin). All via Bo.

## Pending / Next
- [ ] no10: act on Bo's confirm (stop+private, OR purge history if he says so). Coordinate ClubSGame re-sync only if purging.
- [ ] #4 Triumvirate vote (hermes-daemon: FB 10-msg ctx + CRM dedupe + git-sweep→MM clubs-dev) — I'm +1 pending the diff; flagged: guard against report-loop (sweep→MM→bridge→seat→sweep). Need diff from Sombo/No.4.
- [ ] maw-ssh-src TURN cred (BO DECISION) — public cred, needs short-lived coturn + board-owner rtc.ts merge.
- [ ] No.4: shutdown ballot f1bb2dff, Z Flip 5 gmaicore daemon (Tailscale 100.95.245.81 DOWN, use LAN), structor→Nat PR.
- [ ] model argon→gemini live on next relaunch (or /model).

## Key Files
- sombo-oracle/ψ/decisions.md (a3e7a4e9 no10, d3a66b81 rule, 07f8d932 model, f1bb2dff shutdown)
- ~/secure-backups/no10-oracle-pre-psi-purge-20261030-211915.bundle
