---
pattern: "Learned claude-code: Bun code-splitting optimization, multi-provider API translation, and hook/middleware plugin architecture."
date: 2026-07-16
source: "learn: claude-code-best/claude-code"
concepts: ["learn", "codebase", "claude-code", "mcp", "bun-workspaces"]
---

# Learned claude-code

## Key Insights
1. **Performance & Memory Footprint Optimization**:
   Claude Code Best uses Bun code-splitting and dynamic `await import()` statements to partition a 17MB monolith into ~450 small files. This lowers Bun JIT compile/start overhead from 1GB down to ~35MB RAM.
2. **Modular Architecture & Multi-Provider Support**:
   Exposes a clean Commander.js CLI and custom Ink TUI framework. It abstracts Anthropic's model API into a generic `@ant/model-provider` layer that enables drop-in compatibility with Gemini, OpenAI, and Grok endpoints without OAuth/key limits.
3. **Pluggable Hook and Extension Engine**:
   Loads plugins and lifecycle hooks dynamically (via `loadPluginHooks` and `loadPluginCommands`). Hooks like `PreToolUse`, `PermissionRequest`, and `SessionStart` allow deep customization, while security layers ensure workspace directory trust verification before executing hook tasks.
