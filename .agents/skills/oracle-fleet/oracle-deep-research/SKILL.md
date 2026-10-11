---
name: oracle-deep-research
description: Sonnet-forced deep research — fan-out web search, adversarial verify, cited synthesis. ALWAYS uses Sonnet agents. Use instead of /deep-research which defaults to Opus.
---

# /oracle-deep-research — Sonnet Deep Research

**Always Sonnet. Always.** This is `/deep-research` but with model forced to `sonnet` on every agent.

## Usage

```
/oracle-deep-research "memory systems for AI agents: MCP vs CLI vs vector"
/oracle-deep-research --angles 5 "Tauri 2.0 sidecar patterns"
```

## Why This Skill Exists

`/deep-research` Workflow inherits the session model — which may be Opus (expensive, slow, sometimes dies mid-run). This skill hardcodes `model: "sonnet"` on every agent call. Same research quality, 5–8× cheaper.

**Rule**: Always use `/oracle-deep-research`, never `/deep-research` directly.

## How It Works

### Step 1 — Decompose into 3–5 angles

Read the question. Break into angles that together cover the space. Default 3, use 5 for complex topics.

| Angle | Focus |
|-------|-------|
| Mechanism | How does it work technically? |
| Alternatives | What do others use instead? Tradeoffs? |
| Best practice | What does real-world usage show? |
| Evidence | Benchmarks, case studies, GitHub issues |
| Future | Roadmap, emerging patterns |

### Step 2 — Spawn Sonnet agents in parallel

Spawn ALL agents in ONE message (parallel). Every agent:
- `model: "sonnet"` — non-negotiable
- `run_in_background: true`
- Uses WebSearch + WebFetch
- Returns structured bullets with source URLs
- Max 300 words

**Agent prompt template:**
```
Research the following from the [ANGLE] angle:

Question: [QUESTION]
Angle: [ANGLE_DESCRIPTION]

Use WebSearch + WebFetch to find real sources. Return:
- Bullets with concrete findings
- Source URL for every claim
- Any surprising or counter-intuitive finding
- Max 300 words
```

### Step 3 — Synthesize

Once all agents complete, synthesize into:

```markdown
## Oracle Deep Research: [Question]

### [Angle 1 Name]
- Finding ([source](url))

### [Angle N Name]
...

### Cross-Angle Synthesis
- Consensus: [what multiple angles agree on]
- Tension: [where angles disagree]
- Recommendation: [what to do]

### Verdict
[1–2 sentences answering the original question]
```

## Hard Rules

1. **model: "sonnet"** on every Agent call — never omit, never inherit
2. **All agents in one message** — parallel, not sequential
3. **WebSearch required** — no guessing from training data
4. **Source URLs required** — every claim needs a link
5. **Main agent synthesizes** — don't spawn a synthesis subagent

## Relationship to Other Skills

- `/deep-research` — Workflow-based, inherits session model (may be Opus → expensive). Avoid.
- `/deep-research-sonnet` — Same Sonnet approach, different name. Both work identically.
- `/oracle-prism` — Lens analysis. Add `--prism` flag to pipe synthesis through prism after.
