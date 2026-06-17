---
title: Antigravity CLI (agy, No.6 runtime) auths via Google account OAuth (ai.no.1bro@g
tags: [agy, antigravity, no6, gemini-quota, fleet-usage, ccusage-blindspot]
created: 2026-06-04
source: No.1 Bo strategy session 2026-06-04
---

# Antigravity CLI (agy, No.6 runtime) auths via Google account OAuth (ai.no.1bro@g

Antigravity CLI (agy, No.6 runtime) auths via Google account OAuth (ai.no.1bro@gmail.com), NOT a metered API key — usage is INVISIBLE to ccusage (shows ~$0.61) and instead burns the Google account's quota which has a HARD ceiling. No.6 hit it 2026-06-04 after ~3d heavy use (8,362 steps; ~6.4M generation tok/day measured via SUM(gen_metadata.size); est ~50-150M total tok/day incl context re-read) → pane: 'Individual quota reached. Contact administrator to enable overages. Resets in ~128h (~5.3d)' = No.6 BLOCKED from Gemini until reset. CHECK agy usage: SQLite DBs at ~/.gemini/antigravity-cli/conversations (+ ~/.gemini/antigravity/conversations); per-db SELECT count(*) FROM steps (turns), SUM(size) FROM gen_metadata (gen-token proxy); model in ~/.gemini/settings.json (gemini-3.5-flash), account in ~/.gemini/google_accounts.json. TWO agy agents (No.6 + No.8 agy-nano2) share ONE Google account = quota burns 2x. Unblock: enable overages/AI Pro/Ultra on account (raises ceiling) | separate account per agent (ToS risk) | switch agent to metered API (DeepSeek, no ceiling). Free Google quota ~= B1-2.5k/day API-equivalent value but CAPPED = does not scale to always-on fleet.

---
*Added via Oracle Learn*
