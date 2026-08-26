---
pattern: Verify remote MCP releases across the HTTP boundary, refreshed client catalog, and shared durable state
date: 2026-08-21
source: "rrr: claude-ai-mcp-poc"
concepts: [mcp, cloudflare-workers, oauth, turso, browser-automation, verification]
---

# Three-boundary verification for remote MCP memory

A remote MCP server is not proven merely because deployment succeeds or a connector says “connected.” Verify three independent boundaries:

1. **Protocol and authorization** — public discovery metadata resolves, unauthenticated protected routes fail closed, and dynamic client registration plus PKCE completes.
2. **Client catalog** — the real client refreshes its cached tool list and sees the deployed schemas, annotations, and server identity.
3. **Shared durable state** — one client writes a uniquely identifiable disposable record, a second client observes the same record, and only that exact UUID is deleted.

For browser-driven clients, record durable CSS/semantic/XPath selectors rather than transient snapshot refs. Treat `contenteditable` rich editors as visual/native-key surfaces until a small write probe proves that form helpers replace text correctly. Scope tool-approval selectors to the currently active response, because collapsed historical cards may keep hidden buttons in the DOM.

When shared state contains an unfamiliar record, do not infer ownership or delete it. Read-only inspection and provenance metadata are safer than treating unknown data as test residue.

