# Arra Oracle v3 Alpha Migration & Auth Fixes (2026-08-12)

## 1. Cloudflare Dual Auth & Phantom Collection Triage (Error 7000 Fix)

### Symptoms
- `/api/stats` shows `vector.enabled: true` and `vector.count > 0` (or `vector.registered_collections > 1`), but logs report:
  `[CF Vectorize] error: code 7000`
- Search queries return `sources: {'fts': 4}` instead of `sources: {'vector': 4}` (vector search silent fallback).

### Root Causes
1. **Auth Header Mismatch**:
   - Cloudflare Global Keys (`cfk_*`) require `X-Auth-Email` and `X-Auth-Key` headers.
   - Using `Authorization: Bearer cfk_*` causes Cloudflare API gateway to return `HTTP 400 Bad Request` with error code `7000` (Authentication error).
   - Bearer auth (`Authorization: Bearer <token>`) is ONLY for API Tokens (`cfat_*`).

2. **Phantom Collections**:
   - Config files like `vector-server.json` or `config.json` registering collections pointing to non-existent Cloudflare Vectorize indexes (or non-CF model names) trigger HTTP 404 errors, causing the vector search loop to drop vector scores and fall back to FTS.

### Fix Procedure
- Ensure `src/vector/adapters/cloudflare-vectorize.ts` checks token prefix:
  ```ts
  const isGlobalKey = token.startsWith('cfk_') || token.length > 50;
  const headers = isGlobalKey 
    ? { 'X-Auth-Email': email, 'X-Auth-Key': token }
    : { 'Authorization': `Bearer ${token}` };
  ```
- Remove phantom collections from `vector-server.json` so `registered_collections: 1` matches the live CF Vectorize index (`oracle_knowledge_bge_m3`).

---

## 2. Decoupled Runtime Directory for Server Stability

### Problem
When peer agents (e.g. No.1) pull, rebase, or checkout experimental branches (such as `alpha`) in the main repo (`/Users/admin/Code/github.com/MEYD-605/arra-oracle-v3`), running the production HTTP server directly out of the working tree risks crashing the server when uncommitted changes or stricter environment validation rules land.

### Solution Pattern
Maintain a decoupled runtime copy for the active daemon:
```
/Users/admin/.arra-oracle-v2/runtime/  <- Detached/pinned clean build for live server (port 47778)
/Users/admin/Code/github.com/MEYD-605/arra-oracle-v3/ <- Active dev working tree for No.1 / git ops
```
Start script (`start-oracle-http.sh`) points to `RUNTIME_DIR=~/.arra-oracle-v2/runtime`.
Peer agents can reset, merge, or rebase `arra-oracle-v3` freely without taking down the fleet's memory server.

---

## 2.1. Cloudflare Vectorize ID Truncation & Content Hydration Bug (2026-08-12)

### Symptoms
- `api/v1/search` in `mode=hybrid` returns `sources: {'vector': N}` with `warning: NONE`, but search results returned from vector source have `content: ""` (0 characters), while hybrid hits carry full content.

### Root Causes
1. **Missing Document Metadata in Vector Index**: CF Vectorize metadata only stores `orig_id` and `type` (no `document` field). `cloudflare-vectorize.ts` maps `m.metadata?.document || ''`, yielding `""`.
2. **SQLite Hydration Select Omission**: When hydrating vector results from local SQLite (`oracle_documents`), if the query only selects `{ id, project }` without selecting `content`, `vectorRows.documents?.[i]` remains `""`.
3. **CF Vectorize 64-byte ID Truncation & API Hard Limit (`safe_id` / Error 40008)**: 
   - Cloudflare Vectorize API strictly rejects document IDs > 64 bytes (`error 40008: "id too long; max is 64 bytes, got N bytes"`).
   - During indexing, long document IDs must be converted into a truncated `safe_id` (e.g. `learning_2026-08-03_cloudflare-auth-is-n_1232313b`) capped at <= 64 bytes.
   - Lookups using raw IDs > 64 bytes directly against CF Vectorize endpoints (`/get_by_ids`) fail with HTTP 400 (Error 40008), while exact ID lookups against SQLite fail unless mapped back via reverse lookup or prefix match.

### Verification Procedure
```bash
# Direct API check showing missing document metadata in CF Vectorize:
curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/vectorize/v2/indexes/oracle_knowledge_bge_m3/get_by_ids" \
  -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "content-type: application/json" \
  -d '{"ids":["resonance___memory_wisdom_archive_SYSTEM_9ed7e4d1"]}'
# -> Returns metadata with orig_id & type ONLY (no document field)

# Vector search returns empty content for truncated safe_id or missing hydration select:
curl -s "http://127.0.0.1:47778/api/v1/search?q=cloudflare%20auth&limit=5" | python3 -c "
import sys, json
r = json.load(sys.stdin).get('results', [])
for x in r:
    print(x.get('source'), len(x.get('content') or ''), x.get('id'))
"

# But SQLite FTS actually holds full content:
sqlite3 ~/.arra-oracle-v2/oracle-master.db "select id, length(content) from oracle_fts where id like 'learning_2026-08-03_cloudflare-auth%';"
```

