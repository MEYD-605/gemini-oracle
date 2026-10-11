# Top 5 Tools & Repos for SOUL.md / AGENTS.md & Memory-to-Persona Distillation

**Prepared by:** No.6 Gemini (Research Specialist & Pack Leader) · `[maclab:no6]`  
**Requested by:** Master Bo via Sombo 88 (`[maclab:sombo-oracle]`)  
**Date:** 2026-10-06  
**Status:** Facts Verified via Live GitHub API  

---

## 1. Executive Summary

This research benchmarks the top 5 open-source repositories and skills specifically designed for:
1. Formulating structured agent identity, persona, and character files (`SOUL.md`, `AGENTS.md`, `STYLE.md`, `IDENTITY.md`).
2. Distilling high-volume memory logs (e.g. Arra Memory 48k+ records, session transcripts) into distilled, actionable agent wisdom.

---

## 2. Top 5 Repositories & Skills Matrix

| # | Tool / Repo | Category | Stars | Last Commit / Push | Fit for Oracle Council Fleet |
|---|---|---|---|---|---|
| **1** | [`aeonfun/soul.md`](https://github.com/aeonfun/soul.md) | Persona & Soul Distillation Framework | 685 | 2026-09-07T21:57:10Z | **Direct / High**: Built for Claude Code & OpenClaw. Contains `soul-builder` skill to distill personas from data. |
| **2** | [`win4r/openclaw-workspace`](https://github.com/win4r/openclaw-workspace) | Workspace Skill & Memory Distillation | 288 | 2026-03-11T15:08:41Z | **Direct / High**: Dedicated Claude Code skill for auditing and budgeting `SOUL.md`, `AGENTS.md`, and `MEMORY.md`. |
| **3** | [`agentsmd/agents.md`](https://github.com/agentsmd/agents.md) | Standard Specification | 24,787 | 2026-09-10T18:46:16Z | **Foundational**: The industry open format standard for `AGENTS.md` ("README for machines"). |
| **4** | [`mergisi/awesome-openclaw-agents`](https://github.com/mergisi/awesome-openclaw-agents) | Persona Templates Collection | 3,994 | 2026-10-06T05:59:57Z | **Benchmarking**: 162 production-ready `SOUL.md` agent templates across 19 operational categories. |
| **5** | [`mem0ai/mem0`](https://github.com/mem0ai/mem0) | Memory & Persona Distillation Engine | 66,648 | 2026-10-06T05:29:57Z | **Engine / Scale**: Production memory layer that dedupes and distills chat streams into persistent profiles. |

---

## 3. Detailed Repository Breakdown

### 1. `aeonfun/soul.md`
* **URL:** `https://github.com/aeonfun/soul.md`
* **What it does:** 
  A structured digital identity specification for AI agents. It establishes a multi-file hierarchy:
  * `SOUL.md`: Primary identity, worldview, core opinions, and moral convictions.
  * `STYLE.md`: Sentence structure, voice, tone, and explicit anti-patterns.
  * `MEMORY.md`: Curated session memory log.
  * `examples/`: Calibration samples (`good-outputs.md` vs `bad-outputs.md`).
  * `BUILD.md` (`soul-builder` skill): An automated discovery engine that analyzes past conversation archives, blogs, and writing to extract tone and worldview into `SOUL.md`.
* **Stars:** 685 stars
* **Last Commit:** `2026-09-07T21:57:10Z`
* **Fit for us:** **Direct Fit (9.5/10)**. This directly solves the problem of seats with missing or 1-line `SOUL.md` (No.2, No.88, No.8, No.3). We can run the `soul-builder` methodology over our past transcripts and memory to synthesize each seat's identity.

---

### 2. `win4r/openclaw-workspace`
* **URL:** `https://github.com/win4r/openclaw-workspace`
* **What it does:** 
  A dedicated Claude Code skill designed specifically to audit, budget, and optimize agent workspace files (`AGENTS.md`, `SOUL.md`, `TOOLS.md`, `IDENTITY.md`, `USER.md`, `MEMORY.md`).
  * Enforces strict token budgets (max 20,000 chars per file, ~150,000 chars total bootstrap budget) to prevent context bloating.
  * Includes automated memory distillation routines to condense daily logs (`memory/YYYY-MM-DD.md`) into curated long-term invariants (`MEMORY.md`).
  * Cross-file consistency checker: Flags conflicting rules between `AGENTS.md` (rules) and `SOUL.md` (persona).
* **Stars:** 288 stars
* **Last Commit:** `2026-03-11T15:08:41Z`
* **Fit for us:** **Direct Fit (9.5/10)**. Our current setup exhibits massive inconsistency (some `CLAUDE.md` files are 5 lines, others 140 lines; `SOUL.md` ranges from 1 line to 26 lines). This skill provides the exact budgeting and maintenance framework we need.

---

### 3. `agentsmd/agents.md`
* **URL:** `https://github.com/agentsmd/agents.md`
* **What it does:** 
  The official specification and open community standard for `AGENTS.md`. Designed as a "README for machines" complementary to human `README.md`. It standardizes how AI coding agents (Claude Code, Gemini CLI/agy, Cursor, Windsurf, Copilot, Aider) discover build steps, testing requirements, boundary disciplines, and code guardrails across monorepos and subdirectories.
* **Stars:** 24,787 stars
* **Last Commit:** `2026-09-10T18:46:16Z`
* **Fit for us:** **High / Core Standard (9/10)**. Unifies the root `AGENTS.md` and repository-level instructions across all seats in MacLab, ensuring that whether a seat runs `claude-cli`, `agy`, or `hermes`, it obeys identical project invariants.

---

### 4. `mergisi/awesome-openclaw-agents`
* **URL:** `https://github.com/mergisi/awesome-openclaw-agents`
* **What it does:** 
  A large-scale directory of 162 production-ready AI agent templates using the `SOUL.md` format across 19 categories (DevOps Engineer, Architect, Security Auditor, Research Analyst, Support Concierge, etc.). Provides concrete reference implementations of tone, voice, hard-stops, and operational boundary definitions.
* **Stars:** 3,994 stars
* **Last Commit:** `2026-10-06T05:59:57Z` (actively updated today)
* **Fit for us:** **High Reference Value (8.5/10)**. Eliminates the need to write seat personas from scratch. We can adopt and refine battle-tested `SOUL.md` archetypes for No.8 (Hardware Medic), No.88 (Concierge/Secretary), No.2 (Architect AXIS), and No.3/Joker (Wildcard Scout).

---

### 5. `mem0ai/mem0`
* **URL:** `https://github.com/mem0ai/mem0`
* **What it does:** 
  A scalable memory infrastructure layer for AI agents. Rather than dumping raw text, it continuously evaluates incoming messages, extracts atomic facts and persona attributes, resolves contradictions, dedupes information, and distills raw chat history into structured profiles.
* **Stars:** 66,648 stars
* **Last Commit:** `2026-10-06T05:29:57Z` (actively updated today)
* **Fit for us:** **High for Arra Synthesis (8.5/10)**. Arra Memory currently holds 49,142 items, of which 20,840 are raw session transcripts and auto-sync dumps. Mem0's extraction logic (or adopting its distillation pipeline) is the ideal technical pattern to compress Arra down to core immutable truths.

---

## 4. Honorable Mention: `FerroxLabs/agents-md`
* **URL:** `https://github.com/FerroxLabs/agents-md`
* **What it does:** Drop-in senior engineer `AGENTS.md` standard that kills sycophancy, eliminates drive-by refactors, forces verification loops, and unifies Claude Code, Gemini CLI, Cursor, and Codex workflows.
* **Stars:** 718 stars | **Last Commit:** `2026-05-31T01:45:51Z`
* **Fit for us:** **Strong rulebook candidate (8/10)**.

---

## 5. Synthesis & Recommended Next Action for Sombo 88 & No.6

1. **Adopt the Hierarchy from `aeonfun/soul.md` and `win4r/openclaw-workspace`**:
   - `AGENTS.md`: Operational instructions & machine guidelines.
   - `SOUL.md`: Persona, tone, convictions, and boundaries per seat.
   - `MEMORY.md`: High-signal distilled facts only (strictly budget capped at ~20k chars).
2. **Execute Seat Persona Generation**:
   - Write missing `SOUL.md` for No.88 (Secretary/AURA), No.8 (Hardware/Field Medic), No.3/Joker (Wildcard Scout).
   - Expand No.2 High Wizard from 1 line to full Architect/AXIS persona.
3. **Master Knowledge Index (MKI) Pruning**:
   - Separate Arra's 49,142 records into *Active Truth* vs *Archived Transcripts*.
