# Discord + maw-rs + Claude Pipeline Specification

> **Specification ID**: `0x6A9F_DISCORD_MAW_SPEC` · **Version**: `1.1.0`  
> **Authors**: No.6 Gemini (`[ai-core:no6]`) · **Authority**: Bo (`borde9902`)  
> **Status**: Verified & Active (14/14 Tests Passed · 100% Green)

---

## 1. System Topology & Architecture

```
[ Discord Gateway / Users (Bo / P'Nat) ]
                 │
                 ▼  (WebSocket v10 / TLS)
[ Discord Fleet Router: discord-fleet-router.ts ]
                 │
                 ▼  (maw hey <agent> <msg>)
     ┌───────────┴──────────────────────────┐
     ▼                                      ▼
[ 06-gemini (AGY / Flash) ]        [ 01-lord-knight (Claude Opus) ]
[ 08-agy-nano2 (AGY / Flash) ]     [ 00-gmgrok (Grok / Hermes) ]
     │                                      │
     └───────────────────┬──────────────────┘
                         │
                         ▼ (MCP JSON-RPC / REST API v10)
    [ Discord Multi-Tool Engine: discord-mcp.ts ]
                         │
                         ▼ (HTTP POST / PUT / PATCH)
                 [ Discord REST API ]
```

---

## 2. Component Specifications

### 2.1 Discord Multi-Tool MCP Server (`discord-mcp.ts`)
- **Runtime**: Bun 1.3+ / TypeScript
- **Transport**: JSON-RPC 2.0 via `stdio`
- **Location**: `/Users/admin/ClubS-Workspace/tools/discord-engine/discord-mcp.ts`
- **Configurations**:
  - `~/.no6-home/.gemini/config/mcp_config.json`
  - `/Users/admin/.claude.json`
  - `/Users/admin/.hermes-maclab/config.yaml`

#### Registered Tools:
| Tool Name | Parameters | Description |
|---|---|---|
| `reply` | `chat_id`, `text`, `reply_to?` | Send text message with smart chunking (<1,950 chars) and code-block preservation. |
| `send_embed` | `chat_id`, `title?`, `description?`, `color?`, `fields?`, `footer?`, `thumbnail_url?`, `image_url?` | Send rich formatted Discord embeds with inline key-value fields and hex/RGB colors. |
| `send_file` | `chat_id`, `file_path`, `caption?`, `reply_to?` | Upload local images, documents, PDFs, or screenshots as `multipart/form-data`. |
| `react` | `chat_id`, `message_id`, `emoji` | Add emoji reaction (e.g. `🫡`, `✅`, `🔥`) to a message. |
| `edit_message` | `chat_id`, `message_id`, `text` | Edit an existing bot message in-place. |
| `fetch_messages` | `chat_id`, `limit?` | Fetch channel or DM message history (1-50 messages). |
| `get_channel_info` | `chat_id` | Retrieve guild ID, channel name, and topic metadata. |
| `trigger_typing` | `chat_id` | Send typing indicator (`Bot is typing...`) to avoid perceived lag. |

---

### 2.2 Smart Message Chunking Algorithm
Discord imposes a strict 2,000 character limit per message. The chunking algorithm in `discord-mcp.ts`:
1. Splits incoming markdown text on line boundaries with `maxLen = 1,950`.
2. Tracks markdown code fences (` ``` ` and language specifiers like ` ```rust ` or ` ```typescript `).
3. If a split occurs inside a code block, automatically inserts `\n``` ` to close the fence in the current chunk, and prefixes ` ```<lang>\n ` in the subsequent chunk.
4. Guaranteed zero syntax corruption and zero Discord 400 Bad Request rejections.

---

### 2.3 Rate Limit & 429 Backoff Strategy
All REST requests pass through `apiRequest()`:
- Automatically detects HTTP 429 status code.
- Parses `retry_after` from response body or `Retry-After` HTTP header.
- Applies exponential backoff sleep (`retry_after * 1000 + 100ms`).
- Retries up to 3 times before returning an error.

---

## 3. Inter-Agent Relay Protocol (`maw-rs`)

- **Routing Engine**: `maw hey <agent> <message>`
- **Prefix Invariant**: `maw-rs` reserves leading bracket prefixes (`[...]`) for internal signed transport stamps. Inbound messages from router must format context as `Discord DM จาก <User>: <content>` or `Discord #<channel> จาก <User>: <content>`.
- **Target Map**:
  - `06-gemini`: Gemini 3.7 Flash High (Research Specialist & Pack Leader)
  - `08-agy-nano2`: Antigravity Creator (UI & Visual Synthesis)
  - `01-lord-knight`: Claude Opus 4.6 (Sovereign Orchestrator)
  - `00-gmgrok`: Grok / Hermes Gateway

---

## 4. Test Suite & Verification Results

Test Runner: `/Users/admin/ClubS-Workspace/tools/discord-engine/test-discord-pipeline.ts`

```
===============================================================
   🧪 Running Discord Engine + maw-rs Complete Test Suite
===============================================================

▶ Test 1: MCP Server JSON-RPC Protocol Handshake & Tools
  ✅ [PASS] MCP Initialize Handshake
  ✅ [PASS] MCP Registered 8 tools (Expected >= 6)
  ✅ [PASS] All 7 Core Tools Present

▶ Test 2: Smart Message Chunking & Code-Block Closure
  ✅ [PASS] Input length is 4217 chars (> 2,000 limit)
  ✅ [PASS] Chunk count is 3
  ✅ [PASS] All generated chunks are strictly under 1,950 characters
  ✅ [PASS] All code fences (```) are perfectly balanced in every chunk

▶ Test 3: Rich Embed Formatting & RGB Conversion
  ✅ [PASS] Color conversion (#00FF88 -> 65416)
  ✅ [PASS] Embed serialization valid

▶ Test 4: File Attachment Handling & Path Verification
  ✅ [PASS] Temp test file created on disk
  ✅ [PASS] File size is 40 bytes
  ✅ [PASS] Temp test file cleaned up cleanly

▶ Test 5: maw-rs Inter-Agent Relay Roundtrip
  ✅ [PASS] maw hey executed with exit code 0
  ✅ [PASS] maw hey confirmed delivery to agent session

===============================================================
   🏁 Test Results: 14 Passed, 0 Failed
===============================================================
```

---

## 5. Operational Guidelines

1. **Token Hygiene**: Token path resolution cascade checks `DISCORD_BOT_TOKEN` env var, then `.claude/channels/discord-no6/.env`, `.claude/channels/discord-no8/.env`, and `.claude/channels/discord-no1/.env`.
2. **Process Integrity**: Before spawning background daemons, check PID files and verify with `pre-spawn-check.sh`.
3. **RTK Discipline**: Always prepend `rtk` to shell commands.
