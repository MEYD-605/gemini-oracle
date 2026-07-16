# claude-code Learning Index

## Source
- **Origin**: ./origin/
- **GitHub**: https://github.com/claude-code-best/claude-code

## Explorations

### 2026-07-16 20:44 (deep)
- [[2026-07-16/2044_ARCHITECTURE|Architecture]]
- [[2026-07-16/2044_CODE-SNIPPETS|Code Snippets]]
- [[2026-07-16/2044_QUICK-REFERENCE|Quick Reference]]
- [[2026-07-16/2044_TESTING|Testing]]
- [[2026-07-16/2044_API-SURFACE|API Surface]]

**Key insights**:
1. CCB (Claude Code Best) is organized as a modular monorepo using Bun Workspaces. It parses subcommands via Commander.js and implements an interactive REPL loop using a custom Ink UI fork (`packages/@ant/ink/`).
2. CCB provides multi-provider model support (OpenAI, Gemini, Grok) and is optimized for fast startup (~35MB RSS vs. ~1GB RAM for official Claude Code single-file builds) through Bun code-splitting (450+ small chunks) and lazy-loading heavy dependencies (`await import(...)`).
3. Integrations include native MCP clients, VSCode SDK communication, and a remote control bridge (`bridgeMain.ts`) that polls for tasks to spawn isolated agent runs. Extension points are loaded via `loadPluginHooks` supporting pre/post tool use, permission request, and session start/end hook actions.
