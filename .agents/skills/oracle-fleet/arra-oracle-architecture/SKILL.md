---
name: arra-oracle-architecture
description: "Arra Oracle v3 MCP memory layer + search architecture, Cloudflare $5/mo quota optimization (R2 backups, Workers AI CLI), Vectorize 64-byte ID limit (error 40008, 71% DB impact / 17,321 docs / 17,324 byte-count, byte vs char UTF-8 trap, adapter safe_id SHA256 sha256 55+1+8=64 fix) & get_by_ids fixes, Cloudflare Vectorize write propagation delay (~57s) & deferred verify runbook (~/.arra-oracle-v2/REINDEX-RUNBOOK.md), Cloudflare dual auth header fix (cfk_* vs cfat_*), Vectorize topK <= 50 limit (error 40025), Joker No.99 & Edge Watchdogs, mcp<2 pinning, ORACLE_VECTOR_ENABLED=1, D1 bulk sync via wrangler, vector hydration safe_id fix, Cloudflare D1 edge failover, and fleet setup."
version: 1.5.1
---

# Arra Oracle v3 Architecture Reference

`arra-oracle-v3` is a Bun-native TypeScript MCP memory layer and semantic search engine with built-in HTTP server capabilities, vector storage abstractions, and knowledge indexing pipelines.

