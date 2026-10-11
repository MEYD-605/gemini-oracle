# Root Cause Analysis: Agent Hallucination & Attention Dilution Loop

## Overview & Case Study (2026-08-14 Session - No.5 / `gmforge`)

### Symptoms
- Agent appeared confused, rambling, or stuck in a loop ("หลอนๆ / วนไปวนมา / ตอบช้า") after only ~22 minutes of conversation.
- Repeatedly ran search/rsync commands and checked git logs despite work being already completed on disk.

### Root Cause Mechanics
1. **Tool Call Storm**:
   - The user issued a broad, open-ended instruction ("พัฒนาตัวเองดิ มีอะไรให้ทำบ้างส่ง sub agent ไปดูให้ละเอียด").
   - No.5 launched 126 tool calls within 22 minutes (generating ~196KB of raw stdout/JSON output).
2. **Attention Dilution**:
   - Massive tool execution outputs flooded the LLM's context buffer.
   - Even though the wall-clock time was short, the context window reached ~150K+ tokens of mostly raw terminal output.
   - The model suffered attention degradation: it failed to recall that previous tool calls had already succeeded, interpreting user criticism ("เพิ่งคุยไปไม่เท่าไหร่เองไม่ใช่หรอวะลองดูให้ละเอียดดิ") as a signal to re-run the entire discovery/sync loop.
3. **Mid-Session Model Swap**:
   - Switching from Grok to Gemini 3.7 Flash mid-session on top of a bloated context window compounded the problem, as Gemini 3.7 re-read history formatted under prior Grok model assumptions.

## Preventive Measures & Remediation

1. **Config Tuning (`config.yaml`)**:
   - Lower compression threshold from `0.3` to `0.25`.
   - Decrease `proactive_prune_tokens` from `48000` to `32000` to aggressively drop massive tool stdout blocks before they cause attention rot.
   - Reduce `idle_compact_after_seconds` to `900` (15 min).

2. **Operational Discipline**:
   - Avoid executing broad multi-step exploratory sweeps directly in the primary session thread; delegate heavy discovery sweeps to subagents or background terminal processes.
   - Run `/new` immediately after completing large infrastructure sweeps or mid-session model changes.
