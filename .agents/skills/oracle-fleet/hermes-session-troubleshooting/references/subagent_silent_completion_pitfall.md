# Pitfall: Silent Subagent Completion

## Problem
An agent dispatches background tasks via `delegate_task`, conducts live verification (STV), fixes gaps, and completes verification internally without presenting a summary report back to the user in the active chat turn.

## User Frustration Trigger
The user reacts with: `"เป็นไงบ้างอ่ะ ไม่บอกคนรับแล้วกูจะรู้"` ("How did it go? If you don't tell the recipient, how would I know?").

## Required Action
Whenever subagent execution finishes:
1. **Do not silent-verify**: Even if verification passes 100%, immediately generate a dedicated summary section in your chat turn.
2. **Explicit Evidence**: Detail:
   - What subagent task was executed
   - Target files & verification commands run
   - Live test output or result state
3. **Recipient Status**: If another agent or user was meant to be notified (e.g. GMgrok via `maw hey` or Discord DM), explicitly state that notification was dispatched.
