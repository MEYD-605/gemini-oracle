# MCP Inventory & Setup Guidance

## Full MCP Stack Configuration for Hermes Agent Profiles

Hermes profiles on fleet nodes (`maclab`, `ai-core`, etc.) support both local stdio MCP servers and remote HTTP MCP servers via `config.yaml` → `mcp_servers:`.

### Official & Essential MCP Server List

1. **`arra-oracle`** (ARRA Master Vault MCP)
   - Transport: Stdio via bun remote proxy (`arra-mcp-remote.ts`) to HTTP `:47778`
   - Tools: `arra_search`, `arra_learn`, `arra_read`, `arra_stats`, `arra_handoff`, `arra_verify`, `arra_reflect`, `arra_list`

2. **`discord-reply`** (Rust High-Performance Gateway MCP)
   - Transport: Stdio binary (`discord-reply-mcp`)
   - Tools: `reply`

3. **`notion`** (Official Notion Remote MCP)
   - Transport: HTTP SSE (`https://mcp.notion.com/mcp`)
   - Capabilities: Notion pages, databases, markdown export/import

4. **`filesystem`** (Official Anthropic Filesystem MCP)
   - Transport: Stdio via `@modelcontextprotocol/server-filesystem`
   - Tools: `read_file`, `read_multiple_files`, `write_file`, `edit_file`, `create_directory`, `list_directory`, `directory_tree`, `move_file`, `search_files`, `get_file_info`, `read_media_file`

5. **`memory`** (Official Knowledge Graph Memory MCP)
   - Transport: Stdio via `@modelcontextprotocol/server-memory`
   - Tools: Knowledge graph entity/relation operations

6. **`git`** (Official Git Repository MCP)
   - Transport: Stdio via `@modelcontextprotocol/server-git`
   - Tools: Git repo inspection, diffs, commits, branches

7. **`fetch`** (Official Web Fetch MCP)
   - Transport: Stdio via `@modelcontextprotocol/server-fetch`
   - Tools: Clean markdown web content extraction

8. **`sequential-thinking`** (Official Dynamic Thinking MCP)
   - Transport: Stdio via `@modelcontextprotocol/server-sequential-thinking`
   - Tools: Multi-step reflective chain-of-thought problem solving

9. **`codebase-memory-mcp`** (LSP/Cypher Code Graph MCP)
   - Transport: Stdio binary/script
   - Tools: Codebase graph indexing, search, architecture analysis, Cypher queries

10. **`facebook-mcp`** (Meta Page & Messenger MCP)
    - Transport: Stdio script
    - Tools: Facebook posts, comments, inbox, Messenger DM, Sheet booking sync

## Installation & Enablement Pattern in `config.yaml`

To enable any of these MCP servers, add their stdio/HTTP definition under `mcp_servers:` in `$HERMES_HOME/config.yaml`. Hermes auto-connects them on startup or reload.
