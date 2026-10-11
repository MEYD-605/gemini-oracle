---
name: orchestration-resilience
description: 'Use when delegate_task or clarify_ide fails or stalls.'
---

# Orchestration Resilience

Patterns for keeping multi-step orchestration (subagent fan-out, user clarification, skill loading) moving forward when a step fails, rate-limits, or goes unanswered — instead of stalling or blindly retrying.

## delegate_task batches

### Respect max_concurrent_children
`delegate_task(tasks=[...])` rejects with an explicit error if you exceed the configured concurrent-children limit (commonly 3, but read the actual error — don't assume). Split into sequential batches of that size instead of guessing or trimming arbitrarily.

### Rate-limit can fail an ENTIRE batch silently
A subagent model (e.g. `antigravity/gemini-3.6-flash-high`) hitting its own quota returns `status=completed` at the task-metadata level, but the task body is just `API call failed after 2 retries: HTTP 429 ... Resource has been exhausted (reset after ~5m)`. This can hit **every task in the batch simultaneously** — zero real output gets written, even though each task individually reports "completed."

**Observed pitfall**: retrying the identical batch immediately just burns another wave of calls against the same exhausted quota and fails again the same way.

**Fix**: when a batch comes back with 429/quota-exhausted errors on all or most tasks, don't re-dispatch blindly. Do the work yourself directly (`read_file`, `search_files`, `write_file`) instead — it's usually faster than waiting out the quota-reset window, and produces the same on-disk artifact a calling workflow (e.g. `/learn`) expects. Note in the resulting doc/output that subagent delegation was rate-limited and the work was done manually, so the trail is honest.

### Verify before trusting subagent "completed" status
Subagent summaries — including "Task complete" — are self-reports, not verified facts. After any batch claims success, `search_files` for the expected output paths and confirm real files actually landed before reporting success upward. This matters most exactly when a batch silently failed: the per-task status line still says `completed` even with zero output.

## clarify_ide non-response

`clarify_ide` can time out (~10 minutes) with no user response if the user is away or busy elsewhere. Don't block the whole task waiting on it.

**Pattern**: if a clarify times out, proceed with the most reasonable default or best-available-information path, explicitly flag in your next response what assumption you made and why, and keep working — don't let one unanswered question stall everything else that could safely proceed. If the user later answers, redirects, or sends an out-of-band message, that overrides the assumption immediately; don't keep asking the same question again.

## Ambiguous skill names across profiles/external_dirs

If `skill_view(name='X')` or `skill_manage` returns "Ambiguous skill name ... matches across your local skills dir and external_dirs," don't guess which one — the error lists the full paths. Re-call with the categorized path (e.g. `skill_view(name='category/skill-name')`) instead of the bare name. Common on fleets running multiple Hermes profiles that each install the same third-party skill pack (e.g. an `oracle-fleet` skill set present in both `.hermes-no1` and `.hermes-no5`).

**Pitfall — categorized path does NOT always resolve it.** When the identical skill folder name exists under the *same category* in two profiles (e.g. `oracle-fleet/maclab-oracle-ops` or `software-development/model-provider-triage` present in both `.hermes-no1/skills/` and `.hermes-no5/skills/`), `skill_view(name='category/skill-name')` still returns the same ambiguous-match error — there is currently no `name` string that disambiguates further, and absolute paths are rejected ("Skill name must be a relative path within the skills directory"). In this situation, do not loop retrying variants. Either: (a) skip editing that skill from a cross-profile curator context and route the learning into a skill that resolves cleanly instead (e.g. this one), or (b) if the edit is important, tell the user which two paths collided and ask them to fix one profile's copy directly via terminal, or rename one so the names diverge.

## Diagnosing a "ทำไมค้างวะ" (why is it stuck) report on a Discord DM session

A user reporting a session as "stuck"/"hung"/"ค้าง" is very often NOT a real hang — it's one of these, distinguishable by reading `~/.hermes-<profile>/logs/agent.log` and `errors.log` for the session id in question:

1. **Context bloat slowing API calls.** Once a session's `in=` token count climbs past ~250-300k (visible in `agent.conversation_loop: API call #N ... in=NNNNNN`), each call's `latency=` stretches to 15-30s+. A string of these back-to-back reads as "stuck" but is just slow. Fix: recommend `/reset` or `/new` to the user rather than waiting it out.
2. **A blocked `clarify` tool call.** Search the log for `tool clarify completed (NNN.NNs, ...)` — if NNN is close to 600s, the agent was sitting idle waiting on a `clarify_ide` question the user hadn't answered yet (clarify has a ~10min timeout). This looks identical to a hang from the outside.
3. **`/reset` fired mid-stream.** If the user resets while an API call is in flight, expect `Streaming failed after partial delivery, not retrying: peer closed connection...` and `Turn ended: reason=interrupted_during_api_call` right after the reset line. This is benign — the next inbound message starts a fresh session id cleanly. Don't treat it as a bug to fix.

Diagnostic sequence: `process(action='list')` for zombie background procs → `uptime`/`ps aux | sort -rk3` for actual load → `grep -n "<session_id>" ~/.hermes-<profile>/logs/agent.log | tail -40` to see the last API calls' `in=`/`latency=` and any `Turn ended: reason=...` line → check `errors.log` tail for `RateLimitError`/`EmptyStreamError` around the same timestamp. Report the real cause (slow context vs. blocked clarify vs. benign reset artifact) rather than guessing.

### Fourth case: user is replying to a stale ephemeral "Working..." indicator

A Discord/Telegram platform-native "⏳ Working — N min — iteration X/90, terminal" message is a live progress indicator from a PAST turn — once that turn ends, the indicator is stale and no longer reflects current state, but the user can still reply to it minutes or hours later ("ค้างดิ", "still stuck right?"). Don't assume a live hang from the reply alone. Resolve it as:

1. `process(action='list')` — empty confirms nothing is actually running now.
2. `grep -n "reply_to_id=<id>\|iteration <N>/90" ~/.hermes-<profile>/logs/*.log` to find which OLD session emitted that indicator, then read that session's tail (`Turn ended: reason=...`) to confirm it completed normally.
3. Report what the stale indicator was actually about (e.g. "that was a `git filter-repo` rewrite on project X that finished/got interrupted at push time — nothing running now") rather than a generic "not stuck, all good." Users read a bare reassurance as evasive; naming the concrete past task closes the loop.

## Version currency claims — verify before claiming "updated", abort (don't force) conflicting merges

When asked "is tool X updated to the latest version" or told "update it to match what peer Y is running," resist answering from memory or a prior promise ("we talked about this already, right?" is a real frustration signal that a prior turn said it would happen but didn't). Always re-verify live in the same turn:

1. Get the ACTUALLY installed version (`<tool> --version`, not what a skill/doc/last session claims) and the exact upstream target (peer's reported version, or `git fetch` + `git tag --sort=-creatordate` / `git log <branch> -1` on the real upstream remote — multi-fork repos commonly have `main` behind an active `alpha`/`dev` branch, so check the branch the target tag actually lives on, not just `main`).
2. Compute the real gap (`git log --oneline <installed-commit>..<target> | wc -l` or `git rev-list --left-right --count`) and say the number — "88 commits behind" is a verifiable claim, "probably a bit old" is not.
3. If local has unmerged fixes not yet upstream (check with `git merge-base --is-ancestor <local-fix-commit> <target>` for each known local-only fix), do NOT `git checkout <target-tag>` — that silently drops the local fixes. Merge onto the current branch instead so both sides combine.
4. If the merge produces conflicts in core dispatch/logic files (not docs/tests), **abort the merge** (`git merge --abort`) rather than hand-resolving under time pressure when the conflicting code governs commands the fleet depends on live. Confirm the tree is clean again (`git status`) and report exactly what conflicted and why, instead of forcing a guessed resolution that could regress a shared tool everyone else calls.
5. Report honestly what state things are actually in ("tried, hit a real conflict, backed out safely, here's the blocker") rather than a vague "in progress" or silently letting the update drop — an unresolved promise from a previous turn is exactly what triggers the "didn't you say you'd do this already" follow-up.

### Follow-up: "why does this profile hang but my other agents don't?"

Every profile's sessions bloat over time — that's not the differentiator. What differs is whether `compression` actually fires before the session gets stuck. Diagnose with a cross-profile comparison, not a single-profile read:

1. `grep "conversation turn: session=<id>" ~/.hermes-<profile>/logs/agent.log | awk '{print $1}' | sort -u` — does the hung session span more than one calendar day / cross multi-hour idle gaps? A session left open across idle gaps far longer than `agent.gateway_auto_continue_freshness` (default 3600s) without being force-split is the smoking gun.
2. `grep "<session_id>" ~/.hermes-<profile>/logs/agent.log | grep -i compress` — if this returns **zero lines** despite the session's `in=` token count (from API call log lines) exceeding `compression.threshold × model.context_length` (default 0.5 × 500000 = 250k), compression never even attempted to trigger for that session. That's the actual root cause of the hang, not just "context got big."
3. Compare against a healthy profile: `grep -c "compress" ~/.hermes-<other-profile>/logs/agent.log` and `grep "Session split detected" ~/.hermes-<other-profile>/logs/agent.log`. A healthy profile shows repeated `context compression started` → occasional `compression aborted: session changed before lease acquisition` (benign, means a new turn raced the compression attempt) → eventually `context compression done: messages=N->M` and a `Session split detected: <old> → <new> (compression)` line. The stuck profile's session shows none of these — it just keeps growing.
4. `grep "Turn ended" ~/.hermes-<profile>/logs/agent.log | grep -oE "tool_turns=[0-9]+" | sort -t= -k2 -rn | head -1` — a profile can rack up hundreds of tool_turns per session (e.g. 700+) and still stay healthy as long as compression keeps cutting it back down; tool_turns count alone is not the risk signal, "never compressed despite being over threshold" is.

Conclusion pattern: don't tell the user "your session bloats too much" (all of them do) — tell them "compression never triggered for this specific session even though token count crossed the threshold hours/days ago." The actionable fix is still `/reset` for the stuck session, but optionally suggest raising `compression.idle_compact_after_seconds` above its default `0` (disabled) so an idle-but-oversized session gets force-compacted between turns instead of waiting on the next inbound message to maybe race a compression attempt.
