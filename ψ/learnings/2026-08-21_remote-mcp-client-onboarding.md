---
pattern: Validate remote MCP through the target client's complete OAuth onboarding flow, not only protocol calls
date: 2026-08-21
source: rrr: claude-ai-mcp-poc
concepts: [mcp, oauth, cloudflare-workers, claude-ai, verification]
---

# Remote MCP client onboarding is a separate verification boundary

A remote MCP server can pass `initialize`, `tools/list`, and `tools/call` over Streamable HTTP yet still fail in its intended host. Claude.ai may perform OAuth protected-resource discovery and dynamic client registration when a user connects a custom connector. Therefore, verification must cover the host's real sequence: bearer challenge, protected-resource metadata, authorization-server metadata, client registration, authorization, token exchange, tool discovery, permission UI, and an actual tool invocation.

For Cloudflare MCP SDK v2, wrap the stateless handler with `OAuthProvider`, keep `/mcp` protected, persist grants in KV, and test the exact deployed URL from Claude.ai. Treat a live host invocation as the completion gate; local curl remains necessary but insufficient evidence.