### Fix Pattern
1. Ensure SQLite hydration in `src/server/vector-operations.ts` selects `content` alongside `id` and `project`:
   ```ts
   db.select({ id: oracleDocuments.id, project: oracleDocuments.project, content: oracleDocuments.content })
   ```
2. Map `safe_id` back to original full ID before querying SQLite/D1.
3. **Adapter-Layer `safe_id` Truncation (Commit `9f7262b5`)**: Rather than mutating SQLite primary keys (which would require migrating 50,796+ foreign key rows in `document_access`), implement `safeId()` in `cloudflare-vectorize.ts` adapter at the CF submission boundary:
   ```ts
   // Prefix (55 bytes) + '_' + SHA256(id).slice(0, 8) = 64 bytes max
   const safeId = (id: string): string => {
     const bytes = Buffer.byteLength(id, 'utf8');
     if (bytes <= 64) return id;
     const hash = crypto.createHash('sha256').update(id).digest('hex').slice(0, 8);
     return `${id.slice(0, 55)}_${hash}`;
   };
   ```
4. **Complete 5-Commit Vector Search Resolution Chain (2026-08-12)**:
   - `cadfa407`: CF Auth Headers (`cfk_*` vs `cfat_*` fix)
   - `ac37bf47`: topK clamp (`topK <= 50` when `returnMetadata='all'`)
   - `33ef8d6b` / `a2b8551b`: SQLite hydration select `content` fix
   - `f57d949f`: safe_id reverse lookup & prefix fallback pattern
   - `9f7262b5`: Adapter-layer `safe_id` sha256 hash fix on write path

---

## 2.2. ID Truncation Root Cause & Quantified Impact (2026-08-12)

### Root Cause
In `src/learn/markdown.ts:30`:
`slug = normalizeLearningPattern(pattern).substring(0, 50)...`

ID construction formula:
```
learning_  =  9 bytes
YYYY-MM-DD = 10 bytes
_          =  1 byte
slug       = 50 bytes (max)
───────────────────────
Total      = 70 bytes  (Exceeds Cloudflare Vectorize limit of 64 bytes by 6 bytes)
```
To guarantee IDs stay within Cloudflare Vectorize's 64-byte cap without truncation, `slug` must be capped at **<= 44 bytes** (`.substring(0, 44)`).

### Quantified DB Impact & safe_id Indexing Gap
- **Total Oracle Documents**: 24,387
- **Documents exceeding 64 bytes**: 17,321 (71.0% of total database) — *Note*: character-based counting (`length()`) gave 16,962, but 17,704 docs (72%) contain non-ASCII characters like `ψ` (2 UTF-8 bytes each), bringing byte-counted limit violations to 17,321.
  - `learning_%`: 9,367 out of 11,515 docs exceed 64 bytes
  - `resonance_%`: 7,595 out of 11,619 docs exceed 64 bytes
  - `retro_%`: 0 out of 1,252 docs exceed 64 bytes (shorter titles stay within limit)
- **UTF-8 Byte vs Character Length Trap**: Cloudflare Vectorize limits IDs to 64 **bytes**, not 64 characters. Truncating with `substring(0, 50)` on strings containing UTF-8 non-ASCII characters (e.g., `ψ` in `resonance_ψ/memory/...`) will still exceed 64 bytes. Always measure and slice using byte length (e.g., `Buffer.byteLength(str)` in JS/Node/Bun) with a byte-trimming loop.
- **Vector Count vs Document Count Distinctions**:
  - Remote CF Vectorize index contains 26,374 vectors, which exceeds total `oracle_documents` (24,387).
  - This proves legacy indexing created `safe_id` vectors (e.g. `resonance___memory_wisdom_archive_SYSTEM_9ed7e4d1` at 48 chars).
  - **Critical Code Asymmetry Trap**: `safe_id` resolution logic exists on the READ/hydration path (`src/tools/search/vector.ts` & `src/server/vector-operations.ts`), but current `cloudflare-vectorize.ts` adapter lacks safe_id truncation on the WRITE/index path. As a result, NEW writes exceeding 64 bytes fail at the CF API boundary with `error 40008` unless truncated before submission.
  - **Triage Discipline**: Never claim "all 16k docs failed indexing" without checking remote `vector.count`. When `vector.count` > doc count, legacy `safe_id` records exist, but write-side code must be audited for missing truncation.

---

## 2.3. Cloudflare Vectorize Write Propagation Delay & Deferred Verification (2026-08-12)