> **operating / diagnosing a live instance & Hybrid Search Content Hydrate Bug** — API routes, reading `/api/stats`, the CF bulk
> lock that pins `vector.count` at 0, SQLite schema gotchas, the "are we still learning?"
> query, MCP startup log signatures, **hybrid/vector search content hydration from SQLite `oracle_fts` & Cloudflare D1 Edge Failover** (fixing score > 0 but content = "" when maclab is online or offline), `ORACLE_DB_FILE` pointing to `oracle-master.db` (24k docs), `ORACLE_VECTOR_ENABLED=1`, **Cloudflare D1 Central Forum & Document Database (`oracle_knowledge_d1`)** for 24/7 cross-fleet coordination (forum_threads, forum_messages, learn_log, activity_log),
> `maw hey` cross-node federation (`maw.config.json` namedPeers, `agents` map, `federationToken`, `peer-key` user ownership, headless systemd vs tmux TUI pane injection), and **fleet topology** (which agents share the maclab
> heart, no10 SOCKS5 path, no3/developer separate brain): see `references/arra-maclab-operations.md`.
>
> **User-Installable Apps vs Webhooks vs Persistent WebSocket**: Cloudflare Workers cannot host persistent WebSocket connections for Discord Gateway DM handling directly without complex Durable Objects (`discord-gateway-cloudflare-do`). Plain Webhooks (Interactions Endpoint) work for Slash Commands (must reply or defer within 3 seconds using `type: 5`), but plain DMs require persistent WebSocket Gateway connection. Serverless Edge agents work best for Watchdog/Failover, while full Hermes agents belong on local hosts or MicroVM Sandboxes. See `references/joker-discord-edge.md`.
>
> **Cloudflare $5/mo Quota & R2/Workers AI Stack** — R2 offsite backup pipeline (`oracle-backups` bucket),
> `/usr/local/bin/cf-ai` CLI for Llama 3.3 70B & DeepSeek R1 32B zero-cost fallbacks, and
> 24/7 Cloudflare Edge Watchdog & Edge Vector Proxy (`https://joker.clubsxai.com` & `https://guardian.clubsxai.com`):
> see `references/cf-quota-optimization-and-tools.md` and `references/cloudflare-edge-guardian-watchdog.md`.
>
> **Cloudflare CFK Auth Fix, topK Limit (Code 40025), Phantom Collections Triage & Decoupled Runtime** — Dual auth header prefix rules (`cfk_*` vs `cfat_*`), Cloudflare Vectorize topK <= 50 cap with returnMetadata='all', fixing Error 7000 vector search fallback, phantom collection removal, decoupled runtime path (`~/.arra-oracle-v2/runtime/`), and Arra v3 Alpha feature breakdown (+471 TS files, unified CLI, sleep-consolidation, HTTP-proxy MCP): see `references/arra-v3-alpha-and-auth-fixes-2026-08-12.md`.
>
> **Decoupled Runtime Server Isolation & Hydration Safe-ID Trap** — To prevent dev worktree operations from crashing live port 47778, production server runs out of an isolated git worktree at `~/.arra-oracle-v2/runtime/`. When decommissioning registered worktrees, ALWAYS use `git worktree remove --force` instead of direct `rm -rf`; `rm -rf` leaves stale entries in `.git/worktrees/` that block future `git worktree add`. Note: on v3 upstream, CF Vectorize truncates long IDs into `safe_id` (e.g. `learning_2026-08-03_cloudflare-auth-is-n_1232313b` ending with 8-char hash). If hydration queries SQLite `oracle_documents`/`oracle_fts` with `safe_id` directly instead of prefix/mapping lookups, or if CF Vectorize metadata lacks `document` and SQLite hydration fails to SELECT `content`, vector search results return `content: ""` (0 chars) while FTS/SQLite actually holds full text (1220+ chars). See `references/arra-v3-alpha-and-auth-fixes-2026-08-12.md`.
>
> **Dead Seat Cleanup & Archive Rule (2026-08-12)** — When auditing and cleaning inactive/dead agent homes (e.g. `~/.hermes-gmaicore`, `~/.hermes-sombo-tui`), verify process, open file, and launchd counts are all 0. Never `rm -rf` directly if `state.db` contains session history. Archive first to `~/.hermes-archive/hermes-<seat>-<date>.tar.gz`, verify archive integrity with `tar tzf` before removing, and confirm core services (gateway, MCP watchdogs, Arra Oracle 200 OK) remain healthy post-cleanup.
>
> **Discord Serverless DM & Webhook Endpoint** — Cloudflare Workers support sending Discord DMs via REST API
> (`https://discord.com/api/v10/users/@me/channels` -> `/channels/{id}/messages`) using the bot token stored in
> `DISCORD_BOT_TOKEN`. Joker (No.99) runs 24/7 on Cloudflare Edge without needing a local host running.
>
> **CF Workers AI ≠ 9router models (verified 2026-08-03):** Cloudflare Workers AI models (e.g.
> `@cf/baai/bge-m3`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`) are accessed via the
> `/usr/local/bin/cf-ai` CLI and the arra-oracle MCP path ONLY. They do **NOT** appear in
> 9router's `/v1/models` endpoint and cannot be called through 9router's OpenAI-compatible API.
> When Bo asks "what models did we add from the CF $5 subscription?", the answer is:
> embedding/search models (bge-m3 for citation indexing), and inference fallbacks via cf-ai CLI
> — none of these are selectable as `model.default` in a Hermes seat or via 9router.
> Verify with: `curl -s http://127.0.0.1:20128/v1/models | python3 -c "import json,sys; [print(m['id']) for m in json.load(sys.stdin)['data'] if 'cf' in m['id'].lower() or 'cloudflare' in m['id'].lower()]"` — should return nothing.
>
> **Fast triage rule:** `total` in `/api/stats` counts local SQLite/FTS5 rows; `vector.count`
> counts remote Cloudflare Vectorize entries. They move independently. `total: 24343` +
> `vector.count: 0` means keyword recall works and semantic recall is dead — and search
> output still looks *normal* because the hybrid pipeline (§4) silently degrades to the FTS5
> leg alone. Never judge index health from search results; read `vector.count`.
>
> **BUT first run the canonical verify script** (maclab):
> `bash /Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/ψ/tools/arra-cf-verify.sh`
> If it prints `== 4/4 GREEN ==`, arra is healthy. `vector.count: 0` + `/api/vector/health down`
> is a known false alarm — maclab uses CF Vectorize, not LanceDB; the missing LanceDB path is
> expected. **Exception:** if `/api/health` shows `vectorMode: "disabled"` AND verify FAILS,
> the cause is likely `vector-server.json` adapter mismatch — see the "Real disable (2026-08-09)"
> fix recipe in `references/arra-maclab-operations.md`.

## Critical Operational Notes (2026-08-10)

### ORACLE_VECTOR_ENABLED=1 is REQUIRED

Without this env var, arra server starts with `vector.enabled: false` even when
`vector-server.json` has `adapter: cloudflare-vectorize` and valid CF credentials.
Always start server with:

```bash
export ORACLE_VECTOR_ENABLED=1
source ~/.cloudflare.env
cd ~/.arra-oracle-v2
bun /path/to/arra-oracle-v3/src/server.ts >> server.log 2>&1 &
```

Verify: `curl -s http://127.0.0.1:47778/api/stats | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['vector'])"`
Must show `"enabled": true` and `"count": 26374` (not 0).

### Cloudflare D1 Sync — use `wrangler d1 execute --file` NOT Python API

Direct Python API batching to D1 is unreliable (param limits, timeout, version mismatch errors).
The correct method for bulk sync is:

```bash
# 1. Export SQL dump from SQLite
python3 -c "
import sqlite3, os
DB_PATH = os.path.expanduser('~/.arra-oracle-v2/oracle-master.db')
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
rows = cursor.execute('SELECT id, type, source_file, concepts FROM oracle_documents').fetchall()
conn.close()
with open('/tmp/oracle_d1_dump.sql', 'w', encoding='utf-8') as f:
    f.write('CREATE TABLE IF NOT EXISTS oracle_documents (id TEXT PRIMARY KEY, type TEXT, source_file TEXT, content TEXT, concepts TEXT);\n')
    for r in rows:
        doc_id = (r[0] or '').replace(\"'\", \"''\")
        doc_type = (r[1] or 'unknown').replace(\"'\", \"''\")
        source_file = (r[2] or '').replace(\"'\", \"''\")
        concepts = (r[3] or '[]').replace(\"'\", \"''\")
        f.write(f\"INSERT OR REPLACE INTO oracle_documents (id, type, source_file, content, concepts) VALUES ('{doc_id}', '{doc_type}', '{source_file}', '', '{concepts}');\n\")
print('Dump created:', len(rows), 'rows')
"

# 2. Import via wrangler (fast, atomic, reliable)
CLOUDFLARE_EMAIL="ai.no.1bro@gmail.com" \
CLOUDFLARE_API_KEY="<global-key>" \
  npx wrangler d1 execute oracle_knowledge_d1 --remote --file=/tmp/oracle_d1_dump.sql
```

This completes in ~2 seconds for 24k docs. Verify: `wrangler d1 execute oracle_knowledge_d1 --remote --command "SELECT COUNT(*) FROM oracle_documents;"`

Note: content column is left empty in the dump (SQL dump doesn't carry oracle_fts content to avoid join timeout). The D1 failover hydration path in `searchOneModel()` currently uses `id`, `type`, `source_file` only — content hydration from D1 is a future enhancement.

### ORACLE_DB_FILE must be `oracle.db` in `src/const.ts` for tests to pass

`bun test` runs against a fresh temp DB. If `src/const.ts` has `ORACLE_DB_FILE = 'oracle-master.db'`, many unit tests that expect default config will fail (`source: "file"` vs `source: "defaults"`, vector config tests, etc). Use the environment-level override at server start time:

```bash
# Production (start server with master DB):
ORACLE_DB_FILE=oracle-master.db ORACLE_VECTOR_ENABLED=1 bun src/server.ts

# Tests — always use defaults (src/const.ts stays as 'oracle.db'):
bun test  # uses oracle.db via const.ts default
```

Do NOT hardcode `oracle-master.db` in `src/const.ts` — it breaks 100+ unit tests.

### `arra_verify` MCP tool scope — remote-stats-proxy on maclab, not full verify (2026-08-11)

Calling the `arra_verify` MCP tool from maclab (or any non-ai-core seat) returns
`"mode": "remote-stats-proxy"` with a `"note"` field stating full verify (disk vs DB
reconciliation) requires the **local** MCP running ON ai-core — the HTTP `/api/verify` route
isn't exposed for remote callers. Fields returned in this mode (`healthy`, `total`,
`index_age_hours`, `is_stale`, `vector.count`) are real and useful for a freshness check, but
they are NOT the same guarantee as a full verify. Don't report "arra verify: healthy" to Bo
as if it were the full disk-vs-DB check — say "remote-stats-proxy: healthy, index age Xh"
instead, and route full-verify requests to ai-core.

**Best live-health proof available from maclab: an actual `/api/search` query, not just
`/api/stats`.** Stats/verify can report `healthy: true` and a fresh `index_age_hours` while a
downstream consumer (D1, a specific query pattern) is silently broken. Always pair the stats
check with one real query before declaring the index "verified working":
```bash
curl -s "http://127.0.0.1:47778/api/search?q=<realistic query text>" | head -c 500
```
A non-empty `results` array with real document content is stronger evidence than any stats
field — this is the same "GREEN must have numbers" / anti-เขียวหลอก discipline as
`gmgrok-master-execution-rules` §5, applied specifically to arra health checks.

### Fleet Harness Test Suite

`/Users/admin/Code/github.com/MEYD-605/gmgrok-oracle/scripts/fleet-harness.sh` — run this to verify the full fleet stack before claiming GREEN:

1. HTTP Search + D1 Hydration (GET /api/search?mode=hybrid)
2. Cloudflare D1 Shared Forum Query (37 forum_threads)
3. Cross-Node `maw hey` delivery to natz-ai-03:03-highclass
4. Core Unit Tests (57 tests, `bun test src/integration/http.test.ts` etc.)

Run after any arra-oracle-v3 code or config change. All 4 must PASS before reporting done.

### D1 Central Forum/Activity Tables (shared cross-fleet board)

Created in `oracle_knowledge_d1` (same DB as oracle_documents):
- `forum_threads` (id, title, status, created_by, project, created_at)
- `forum_messages` (id, thread_id, role, author, content, created_at)
- `learn_log` (id, title, content, tags, project, created_at, author)
- `activity_log` (id, agent, node, action, detail, created_at)

Synced from maclab SQLite: 37 threads, 266 messages. All fleet nodes (no.3, no.10, note20) can read/write via CF D1 REST API even when maclab is offline. Use `wrangler d1 execute oracle_knowledge_d1 --remote --command "SELECT COUNT(*) FROM forum_threads;"` to verify.

### D1 Python API limits (for small writes / activity logging)

When writing individual records to D1 via Python (e.g. activity_log):
- Max ~50 bind parameters per query (10 rows × 5 cols = 50 params)
- Use `INSERT OR REPLACE INTO ... VALUES (?,?,?,?,?), (?,?,?,...)`  multi-row INSERT
- Must use `{"sql": "...", "params": [...]}` single object — NOT a JSON array
- `version: 1` in peers.json has no relevance here; D1 has its own schema versioning

### DB file: always `oracle-master.db` (24k docs), NOT `oracle.db` (9k legacy) — PRODUCTION ONLY

**NEVER set `oracle-master.db` in `src/const.ts`** — this breaks 100+ unit tests. Instead:
- `src/const.ts` stays as `ORACLE_DB_FILE = 'oracle.db'` (default for tests)
- Production server start: `ORACLE_DB_FILE=oracle-master.db ORACLE_VECTOR_ENABLED=1 bun src/server.ts`
- The running production server (PID on port 47778) is started with the env var, not via const.ts

`curl -s http://127.0.0.1:47778/api/stats | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('database'))"` — must show `oracle-master.db`.

---

## 1. High-Level Architecture Overview

```
                          ┌──────────────────────────┐
                          │   MCP Clients / Agents   │
                          └─────────────┬────────────┘
                                        │ (MCP Protocol / JSON-RPC)
                                        ▼
                          ┌──────────────────────────┐
                          │  MCP Server / Tool Reg  │
                          │     (src/index.ts)       │
                          └─────────────┬────────────┘
                                        │
┌──────────────────────────┐            │             ┌──────────────────────────┐
│   Studio / Web Clients   │            │             │ External Vector Services │
└─────────────┬────────────┘            │             │  (Cloudflare Vectorize)  │
              │ (HTTP / REST)           │             └────────────▲─────────────┘
              ▼                         ▼                          │
┌────────────────────────────────────────────────────┐             │ (REST / Proxy)
│         Elysia HTTP Server (src/server.ts)         │─────────────┤
├────────────────────────────────────────────────────┤             │
│ Server Plugin Loader & Registry                    │             │
│  ├── Built-in Plugins (health, search, vector...)  │             │
│  └── Gateway & Federation                          │             │
└─────────────┬──────────────────────────────────────┘             │
              │                                                    │
               ┌──────────────┴──────────────┐                     │
               ▼                             ▼                     │
┌──────────────────────────────┐ ┌──────────────────────┐          │
│    Hybrid Search Pipeline    │ │ Vector Store Factory │──────────┘
│   (FTS5 MATCH + Vector RRF)  │ │ (LanceDB, Qdrant, CF)│
└──────────────┬───────────────┘ └──────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  SQLite DB / Drizzle Schema  │
│  - oracle_documents          │
│  - oracle_fts (Virtual Table)│
│  - indexing_jobs             │
│  - trace_log, forum_*, etc.  │
└──────────────────────────────┘
```

---

## 2. Core Server & Plugin System (`src/server.ts`, `src/server/plugin/`)

- **Elysia Framework**: Bun-native HTTP framework with OpenAPI/Swagger auto-doc generation at `/swagger`.
- **Plugin Loader (`loader.ts` & `builtin.ts`)**:
  - Modular server plugins (`ServerPlugin` interface) categorized into `core`, `standard`, and `extra` tiers.
  - Controls lifecycle (`start`, `stop`) and automatically seeds studio menu items (`menuSeedRoutes`).
  - Supports environment overrides (`ORACLE_DISABLED_PLUGINS`, `ORACLE_ENABLED_PLUGINS`).
- **Private Network Access (PNA) & CORS**:
  - Explicit PNA middleware intercepts `OPTIONS` requests requesting `access-control-request-private-network: true` for local-host browser communication.

---

## 3. Storage Layer & Database Schema (`src/db/schema.ts`)

- **Drizzle ORM + SQLite + Cloudflare D1**:
  - `oracle_documents`: Main metadata store (id, type, sourceFile, concepts, project, supersededBy/supersededAt/supersededReason). Synced to Cloudflare D1 `oracle_knowledge_d1` (24,385 docs) for 24/7 Edge Failover.
  - `oracle_fts`: FTS5 virtual table managed via raw SQL (`sqlite.prepare()`) since Drizzle doesn't support virtual tables natively. **FTS5 Pitfall**: Virtual tables lack standard B-tree indexes on `id`. Correlated subqueries (`WHERE NOT EXISTS (SELECT 1 FROM oracle_fts f WHERE f.id = d.id)`) do full scans per row (O(N²) = 595M comparisons for 24.3k docs, taking 7+ min and spiking CPU/load to 15+). Always use `LEFT JOIN (SELECT id FROM oracle_fts) f ON f.id = d.id WHERE f.id IS NULL` (0.25s, 1,700x faster).
  - `indexing_jobs`: Async queue table mapping documents to vector models (`doc_id`, `model_key`, `collection`, `status`).
  - `search_log`, `learn_log`, `document_access`: Audit and operational analytics (`learn_log` synced to D1).
  - `trace_log`: Session discovery traces with hierarchical parent-child relationships and dig points.
  - `forum_threads`, `forum_messages`, `activity_log`: Threaded discussions and agent coordination activity logs (synced to D1 for 24/7 cross-fleet visibility).

---

## 4. Hybrid Search & Ranking (`src/server/handlers.ts`)

`handleSearch(query, type, limit, offset, mode, project, cwd, model)` runs a multi-stage search strategy:

1. **FTS5 Keyword Leg**:
   - `buildFtsQuery(query)` tokenizes natural language into unicode terms and formats them into an `OR` query.
   - Converts raw negative FTS5 ranks to bounded scores: `normalizeRank(rank) = 1 / (1 + |rank|)`.
2. **Vector Semantic Leg**:
   - Executes locally via `localVectorOperations` or proxies to remote vector services via `createVectorProxy(VECTOR_URL)`.
   - Converts cosine distance to similarity: `1 - (distance / 2)`.
3. **Rank-Fusion Hybrid Combination (`combineSearchResults`)**:
   - Blends weighted normalized scores and reciprocal ranks (`1 / (rank + 1)`).
   - Boosts overlapping document hits: `score = score_fts + score_vector + 0.12`.
   - **SQLite & Cloudflare D1 Content Hydration Step**: If remote vector search returns matching document IDs without document text or metadata (e.g. from CF Vectorize), `searchOneModel()` in `src/server/vector-operations.ts` and `vectorSearch()` in `src/tools/search.ts` query local SQLite `oracle_fts` / `oracle_documents` via `ctx.sqlite`. If local SQLite returns missing content (or if maclab is offline), it fails over to query Cloudflare D1 (`oracle_knowledge_d1`) over HTTP REST API to populate `content`, `source_file`, and `type` before rank fusion.
   - **Safe ID Matching**: Cloudflare Vectorize truncates/hashes long document IDs (e.g. `resonance___memory_...`). The hydration step uses prefix pattern matching (`cleanPrefix%` / `___` to `_%` substitution) to resolve safe_ids back to original SQLite/D1 document records.

---

## 5. Vector Storage & Embedding Adapters (`src/vector/`)

- **Factory Pattern (`factory.ts`)**:
  - Supports dynamic provider/adapter selection via `ORACLE_VECTOR_DB` and `ORACLE_EMBEDDING_PROVIDER`.
  - Multi-model registry supporting `bge-m3` (default multilingual 1024d), `nomic`, and `qwen3`.
- **Adapters Available**:
  - `LanceDBAdapter` (`lancedb.ts`): Local embedded vector store.
  - `SqliteVecAdapter` (`sqlite-vec.ts`): SQLite extension vector store.
  - `QdrantAdapter` (`qdrant.ts`): Qdrant REST client.
  - `CloudflareVectorizeAdapter` (`cloudflare-vectorize.ts`): Cloudflare Vectorize REST API adapter supporting dual auth headers (`X-Auth-Email`/`X-Auth-Key` for Global Keys `cfk_*` or `Authorization: Bearer` for tokens `cfat_*`).
  - `ChromaMcpAdapter` (`chroma-mcp.ts`): ChromaDB via Python sub-process.
