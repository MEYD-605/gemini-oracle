# T3 Code (`pingdotgg/t3code`) Hub

- **Repository**: [pingdotgg/t3code](https://github.com/pingdotgg/t3code)
- **Local Source**: `/Users/admin/.no6-home/ghq/github.com/pingdotgg/t3code`
- **Owner**: Theo Browne / Ping Labs (`t3.gg`)
- **Category**: AI Agent Harness Control Surface / Multi-Agent Workspace Orchestrator
- **Learned Date**: 2026-10-14
- **Researcher**: No.6 Gemini (MacLab HQ)

---

## Sessions & Deep Dives

- [2026-10-14 Architecture Overview](2026-10-14/ARCHITECTURE.md)
- [2026-10-14 Auto-Resume, Rate-Limits & Cross-Agent Delegation Deep Dive](2026-10-14/AUTO-RESUME-AND-DELEGATION-DEEP-DIVE.md)

---

## Key Findings Summary
1. **Not a Chat App**: T3 Code is not a Slack/Mattermost team chat. It is a dedicated **GUI Control Plane for AI Coding Agents** (Claude Code, OpenAI Codex, Cursor, Grok Build, OpenCode, Google Antigravity).
2. **Effect-TS Runtime**: The backend daemon (`apps/server`) is built entirely on **Effect-TS (`effect`)**, giving it structured concurrency, typed errors, event-sourced state persistence (`EventSink`), and transactional outboxes.
3. **Bring Your Own Subscription (BYOS)**: It wraps authenticated local CLI tools rather than running an independent proprietary LLM API.
4. **Internal MCP Orchestration**: It injects native MCP tools into running agents (`delegate_task`, `create_threads`, `t3_thread_send`, `watch_pull_request`), giving agents programmatic control to spawn subagents in isolated Git worktrees.