### Symptoms & Live Measurement
When upserting vectors to Cloudflare Vectorize via the REST API (`/upsert`), the response returns `{"success": true, "mutationId": "..."}` immediately. However, an immediate read-back via `get_by_ids` returns empty:
- **12 seconds post-upsert**: `get_by_ids` returns `{"result": []}` (appears as if upsert failed or dropped data).
- **57 seconds post-upsert**: `get_by_ids` returns the full vector array + metadata.

### Operational Trap & Impact
Verifying vector presence immediately after each upsert batch during bulk re-indexing (such as backfilling the 17,324 docs exceeding 64 bytes) causes false-failure reports, triggering unnecessary retries or leading engineers to conclude that the `safe_id` fix or API call failed.

### Recommended Pattern: Deferred Verification
1. Do NOT sleep for 60 seconds between individual batch calls.
2. Execute all batch upserts sequentially, recording each returned `mutationId`.
3. Allow a single ≥60-second propagation window after all batches complete.
4. Execute sampling verification using `get_by_ids` across the generated `safe_id` list.
5. Full runbook and query scripts are archived at `~/.arra-oracle-v2/REINDEX-RUNBOOK.md`.

---

## 3. Arra Oracle v3 Alpha (PR #2928 / CalVer 26.7.26-alpha.227) Key Features

- **File Count**: 810 TS files (vs 339 TS files in legacy runtime).
- **Unified CLI**: `src/cli/` with commands (`mine`, `export`, `backup`, `canvas-serve`, `vector-config`).
- **HTTP-Proxy MCP Layer**: `src/mcp/http-proxy.ts`, `http-auth.ts`, `http-policy.ts` for tenant isolation and vector health monitoring (`vector-health.ts`).
- **Edge Worker Consolidation**: `src/workers/sleep-consolidation.ts`, `memory-consolidation.ts` for background memory summarization on idle.
- **Search Architecture**: Modular `src/search/` containing bitemporal indexing, entity ranking, and pointer hydration.
---

## 4. Cloudflare Vectorize topK Limit (Error Code 40025)

### Symptoms
- Vector search returns `sources: {'fts': 3}` with warning:
  `Vectorize API error (400): {"result":null,"result_info":null,"success":false,"errors":[{"code":40025,"message":"with returnValues=true or returnMetadata=all, max top K is 50, but got 100; for a top K up to 100, retry with returnValues=false and returnMetadata=indexed"}]}`

### Root Cause
- In `src/vector/adapters/cloudflare-vectorize.ts`:
  - `query()` method passes `topK: limit` (which can be up to 100) along with `returnMetadata: 'all'`.
  - Cloudflare Vectorize API strictly caps `topK` to **max 50** when `returnMetadata` is set to `'all'`.
  - Another site in `cloudflare-vectorize.ts` passes `topK: nResults + 1` with `returnMetadata: 'all'`.

### Fix Procedure & Verification
- Clamp `topK` to max 50 when using `returnMetadata: 'all'`:
  ```ts
  topK: Math.min(limit, 50),
  returnMetadata: 'all',
  ```
- Alternatively, if `topK > 50` is required, switch `returnMetadata` to `'indexed'` (provided all required metadata fields are indexed in Cloudflare Vectorize).
- Verified in `arra-oracle-v3` commits `cadfa407` & `ac37bf47` by No.1 with unit test `src/vector/adapters/cloudflare-auth-headers.test.ts` (4 pass, 0 fail).

---

## 6. Vector Test Suite & LanceDB Optional Native Binding Caveat

### Symptoms
- Running `bun test src/vector/` shows 61 pass, 9 skip, 15 fail.
- All 15 fails throw: `Error: Cannot find native binding ... @lancedb/lancedb/dist/native.js:644`.

### Root Cause & Triage
- Missing platform-specific optional dependency (e.g. `@lancedb/lancedb-darwin-x64` missing in `node_modules/@lancedb/` on x86_64 macOS).
- Tests for `LanceDBAdapter`, `LanceDB+Ollama`, and `EmbeddingProvider (ollama)` fail at binding initialization.
- **Production Impact**: Zero. `vector-server.json` uses provider `cloudflare-ai` (`bge-m3`), not LanceDB. LanceDB is only a default fallback in `config.ts:148` if no adapter is specified.
- **Action**: Treat as an environment dependency issue, not a code regression. Run `bun install` if full LanceDB test coverage is required for CI.

---

## 5. Gateway Config Verification & Session Isolation Reload

### Pattern
When setting `group_sessions_per_user: false` across multiple Hermes seats:
1. Verify via Python config loader script (`fleet-verify-gspu.py`) importing `load_gateway_config()` to confirm schema resolution before/after.
2. Restart gateway daemons via `launchctl kickstart -k` (or script running outside Hermes sandbox).
3. Post-restart, re-verify active Gateway PID change and check `RESOLVED -> ADAPTER -> VERDICT` for all seats.


