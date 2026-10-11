---
name: sonnet
description: Fan out N parallel Sonnet subagents to delegate work. Usage "/sonnet [N] [task]" — N = number of agents (default 1), task = what to do (uses current session context if omitted/partial). Trigger when user says "/sonnet", "/sonnet 5", "/sonnet 3 research X", "spawn sonnet", "delegate to sonnet", "fan out sonnet agents".
---

# /sonnet — fan out N parallel Sonnet subagents

> Delegate work to a swarm of cheap, fast **Sonnet** agents. The number is the
> **agent count**. Each agent gets the task PLUS the current session context, and
> a distinct angle so they don't duplicate.

## Parse the args

Input forms (first token decides):

| Input | N (agents) | Task |
|---|---|---|
| `/sonnet` | 1 | none → **ask** the user, then fan out |
| `/sonnet 5` | 5 | none → **ask** the user, then fan out 5 |
| `/sonnet research the fleet` | 1 | "research the fleet" |
| `/sonnet 5 research the fleet` | 5 | "research the fleet" |

Rule: if the **first whitespace token is an integer**, it's `N`; the rest is the
task. Otherwise `N=1` and the whole string is the task. Clamp `N` to `[1,16]`
(the parallel-agent cap).

**`--dry-run`** (anywhere in args): do everything EXCEPT spawn. Print the plan —
parsed `N`, the enriched task, and the per-agent angle table — then stop. Lets
you confirm the fan-out before spending agents. e.g. `/sonnet 5 map the fleet --dry-run`.

If the task is **empty**, ask once: *"What should the N Sonnet agents work on?"*
— then proceed. If the task is **partial/terse**, do NOT just pass it raw:
**enrich it with the current session context** (what we've been doing, relevant
files/paths, the goal) so each agent starts informed. Show the user the enriched
task + the per-agent angles before spawning.

## Spawn

Launch **N agents in ONE message** (multiple `Agent` tool calls in a single
response → true parallelism). Every agent:

- `subagent_type: general-purpose` (or `Explore` for read-only search sweeps)
- `model: sonnet` ← **always Sonnet** (that's the point of this skill)
- `description`: short label per agent (e.g. `sonnet 2/5: <angle>`)
- prompt = **[shared task] + [session context] + [this agent's distinct angle] +
  "Return findings as text; the main agent compiles."**

### Distinct angles

Give each of the N agents a non-overlapping slice so N agents ≠ N copies of the
same search. Pick angles that fit the task. Generic fallback angle set:

```
1/N  by-files      — search the repo/codebase directly
2/N  by-history    — git log, past commits, prior art
3/N  by-memory     — ψ/memory (learnings, retros, traces), oracle memory
4/N  by-sessions   — dig session history for when this was touched
5/N  by-federation — maw ls, sibling oracles, cross-repo
6/N+ by-subtopic   — split the task itself into sub-questions
```

For a non-research task (build/refactor/write), split by **component or section**
instead (each agent owns one file / module / chapter).

### Context to inject (the "+ context above" part)

Pull the live session frame into each prompt so agents aren't cold:
- the current repo / cwd (run `pwd`)
- what the session has been working on (1–2 sentences)
- any specific files, paths, oracle names, or goals already in play
- the actual deliverable shape you want back

## Compile

When the agents return (their final text is the result, not shown to the user),
**synthesize** into one answer — dedup overlaps, resolve contradictions, present
the merged finding. Note which agent surfaced what if it matters. Don't just
concatenate the N outputs.

## Examples

```
/sonnet 5 map the volt federation
→ N=5, task="map the volt federation" + session context
→ 5 agents: 1 maw-ls/peers, 2 oracle registry, 3 ψ/memory, 4 sessions, 5 cross-repo
→ compile into one fleet map

/sonnet
→ N=1, no task → ask "what should the Sonnet agent work on?"

/sonnet 3
→ N=3, no task → ask, then fan out 3 with distinct angles
```

## Notes

- Sonnet is fast + cheap → favor MORE agents for broad sweeps; the cap is 16.
- Background option: for long sweeps, spawn with `run_in_background: true` and
  report when they land. Default is foreground (wait + compile).
- This is the lightweight sibling of `/trace --deep` (which has a fixed wave
  structure). `/sonnet N` is freeform fan-out you control.
- Agents are isolated subagents (no SendMessage); each returns text you compile.
