---
title: Context Bloat Token Burn in Long-Running Sessions
tags: [session, context-window, token-burn, rate-limit, optimization]
created: 2026-06-03
source: No.6 Gemini /rrr
project: github.com/meyd-605/gemini-oracle
---

# Context Bloat Token Burn in Long-Running Sessions

## Pattern
In conversational agent systems (e.g., Claude Code, Antigravity CLI, or custom gateway agents), each turn of communication sends the entire session history to the LLM. If a session accumulates too many turns (e.g. 50-100+ turns, culminating in a 1MB+ transcript with 900+ steps), every subsequent simple response or tool call consumes massive amounts of tokens. This leads to rapid API rate-limiting and quota exhaustion.

## Evidence
- Conversation ID `cd7a67f2-9041-4eaf-b022-2eababd0f008` grew to 900+ steps.
- The `transcript.jsonl` size reached 1MB+ in size.
- Every simple check or tool execution burned hundreds of thousands of tokens.
- Gemini 3.5 Flash hit rate limits repeatedly, prompting manual model setting swaps and user friction.

## Lesson
1. **Never let conversation sessions run indefinitely** — short, targeted sessions are token-efficient.
2. **Flush the context proactively** — run `/rrr` and start a new session (context flush) when steps/turns exceed 50-100.
3. **Beware of loop-based tool execution** — tool calling inside long contexts multiplies token usage quadratically.

## Recommendation
- Monitor conversation size (number of steps/transcript size) and issue a warning or suggest /rrr + /forward when it grows beyond 100 turns.
- Design automated systems (like inbound relays) to support clean session rotation rather than appending endlessly to a single history.
