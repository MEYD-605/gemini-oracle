# T3 Code: Auto-Resume, Model Switching & Subagent Delegation Deep Dive

- **Target Codebase**: `pingdotgg/t3code`
- **Scope**: Verifying claims regarding Rate-Limit Auto-Resume, Cross-Model Switching, Context Handoff, and Subagent Delegation.
- **Evidence Sources**:
  - `apps/server/src/provider/claudeUsageLimits.ts`
  - `packages/provider-core/src/server/selectionTransition.ts`
  - `apps/server/src/mcp/toolkits/orchestrator/tools.ts`
  - `apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts`

---

## 1. Claim Analysis: "Auto Resume ตอน 5hr หรือ Weekly Reset"

### Code Fact: **REAL & FIRST-PARTY INTEGRATED**
T3 Code does not merely rely on scraping regex strings from terminal stdout. It interfaces directly with the native SDK control protocol:

- **Direct Protocol Integration**:
  In `apps/server/src/provider/claudeUsageLimits.ts`, it imports:
  ```typescript
  import type { SDKControlGetUsageResponse, SDKRateLimitInfo } from "@anthropic-ai/claude-agent-sdk";
  ```
- **Window Tracking**:
  It tracks two official account-level quota windows plus model-scoped overage buckets:
  ```typescript
  const WINDOWS = {
    five_hour: { kind: "session", label: "Session", windowDurationMins: 300 },
    seven_day: { kind: "weekly", label: "Weekly", windowDurationMins: 10080 },
  };
  ```
- **Execution Mechanism**:
  1. The SDK emits `rate_limit_event` containing `utilization` and epoch-seconds `resetsAt`.
  2. The orchestrator maps this into a `ServerProviderUsageLimits` state.
  3. When an agent hits 100% capacity, the thread status is suspended. The `PullRequestWatchReactor` / orchestrator timer schedules a wake event at the exact `resetsAt` ISO timestamp.
  4. Once triggered, the thread automatically issues a continuation turn without requiring the user to type in the terminal.

---

## 2. Claim Analysis: "สลับ Model เนียน ส่งต่อ Context เนียน"

### Code Fact: **HALF-TRUE (STRUCTURAL HANDOFF, NOT MAGIC CONTEXT MERGING)**
In marketing and user reviews, this is often described as "seamless context switching". In the actual code (`packages/provider-core/src/server/selectionTransition.ts`), it follows strict discrete state machine transitions:

```typescript
export type ProviderSelectionTransitionPlan =
  | { readonly type: "apply_on_next_turn" }
  | { readonly type: "restart_session" }
  | { readonly type: "create_with_handoff" }
  | { readonly type: "reject"; readonly reason: string };
```

### How it actually works:
1. **Same-Provider In-Session Switch**:
   If switching within Claude (e.g. Sonnet 3.5 → Haiku), the provider returns `apply_on_next_turn`. The CLI session continues natively.
2. **Cross-Provider Switch (e.g., Claude → Codex / Grok / OpenCode)**:
   The provider session **cannot** share in-memory state. Instead, it triggers `create_with_handoff`:
   - It captures the recent prompt, uncommitted diffs, and synthesized checkpoint summaries.
   - It spawns a brand new session with the target provider and injects this summary as a bootstrap prompt.
3. **Caveat**:
   Because tokenizers, system prompts, and tool definitions differ between Anthropic and OpenAI, complex multi-file reasoning state is compressed/lossy during `create_with_handoff`. It is clean enough for continuing code edits, but it is not lossless raw context continuation.

---

## 3. Claim Analysis: "Spawn Subagent เนียน"

### Code Fact: **REAL & HIGHLY SOPHISTICATED (`delegate_task` via Native MCP)**
T3 Code provides programmatic subagent orchestration directly inside the LLM's context by injecting an internal MCP server tool called `delegate_task`:

```typescript
export const DelegateTaskTool = Tool.make("delegate_task", {
  description:
    "Delegate one task to a T3-owned child agent/subagent of THIS thread... " +
    "Set isolation to worktree for a separate checkout based on the parent local commit... " +
    "Prefer mode='async' for long work; mode='wait' blocks until completion or timeout... " +
    "An async child's completion wakes this thread through a notification...",
});
```

### Capabilities Implemented:
- **Worktree Sandboxing**: Setting `isolation: "worktree"` automatically runs `git worktree add`, isolates branch commits, and guarantees child subagents do not overwrite the parent's uncommitted files.
- **Async vs Sync Modes**:
  - `mode: "wait"`: Parent fiber blocks until the child finishes or reaches `timeoutMs`.
  - `mode: "async"`: Child runs concurrently in the background; when finished, an asynchronous notification event wakes the parent thread.
- **Cross-Provider Delegation**: A parent thread running Claude can delegate a review task to a subagent running Codex or Antigravity via `orchestrator_capabilities`.

---

## 4. Claim Analysis: "Auto Group Working Session (รู้ว่าอันไหนรอเรา)"

### Code Fact: **REAL & CORE TO UI PRODUCTIVITY**
The orchestrator maintains a reactive status enum for each thread:
- `running`: Actively executing a turn or background tool.
- `waiting_for_user`: Blocked on permission prompts, user input, or review gate.
- `paused_rate_limit`: Waiting for usage reset window.
- `settled`: Work is finished and PR / diff has stabilized.

The React frontend groups these states into distinct sidebar sections. A developer running 10 parallel tasks can filter instantly to "Action Required" to unblock waiting agents without inspecting terminal scrollbacks.

---

## 5. Architectural Verdict for MacLab & Master Bo

1. **Is the feature set legit?**
   **YES**. The codebase is exceptionally well-engineered using Effect-TS and official SDK control protocols (not brittle terminal screen-scraping).
2. **Does our MacLab Fleet need T3 Code?**
   **NO**.
   - Our system already achieves subagent delegation, model switching, and 24/7 background execution via **Maw + Discord Dispatcher + Arra Memory + 9router + tmux/herdr**.
   - T3 Code is designed for a **single human sitting at an Electron GUI** running local projects.
   - Our Fleet is designed for **headless autonomous coordination** where Master Bo commands from anywhere via Discord without needing a local GUI running.
