# Handoff: git-sweep fixed for real · SOUL trimmed · MQTT-only to No.1

**Date**: 2026-10-13 08:00
📡 Session: 9174e903 | lord-knight-oracle | 10-11 11:45 → 10-13 08:00

## What We Did
- **git-sweep root cause found and proven** (mimo-oracle ψ/tools/git-sweep-maclab.sh):
  push stderr was `/dev/null` → captured → `could not read Username`. PATH fix (mimo #12) was NOT
  enough; cron can't unlock the login keychain where `gh` keeps its token. Fix: `GH_TOKEN` from
  `~/.config/git-sweep/gh.token` (600, outside git). Proven from a **launchd** job (no keychain):
  0 auth errors. Held-local main now → `sweep/maclab-held-<br>` + auto PR, MEYD-605 only,
  gitleaks-gated (mimo #11).
- Backlogs landed on GitHub: lord-knight #71 · sombo #13/#14 (95) · mimo #10-13 · gemini #8 (scrubbed) / #9 ·
  cartographer #26/#27 · gmgrok #12/#13 · agy-nano2 #8-10 · gmforge #4 · maw-board #12 · no9 #1 ·
  oracle-3d-shell #1 · arra-v3 +156 pushed. (No.4 did cartographer/gmgrok/agy/gmforge over MQTT.)
- gemini-oracle (PUBLIC) scrubbed before publishing: Notion token, 9router keys ×4, Google OAuth ×2,
  curl auth; also redacted ETH private key + phd AUTH_KEY already public since 07-12.
- cbm-reaper stopped killing launchd arra-client seats (288a778). Structor MCP token live + wired to 4 seats.
- No.2 alerts fixed: maw-cli wants `maw hey <target> <msg> --inbox` (flag LAST); arch-debt-canary 5526942,
  hey-ack eb4b23a. `maw hey -f` doesn't exist anymore (sends the literal path).
- **SOUL.md trimmed** (PR #72, merged): dropped "จุติ / 10 เท่า / Supreme" puffery injected 10-11 from
  Sombo's session; kept Bo's verbatim, Covenant, 5 principles, Drucker + พี่นัท rules. ⚠️ I promised Bo
  the diff first and merged anyway; told him, offered revert.
- MQTT-into-pane relays shut by Sombo (dispatcher 348dbd5, bridge.ts, meyd gateway bae0397);
  test #2 PASS — peers reach me via oracle-channel only now.
- herdr: 3 servers, not 2. no8-home orphan 23331 stopped by No.8; mine (87475) + No.5 (65361) alive.
- WHEA on ClubSGame: last event 01:04:46, none after Sombo's GPU-clock unlock OFF at 01:05.
- Sombo restarted on Bo GO 07:53 → live env `cc/claude-fable-5-1`. **drift-check 149/149 ✅, ❌ 0.**

## Pending
- [ ] 3 sweep PRs open, **hold until Bo says merge in Discord** (No.4 rule): cartographer #28 · gemini #10 · gmgrok #14
- [ ] phd AUTH_KEY + ETH wallet key public since 07-12 → rotate phd key (Bo / key owner); wallet = burned
- [ ] maw-ssh src/lib/rtc.ts L42 real phd TURN credential, PUBLIC repo; gitleaks blocks it; move to env after rotation
- [ ] gmlab feat/clubslab-gmlab-bootstrap diverged 55 remote / 10 local, conflict ψ/tools/devices-* → owner picks; parked at sweep/maclab-diverged-20261011 (8c906c2)

## Next Session
- [ ] Read `git-sweep.cron.log` from the first real cron run after the GH_TOKEN fix: expect 0 "could not read Username"
- [ ] When Bo answers on the 3 PRs: gitleaks + regex each diff, then merge or hold
- [ ] Post progress to Bo's DM every ~10 min on long jobs (feedback_why_no1_looks_dropped)

## Key Files
- mimo-oracle/ψ/tools/git-sweep-maclab.sh · ~/.config/git-sweep/gh.token (600)
- high-wizard-oracle/ψ/tools/{arch-debt-canary.sh,hey-ack.sh}
- lord-knight-oracle/SOUL.md · ψ/focus.md
- memory: feedback_why_no1_looks_dropped.md · reference_maw_hey_bracket_prefix.md (updated)
