---
installer: timekeeper-oracle
origin: Nat Weerawan's brain, digitized — how one human works with AI, captured as code — Soul Brews Studio
name: time-travel
description: '[core] G-SKLL | Prove claims about the past — git archaeology, session mining, vault excavation. Use when user says "time-travel", "prove", "when did", "what happened to", "history of", or needs evidence-based answers about past state. Modes: --prove (formal proof), --deep (thorough), --back (trace a concept backward). Do NOT trigger for finding current code (use /trace), session timelines (use /dig), or repo exploration (use /learn).'
argument-hint: "<claim> [--prove | --deep | --back \"<query>\"]"
---

# /time-travel — Oracle Archaeology

Prove claims about the past. Don't guess — dig.

## Philosophy

> "The past is not what you remember. The past is what you can prove."

/time-travel mines git history, session JSONL, vault files, and federation logs to produce evidence-backed answers about what happened, when, and why. It emerged organically across 6+ oracles (April 2026) and was formalized by timekeeper.

## Usage

```
/time-travel <claim>                    # Prove a claim (default --prove)
/time-travel <claim> --prove            # Formal proof with evidence sources
/time-travel <claim> --deep --prove     # Thorough: parallel agents, all sources
/time-travel --back "<query>"           # Trace a concept backward through time
/time-travel --repo <path> <claim>      # Prove in specific repo
```

## Modes

### --prove (Default)

Formal proof mode. Answer: "Is this claim true? Show evidence."

**Steps:**

1. State the claim clearly
2. Search these sources (in order of authority):
   - Git log (`git log --all --oneline --grep="<query>"`)
   - Git blame/show for specific files
   - Session JSONL files (`grep -rl "<query>" ~/.claude/projects/`)
   - ψ vault files (traces, retros, learnings)
   - Fleet configs and audit logs
   - GitHub issues/PRs (`gh issue list --search`, `gh pr list --search`)
3. For each source, extract:
   - **What**: exact content found
   - **When**: timestamp
   - **Where**: file path or commit hash
   - **Confidence**: verbatim quote vs inference
4. Write verdict

### --deep --prove

Same as --prove but launches parallel agents for each source:

**Agent A: Git Archaeology**
```
Search git history for: [claim]
TARGET REPO: [repo]

Run:
- git log --all --oneline --grep="[query]" | head -20
- git log --all --diff-filter=A -- "*[query]*" (files created)
- git log --all --diff-filter=D -- "*[query]*" (files deleted)
- git blame on relevant files
- git show for key commits

Return: commits, dates, authors, diffs. Max 500 words.
```

**Agent B: Session Mining**
```
Search session JSONL for: [claim]

Find sessions:
grep -rl "[query]" ~/.claude/projects/*/sessions/*.jsonl ~/.claude/projects/*/*.jsonl 2>/dev/null | head -20

For each hit, extract surrounding context (what was discussed).
Also check subagents:
find ~/.claude/projects/ -path '*/subagents/*.jsonl' -exec grep -l "[query]" {} \; 2>/dev/null

Return: sessions, dates, context. Max 500 words.
```

**Agent C: Vault & Memory**
```
Search ψ/ directories and Oracle memory for: [claim]

GHQ_ROOT=$(ghq root 2>/dev/null || echo "$HOME/Code")
grep -rl "[query]" "$GHQ_ROOT"/github.com/Soul-Brews-Studio/*/ψ/ 2>/dev/null | head -20
grep -rl "[query]" "$GHQ_ROOT"/github.com/laris-co/*/ψ/ 2>/dev/null | head -20

For each hit, read the file and extract context.

Return: vault files, dates, content. Max 500 words.
```

**Agent D: Fleet & Federation**
```
Search fleet configs and federation data for: [claim]

find ~/.config/maw -name '*.json' -exec grep -l "[query]" {} \; 2>/dev/null
grep "[query]" ~/.config/maw/audit.jsonl 2>/dev/null | tail -20

Return: config entries, audit events, dates. Max 300 words.
```

After all agents return, compile evidence → write verdict.

### --back "<query>"

Trace a concept backward through time. Find its earliest appearance and how it evolved.

**Steps:**

1. Find ALL mentions across git, sessions, vaults (use --deep agents)
2. Sort chronologically (earliest first)
3. Build temporal arc:
   ```
   [date] — [source] — [what happened]
   [date] — [source] — [evolution]
   ...
   [date] — [source] — [current state]
   ```
4. Identify key transitions: when did the concept change meaning, split, merge, or crystallize?

## Output Format

```markdown
# Time-Travel: [claim or query]

**Mode**: [prove|deep|back]
**Target**: [repo or scope]
**Timestamp**: [YYYY-MM-DD HH:MM]

## Claim
[What we're proving]

## Evidence

### Source 1: [Git / Session / Vault / Fleet / GitHub]
- **What**: [finding]
- **When**: [date]
- **Where**: [path/hash]
- **Confidence**: [verbatim / inferred]

### Source 2: ...

## Temporal Map
[Chronological timeline if --back or multiple events]

## Verdict
**[PROVEN | PARTIALLY PROVEN | UNPROVEN | DISPROVEN]**
**Confidence**: [high | medium | low]
**Evidence sources**: [N] independent sources checked
**Key finding**: [one sentence]

## What's Missing
[Gaps in evidence, if any]
```

## Output Location

Write proof reports to:
```
ψ/memory/traces/YYYY-MM-DD/HHMM_time-travel_[slug].md
```

## Evidence Authority Hierarchy

| Source | Authority | Why |
|--------|-----------|-----|
| Git commits | Highest | Immutable, timestamped, content-addressable |
| Git blame | High | Line-level attribution |
| Session JSONL | High | Verbatim conversation record |
| ψ vault files | Medium | Written by AI, may contain interpretation |
| Fleet configs | Medium | Current state, may not reflect history |
| GitHub issues/PRs | Medium | May be edited after creation |
| Memory files | Low | Summaries, may drift from source |

## Cross-Machine Search

When `--deep` is used, also check remote nodes via SSH:

```bash
ssh oracle-world "grep -rl '[query]' /home/nat/.claude/projects/ /home/nat/Code/ 2>/dev/null | head -20"
```

## Skill Lineage

| Oracle | First used | Form |
|--------|-----------|------|
| mawjs-oracle | 2026-04-15 | `/time-travel --deep --prove` on arra-oracle-v3 |
| god-line | 2026-04-18 | `/loop 30m` → `/time-travel` → federated to arthur |
| pigment | 2026-04-18 | Haiku subagent `pigment-time-travel` for 35-day arc |
| arra-oracle-v3 | 2026-04-18 | `/time-travel --prove` — commit 85b1dae root cause proof |
| calliope | 2026-04-18 | Blog section heading — narrative time-travel |
| arthur-god-line | 2026-04-18 | Received 5-generation chronology via federation |
| **timekeeper** | 2026-04-24 | Formalized as global skill |

## Connection to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/trace` | Finds current state → /time-travel proves past state |
| `/dig` | Timeline of sessions → /time-travel proves claims within sessions |
| `/learn` | Studies a repo now → /time-travel shows how it got here |
| `/rrr` | Captures present → /time-travel recovers what was missed |

> `/trace` asks "where is it?" — `/time-travel` asks "how did it get there?"
