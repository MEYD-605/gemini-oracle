# Operating & diagnosing Arra on maclab (verified 2026-08-03)

Live instance: `http://127.0.0.1:47778` (LOCAL maclab, **not** ai-core `100.81.0.110`).
DB: `~/.arra-oracle-v2/oracle-master.db` (~258 MB, SQLite/Drizzle).

## CF Vectorize count = 0 vs Bulk Lock vs 64-byte ID limit (verified 2026-08-09)

When checking `/api/vector/stats` or `CF query` and seeing `matches: 0` / `count: 0`:
- **`vector.count: 0` / `matches: 0` root cause:**
  1. **64-byte ID Limit on CF Vectorize:** Cloudflare Vectorize strictly rejects any vector document ID > 64 bytes (`error 40008: id too long; max is 64 bytes, got N bytes`). Non-ASCII or long path-based/generated IDs in `oracle_documents` caused batch upserting to fail with HTTP 400 for the entire batch.
  2. **Bulk Lock (`cf-bulk.lock.json`):** Set to lock bulk re-indexing to avoid quota burns, which prevented auto-backfilling of vectors when IDs failed or expired.
- **Fix / Safe ID mapping:** When upserting vectors to CF Vectorize, sanitize (ASCII alphanum/underscores only) and truncate raw IDs > 50 bytes with an MD5 hash suffix:
  `safe_id = f"{re.sub(r'[^a-zA-Z0-9_-]', '_', str(raw_id))[:40]}_{hashlib.md5(raw_id.encode('utf-8')).hexdigest()[:8]}"`
- **Paid CF Plan ($5/mo) verification & Quota:** CF Workers Paid tier ($5/mo) provides:
  - 10,000 Workers AI embedding requests/day (`bge-m3`) — full sync of 24k+ docs in 50-doc batches consumes ~488 requests (only ~5% of daily quota).
  - 5,000,000 vectors in Vectorize (1024d) — easily accommodates fleet's 24k+ docs (< 0.5% capacity).
  - 30,000,000 queries/month.
  - Verified via Subscriptions API: `Workers Paid | Price: 5 USD` under `Ai.no.1bro@gmail.com's Account`.
  - Re-indexing is a one-time operation to backfill historical docs; normal operation uses real-time incremental single-doc `arra_learn` embeddings.
- **False Alarm / Token Expiry Myth & Dual Auth Header Pitfall (verified 2026-08-12):** Remote agents (like no.3) may report "CF API token expired / index deleted (error 40027 or 401)".
  - **Global Key Header Requirement:** When using Cloudflare Global API Key (`CLOUDFLARE_AUTH_MODE=global_key`, key starts with `cfk_*`), Cloudflare API requires `X-Auth-Email: <email>` and `X-Auth-Key: <key>`. Using `Authorization: Bearer cfk_*` results in `HTTP 401 code 10000 Authentication error`.
  - **Adapter Hardcoding Gotcha:** In `src/vector/adapters/cloudflare-vectorize.ts`, check all 6 API call sites (`get_by_ids`, `query`, `upsert`, `delete`, `info`, `stats`). If hardcoded as `Authorization: Bearer ${this.apiToken}`, global key mode fails. Helper function:
    ```typescript
    function getCloudflareHeaders(apiToken: string, email?: string, mode?: string) {
      if (mode === 'global_key' || apiToken.startsWith('cfk_')) {
        return { 'X-Auth-Email': email || '', 'X-Auth-Key': apiToken };
      }
      return { 'Authorization': `Bearer ${apiToken}` };
    }
    ```
- **Peer Agent Repo Update, Worktree Isolation & In-Memory Safety (verified 2026-08-12):** When a peer agent (e.g. No.1) performs `git fetch`/`reset`/branch switches on `arra-oracle-v3`:
  - **In-memory safety:** A running Bun/Node process (`bun src/server.ts` on port 47778) keeps executing the in-memory compiled JS until restarted.
  - **Detached Worktree Runtime Isolation:** To prevent live server crashes during peer git operations or branch switches, run the live server out of a detached git worktree at `~/.arra-oracle-v2/runtime` pinned to a stable commit (`fd3a073f`). This keeps the server running independently of changes in `~/Code/github.com/MEYD-605/arra-oracle-v3`.
  - **Disk wipe risk:** `git reset --hard` or `git pull` from peer wipes uncommitted local patches on disk.
  - **No Job Steal protocol:** Do NOT fight or re-apply uncommitted disk patches over a peer's active git operation. Store the patch/diff outside the repo (e.g. `~/.arra-oracle-v2/patches/`), document the root cause, and forward to the peer via `maw hey` so they can integrate and commit cleanly.
- **Cloudflare Workers AI Error 7000 Disambiguation (Auth vs Model Name) (verified 2026-08-12):**
  - CF Workers AI surfaces error code 7000 ("No route for that URI") for both auth failures and invalid model IDs.
  - **Dual root causes:**
    1. *Auth mismatch:* Global API Keys (`cfk_*`) used with `Authorization: Bearer` fail with HTTP 401 code 10000 -> wrapped as code 7000. Requires `X-Auth-Email` + `X-Auth-Key`.
    2. *Invalid model ID:* `vector-server.json` referencing Ollama tags (`nomic-embed-text`, `qwen3-embedding`) fails with HTTP 400 code 7000 on CF Workers AI. Valid CF Workers AI models use `@cf/baai/bge-m3` format.
  - **Disambiguation Technique:** Curl the CF `/ai/run` REST endpoint holding auth headers constant while testing `@cf/baai/bge-m3` (200 OK) vs suspect model tag (400 code 7000). If `@cf/baai/bge-m3` succeeds, auth headers are correct and the model identifier in config is invalid.
- **Upstream Code Lineage Verification:** Downstream repos (e.g., `phd-citation-oracle`) may claim to have mirrored fixes from upstream (`arra-oracle-v3`), but always verify via `git log -S <symbol>` in the upstream repo before assuming the fix exists upstream.
- **Fix for remote agents (no.3, no10, etc.):** Ensure `CLOUDFLARE_AUTH_MODE=global_key` is exported in the seat's `.cloudflare.env`. Do **NOT** rotate CF tokens or request new permissions from Bo.
- **Realtime learn vs Bulk sync:** `/api/learn` writes FTS5 + Markdown immediately. Vector embedding should be batched safely or background-synced using the `safe_id` wrapper (`sync_all_vectors.py`).

- **Similar (by doc ID) endpoint fix & get_by_ids spec (verified 2026-08-09):**
  - REST API endpoint for Cloudflare Vectorize v2 nearest-neighbor lookup by ID is **`/get_by_ids`** (snake_case). The legacy `/getByIds` path returns HTTP 404.
  - Document IDs must pass through `safeId(raw_id)` MD5 sanitization (max 50 chars, ASCII alphanum/underscores + `_hash[:8]`) in TypeScript using `crypto.createHash('md5')` to match Python sync scripts.
  - Verified working via `GET /api/similar?id=<doc_id>` across maclab, no.3 HighClass (`natz-ai-03`), and no.10 X (`black`).

## Hybrid / Vector Search Content Hydration Fix (verified 2026-08-10)

- **Symptom:** Remote vector search / hybrid search (`/api/search?q=...&mode=hybrid`) returns valid vector match `id` and `score` > 0, but `content: ""` and `source_file: ""`.
- **Root cause 1:** Cloudflare Vectorize returns only `id`, `score`, and minimal metadata. `vectorSearch()` in `src/tools/search.ts` originally relied on `results.documents[i]`, which is empty when querying Vectorize.
- **Root cause 1b (server-level `searchOneModel`):** In `src/server/vector-operations.ts`, `searchOneModel()` selected only `{ id: oracleDocuments.id, project: oracleDocuments.project }` from `oracleDocuments` DB and passed `vectorRows.documents?.[i] || ''` as `content`. Since Cloudflare Vectorize does not return `documents`, semantic/vector search returned score > 0 with `content: ""` and `source_file: ""`.
- **Root cause 2 (safe_id mismatch & truncation):** `doc.id` in SQLite contains slashes/non-ASCII (e.g. `resonance_ψ/memory/...`), but Cloudflare Vectorize truncates and hashes IDs > 50 chars via `safeId()` (e.g. `resonance___memory_wisdom_archive_ORACLE_766a3620`). Exact SQL `WHERE f.id = docId` lookup failed because `safe_id` did not match raw SQLite `id`.
- **Root cause 3 (ORACLE_DB_FILE & ORACLE_VECTOR_ENABLED defaults):** `ORACLE_DB_FILE` in `src/const.ts` defaulted to `oracle.db` (9k docs) instead of `oracle-master.db` (24k docs), and `generateDefaultConfig()` set `enabled: false` by default, causing vector search to quietly fall back to local FTS-only mode.
- **Fix:** 
  1. In `src/const.ts`: Update `ORACLE_DB_FILE` to `'oracle-master.db'`.
  2. Start server with `ORACLE_VECTOR_ENABLED=1` environment variable.
  3. In `src/vector/adapters/cloudflare-vectorize.ts`: Save `original_id: doc.id` in vector metadata on upsert, and return `original_id` from `query()`.
  4. In `src/server/vector-operations.ts` (`searchOneModel`): Batch hydrate `content` and `source_file` from `oracle_fts` / `oracle_documents` using SQLite `$client.prepare()`, including a prefix fallback match (`cleanPrefix%` stripping the 8-char MD5 hash and replacing `___` with `%`) for safe_ids. Also added Cloudflare D1 Cloud Failover REST API query (`oracle_knowledge_d1`) if local SQLite returns missing content or when offline.
  5. In `src/tools/search.ts`: Perform SQLite fallback lookup using `ctx.sqlite` with prefix pattern matching if exact match fails.
  ```typescript
  // In searchOneModel (src/server/vector-operations.ts):
  const ftsRows = sqlite.prepare(
    `SELECT id, content FROM oracle_fts WHERE id IN (${placeholders})`
  ).all(...vectorRows.ids);

  // Fallback for safe_id (prefix match)
  for (const missingId of missingIds) {
    const cleanPrefix = missingId.replace(/_[a-f0-9]{8}$/, '');
    const pathPattern = cleanPrefix.replace(/___/g, '_%').replace(/__/g, '%');
    const fallbackRow = sqlite.prepare(
      `SELECT id, content FROM oracle_fts WHERE id LIKE ? LIMIT 1`
    ).get(`${pathPattern}%`);
    if (fallbackRow) contentMap.set(missingId, fallbackRow.content);
  }
  ```
- **Verification:** Test via `curl -s "http://127.0.0.1:47778/api/search?q=...&mode=hybrid&limit=1"`. Both `content` (first 500 chars) and `source_file` must populate correctly. Also verify from remote nodes like `no.3` (`natz-ai-03`) via `python3 /root/.hermes-highclass/arra_search.py search '<query>'`.

## Cloudflare D1 24/7 Multi-Node Edge Architecture & Shared Forum (verified 2026-08-10)

To ensure **no agent in the fleet (no.3, no.10, note20, no.4) is dependent on maclab being online**, the shared brain uses a 2-tier Cloud Architecture:

- **Vector Tier**: Cloudflare Vectorize (`oracle_knowledge_bge_m3`, 1024d, 26,374 vectors).
- **Document & Central Forum Tier**: Cloudflare D1 (`oracle_knowledge_d1`, UUID `84ece9ec-bb38-409f-bdbc-fbf6cf6315e2`, 24,385 documents).
  - Includes `oracle_documents` (24,385 docs).
  - Includes P'Nat's central coordination & communication tables: `forum_threads`, `forum_messages`, `learn_log`, and `activity_log` for 24/7 agent status tracking.
- **Execution Flow**:
  1. Agent sends query -> Cloudflare Vectorize returns matching `IDs` + similarity scores.
  2. Agent/Server checks local SQLite `oracle_fts`. If local DB is unavailable (maclab offline/sold), it queries Cloudflare D1 over HTTP REST API (`https://api.cloudflare.com/client/v4/accounts/{acct}/d1/database/{dbId}/query`).
  3. Returns hydrated content & source files 24/7 without needing maclab running.
- **Bulk Import to D1**: Uses Wrangler multi-query SQL import:
  `CLOUDFLARE_EMAIL="..." CLOUDFLARE_API_KEY="..." npx wrangler d1 execute oracle_knowledge_d1 --remote --file=/tmp/oracle_d1_dump.sql` (imports 24k+ queries in ~2 seconds).

## `maw hey` Cross-Node Federation Setup & Troubleshooting (verified 2026-08-10)

When configuring cross-node communication via `maw hey`:
1. **`maw.config.json` configuration**: Both nodes MUST define `node`, `federationToken` ("soul-brews-oracle-2026"), `namedPeers`, and `agents` map so `maw locate <agent>` and routing can resolve:
   ```json
   {
     "node": "natz-ai-03",
     "federationToken": "soul-brews-oracle-2026",
     "namedPeers": {
       "maclab": "http://100.83.0.1:3456"
     },
     "agents": {
       "03-highclass": {
         "repo": "/home/meyd/Code/github.com/MEYD-605/highclass-oracle",
         "session": "highclass-tui"
       }
     }
   }
   ```
2. **User Ownership & Key Consistency**: `maw serve` and `maw hey` CLI commands MUST run under the SAME user (e.g. `meyd`). If `maw serve` runs under `root` and CLI under `meyd`, the `peer-key` location mismatches (`/root/.maw/peer-key` vs `/home/meyd/.maw/peer-key`), causing `401: signature mismatch` or `401: refuse-missing-peer-key`. Ensure `/home/meyd/.maw/peer-key` matches the key exported by the server.
3. **Public Key Pairing (`peers.json`)**:
   - Verify pubkeys match: `cat ~/.maw/peer-key` on node A must match `pubkey` under node A's entry in node B's `~/.maw/peers.json`.
   - Ensure `"version": 1` is set in `~/.maw/peers.json`.
   - Re-pair using: `maw peers remove <node>` then `maw peers add <node> <url>`.
   - Bounce `maw serve` service after modifying `peers.json` so pubkeys reload into memory.
4. **Hermes Gateway & Headless vs TUI Mode**:
   - `hermes gateway run` via systemd runs as a headless background daemon. While `maw hey` messages can be delivered to the agent's inbox, they cannot inject directly into an active terminal pane unless a `tmux` TUI session (e.g. `tmux new-session -d -s "highclass-tui" "hermes chat --tui"`) is running for that agent.
   - For 24/7 TUI pane injection, run a systemd unit (`highclass-tui.service`) executing `tmux new-session -d -s "highclass-tui" "hermes chat"` as user `meyd` with `HERMES_HOME=/home/meyd/.hermes-highclass`.
   - Ensure `highclass-gateway.service` and `maw-serve.service` run consistently as user `meyd` with `HERMES_HOME=/home/meyd/.hermes-highclass` to prevent permission errors.

## Origin & Evolution of Arra Oracle v3 (verified 2026-08-09)

- **Upstream Origin:** `https://github.com/Soul-Brews-Studio/arra-oracle-v3.git` created and architected by P'Nat (`nazt_`) and Soul-Brews-Studio.
- **Original Code Pattern:** `cloudflare-vectorize.ts` adapter ported from `laris-co/webhook-relay` (`src/vectorize.ts`) REST API pattern to migrate Oracle knowledge base from local LanceDB/ChromaDB to Cloudflare Vectorize + Workers AI (`@cf/baai/bge-m3`, 1024d) for multi-node fleet sharing.
- **Fleet Maintenance Responsibilities:** P'Nat/Soul-Brews-Studio provided the blueprint, REST API endpoints, and model architecture. Fleet agents maintain node setup, global_key auth, ID sanitization (`safe_id`), and vector sync pipelines.

## Cloudflare $5/mo Quota Optimization & Offsite Backup / Workers AI Stack (verified 2026-08-09)

The $5/mo Workers Paid plan includes unused capabilities that should be leveraged:
- **Cloudflare R2 Offsite Backup (10 GB free):**
  - Use Python script (`backup_r2.py`) to compress `oracle-master.db` via `gzip` and upload to R2 bucket `oracle-backups` via REST PUT with `Content-Length` header.
  - Endpoint: `https://api.cloudflare.com/client/v4/accounts/{acct}/r2/buckets/{bucket}/objects/{key}`.
  - Auth: `X-Auth-Email` + `X-Auth-Key`.
- **Cloudflare Workers AI CLI (`cf-ai`):**
  - Script at `/usr/local/bin/cf-ai` exposes Workers AI models for zero extra cost:
    - `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (`cf-ai "prompt" -m llama`)
    - `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` (`cf-ai "prompt" -m deepseek`)
    - `@cf/meta/llama-3.2-11b-vision-instruct` (`cf-ai "prompt" -m vision`)
  - Can be used as fallback LLM/reasoning endpoints when 9router/OpenRouter is down.

## CalVer & Cloudflare Credentials

- **CalVer scheme**: `v{yy}.{m}.{d}[-(alpha|beta).{HMM}]`. Version bump script at `scripts/calver.ts`. Invoking `bun scripts/calver.ts` without flags bumps `package.json` directly (do NOT pass `--apply` which will return `unknown arg: --apply`). Note: `calver.ts` uses `--check` for dry-run.
- **Cloudflare Creds & Service Restart**: Credentials live in `~/.cloudflare.env` (`CLOUDFLARE_API_TOKEN=cfk_...`, `CLOUDFLARE_EMAIL`, `CLOUDFLARE_AUTH_MODE=global_key`). When restarting the server directly, pass `export CLOUDFLARE_API_KEY="$CLOUDFLARE_API_TOKEN"` if using global key mode.

## API surface — routes are GET with query params, not POST

```bash
curl -s http://127.0.0.1:47778/api/stats                                  # works
curl -s "http://127.0.0.1:47778/api/search?q=<terms>&limit=3"             # works
curl -s -X POST http://127.0.0.1:47778/api/search -d '{"query":"..."}'    # {"error":"Not found"}
curl -s http://127.0.0.1:47778/api                                        # {"error":"Not found"} — no index route
```

`{"error":"Not found"}` from this server means **wrong route/verb**, not "server down" and
not "no results". Confirm liveness with `/api/stats` before concluding anything is broken.
Note the `/api` prefix is required — bare `/stats` 404s.

## Reading `/api/stats` — `total` and `vector.count` measure DIFFERENT things

```json
{ "total": 24343,
  "by_type": {"learning": 11472, "principle": 11619, "retro": 1252},
  "last_indexed": "2026-08-02T18:04:32.444Z", "is_stale": false,
  "vector": {"enabled": true, "count": 0, "collection": "oracle_knowledge_bge_m3"},
  "vectors": [{"key": "bge-m3", "model": "@cf/baai/bge-m3", "count": 0, "enabled": true}] }
```

- `total` / `by_type` = rows in local SQLite + FTS5. This is what grows when agents `arra_learn`.
- `last_indexed` / `is_stale` = **local FTS index** freshness only. `is_stale: false` says
  nothing about the remote vector store.
- `vector.count` = vectors actually present in the **remote Cloudflare Vectorize** collection.

`total: 24343` with `vector.count: 0` is a real, silent state: keyword search works, semantic
search has nothing to match against. Search still returns correct-looking results because the
hybrid pipeline degrades to the FTS5 leg alone — **you cannot detect this from search output,
only from `vector.count`.**

## Why `vector.count` can stay 0 forever: the bulk lock

```bash
cat ~/.arra-oracle-v2/cf-bulk.lock.json
# {"locked": true, "reason": "Locked per fleet standing 2026-07-12", "updated_at": "..."}

cat ~/.arra-oracle-v2/cf-incremental.state
# {"last_run_iso": "2026-08-03T02:24:13+0700", "last_count": 0, "bulk_locked": true, ...}
```

The incremental pusher **keeps running on schedule and keeps succeeding with `last_count: 0`**.
A fresh `last_run_iso` is therefore not evidence that embeddings are flowing — always read
`last_count` and `bulk_locked` together. This lock is a deliberate fleet standing (2026-07-12,
almost certainly to stop bulk re-embed burning CF quota), not a fault. **Do not unlock it
unilaterally** — surface the lock, its reason line, and its date, and let Bo/No.1 decide.

## SQLite schema gotchas (cost real time to discover)

| Wrong assumption | Reality |
|---|---|
| table `documents` | table is **`oracle_documents`** (`.tables` first — also `learn_log`, `oracle_fts*`, `indexing_jobs`, `trace_log`, `forum_*`) |
| `created_at` is ISO text | **epoch milliseconds** — `datetime(created_at/1000,'unixepoch','localtime')` |
| author column `agent` | column is **`created_by`** (value `oracle_learn` for MCP `arra_learn` writes) |
| `learn_log` holds learn history | it was **empty** while 69 docs landed in 10 days — count `oracle_documents`, not `learn_log` |
| `is_stale` comes from `indexing_status.completed_at` | **it comes from `max(oracle_documents.indexedAt)`** — updating `indexing_status` has no effect on `/api/stats is_stale` |

Cols: `id type source_file concepts created_at updated_at indexed_at superseded_by
superseded_at superseded_reason origin project created_by`.

### "Are we still learning?" — the query that answers it

```bash
sqlite3 ~/.arra-oracle-v2/oracle-master.db \
 "SELECT date(created_at/1000,'unixepoch','localtime') d, count(*) c
  FROM oracle_documents
  WHERE created_at > (strftime('%s','now')-864000)*1000
  GROUP BY d ORDER BY d;"
```

Verified 2026-08-03 — 69 docs over 10 days, every day non-zero. So "index isn't growing" was
**not** a learning-volume problem; it was the vector lock. Answer the volume question with
this query before theorising.

Coverage check (all rows embedded into local FTS?):
```bash
sqlite3 ... "SELECT CASE WHEN indexed_at IS NULL THEN 'NOT_INDEXED' ELSE 'indexed' END s,
             count(*) FROM oracle_documents GROUP BY s;"   # → indexed|24343 (100%)
```

## Diagnostic order for "arra feels stale / index not growing"

**Step 0 — run the canonical verify script first:**
```bash
bash /Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/ψ/tools/arra-cf-verify.sh
# == 4/4 GREEN == → stop here, arra is healthy
```
4/4 GREEN = server alive + CF Vectorize reachable + hybrid search works + learn+embed works.

**Known false alarm (2026-08-09):** `vector.count: 0` + `/api/vector/health → "down", "local LanceDB directory is missing"` — after `arra-cf-verify.sh` returns **4/4 GREEN** this is a false alarm. maclab uses CF Vectorize not LanceDB; the missing LanceDB path is harmless.

**Real disable (2026-08-09):** `vector.count: 0` + `/api/health → vectorMode: "disabled"` + `arra-cf-verify.sh` FAILS → `vector-server.json` has `adapter: "lancedb"` but `~/.arra-oracle-v2/lancedb/` directory doesn't exist. Server reads `vector-server.json` as source-of-truth (overrides `ORACLE_VECTOR_DB` env), sees LanceDB adapter, checks path, path missing → disables vector entirely.

Fix:
```bash
# 1. Edit ~/.arra-oracle-v2/vector-server.json — change adapter to cloudflare-vectorize
#    (was "lancedb", must be "cloudflare-vectorize")
python3 -c "
import json
p = '/Users/admin/.arra-oracle-v2/vector-server.json'
d = json.load(open(p))
for k in d.get('collections', {}):
    d['collections'][k]['adapter'] = 'cloudflare-vectorize'
json.dump(d, open(p,'w'), indent=2)
print('updated')
"

# 2. Restart server (launchd will respawn, KeepAlive=true)
kill $(cat ~/.arra-oracle-v2/oracle-http.pid)
sleep 8

# 3. Verify
curl -s http://127.0.0.1:47778/api/health | python3 -c "import sys,json; r=json.load(sys.stdin); print('vectorMode:', r.get('vectorMode'))"
# → vectorMode: embedded  (means CF Vectorize connected)

bash /Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/ψ/tools/arra-cf-verify.sh
# → == 4/4 GREEN ==
```

**Note:** After restart `is_stale` may be True (last_indexed timestamp stale). Safe to update manually:
```python
import sqlite3, time
db = sqlite3.connect('/Users/admin/.arra-oracle-v2/oracle-master.db')
now_ms = int(time.time() * 1000)
db.execute("UPDATE oracle_documents SET indexed_at=? WHERE id=(SELECT id FROM oracle_documents ORDER BY indexed_at DESC LIMIT 1)", (now_ms,))
db.commit()
```
This makes `is_stale: false` without touching any content.

1. `curl /api/stats` — compare `total` vs `vector.count` vs `last_indexed`.
2. If `vector.count == 0` → read `cf-bulk.lock.json` + `cf-incremental.state` (`last_count`, `bulk_locked`).
3. Count recent writes with the epoch-ms group-by above — separates "nobody is learning" from "learning fine, push blocked".
4. Run one live `?q=` search to confirm retrieval still works via FTS5 before alarming anyone.
5. Report as: keyword recall intact / semantic recall absent / cause = deliberate lock dated X — not "arra is broken".

## arra_search / arra_learn via MCP vs curl — use MCP, not curl POST

`arra_search` and `arra_learn` are MCP tools — their correct path is through the **MCP JSON-RPC
pipe** (`arra-mcp-remote.ts`), not raw HTTP. The HTTP API search route is `GET /api/search?q=<terms>`
(not POST). Calling `POST /api/search` with a JSON body returns `{"error":"Not found"}` — this
is wrong verb, not a broken server.

Use the MCP probe pattern to verify live tool availability:
```bash
# Test arra_search via MCP:
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"arra_search","arguments":{"query":"<topic>","limit":3}}}' \
  | timeout 10 bun run /Users/admin/Code/github.com/MEYD-605/<seat>-oracle/ψ/tools/arra-mcp-remote.ts \
  | python3 -c "import sys,json; r=json.load(sys.stdin); [print(c['text'][:300]) for c in r.get('result',{}).get('content',[])]"

# Test arra_learn via MCP:
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"arra_learn","arguments":{"pattern":"<text>","source":"<agent>","concepts":["<tag>"]}}}' \
  | timeout 10 bun run .../arra-mcp-remote.ts \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print(r)"
```
A successful `arra_learn` returns `{"success": true, "file": "ψ/memory/learnings/<date>_<slug>.md", "id": "..."}`.

`vector.count == 0` does NOT mean search is broken — FTS5 fallback still works and returns
real results. Verified 2026-08-09: `total: 24358`, `vector.count: 0`, `arra_search` returned
results, `arra_learn` wrote successfully.

## Fleet Registry — Single Source of Truth for seat/node/repo mapping

When agents don't know each other (causing confusion between old and new seats), maintain a Fleet Registry at:
`gmgrok-oracle/ψ/data/fleet-registry.md`

This file records for each seat: node IP, HERMES_HOME, Oracle repo, model, Discord bot, and RETIRED agents.
Add a link to it in every new oracle repo's CLAUDE.md Navigation table.

**Rule:** When budding a new oracle from an old one (e.g. `developer-oracle` on AI-Core → `highclass-oracle` on natz-ai-03):
- Do NOT reuse the old repo — it carries wrong identity tags, old node host references, and stale memory.
- Create a clean new repo with correct identity from the start.
- Mark the old repo as RETIRED in the Fleet Registry with the reason (e.g. "ai-core sold").

**Template for new oracle CLAUDE.md Fleet Registry entry:**
```markdown
## Fleet Registry (อ่านก่อนสับสน)
> **→ [ψ/data/fleet-registry.md](ψ/data/fleet-registry.md)** — ทุก agent อยู่ที่ไหน ใช้ repo อะไร
```

## Fleet arra Heart Topology (verified 2026-08-09)

All maclab seats share ONE arra heart at `127.0.0.1:47778`. Every seat's `arra-mcp-remote.ts`
defaults to this address when `ORACLE_API` is unset — no per-seat config needed on maclab.

| Agent | ORACLE_API | Reach method | Status |
|---|---|---|---|
| gmgrok (00) | default → :47778 | local | ✅ shared brain |
| lord-knight (01) | default → :47778 | local | ✅ shared brain |
| mimo/no4 (04) | default → :47778 | local | ✅ shared brain |
| gmforge/no5 (05) | default → :47778 | local | ✅ shared brain |
| no10 (black node) | `http://100.83.0.1:47778` explicit | SOCKS5 `socks5h://127.0.0.1:1055` → Tailscale | ✅ shared brain |
| no3/03-highclass (natz-ai-03 141.11.156.4, P'Nat) | `http://100.83.0.1:47778` explicit | Tailscale direct (no SOCKS5 needed) | ✅ shared brain (2026-08-09) |

**Implications:**
- `arra_learn` from any maclab seat → instant in shared DB → `arra_search` from any other maclab seat finds it immediately.
- no10 on black: `curl -s -x socks5h://127.0.0.1:1055 -m 10 http://100.83.0.1:47778/api/health` to verify.
- no3/03-highclass moved from ai-core LXC to natz-ai-03 (141.11.156.4) 2026-08-09. Uses Python MCP wrapper (no bun/node on node) and registered via `hermes mcp add`.

## no3 / remote node Python MCP wrapper & registration (natz-ai-03)

When configuring a remote Hermes seat (like `no.3` / `03-highclass` on `natz-ai-03` `141.11.156.4`) without `bun` or `node`:
1. Use `arra_mcp.py` stdio Python wrapper around `arra_search.py` that reads `/root/.cloudflare.env` for `CLOUDFLARE_AUTH_MODE=global_key` and forwards `ORACLE_API=http://100.83.0.1:47778` (maclab Tailscale IP).
2. Install Python `mcp` SDK if missing: `pip install mcp`.
3. Register using `hermes mcp add`:
   ```bash
   HERMES_HOME=/root/.hermes-highclass hermes mcp add arra-oracle \
     --command python3 \
     --args /root/.hermes-highclass/arra_mcp.py \
     --env ORACLE_API=http://100.83.0.1:47778
   ```
4. Verify with `hermes mcp test arra-oracle` and restart gateway via systemd (`systemctl restart highclass-gateway.service`).
5. **Note on Token Expiry myth:** If `no.3` or another node reports `error 40027: index deleted` or token invalid, check `CLOUDFLARE_AUTH_MODE=global_key`. They were attempting `Authorization: Bearer` instead of `X-Auth-Email`/`X-Auth-Key` headers. Do **not** recreate collections or request new CF tokens.

## no3/03-highclass arra MCP setup (natz-ai-03, no bun/node available)

When a node has no `bun` and no `node`, use a Python stdio MCP wrapper instead of `arra-mcp-remote.ts`.

**Files installed:**
- `/root/.hermes-highclass/arra_search.py` — full arra CLI (search/learn/stats/etc.) using `ORACLE_API` env
- `/root/.hermes-highclass/arra_mcp.py` — stdio MCP JSON-RPC wrapper that shells out to `arra_search.py`

**Hermes config entry** (`/root/.hermes-highclass/config.yaml`):
```yaml
tools:
  mcp:
    arra-oracle:
      command: python3
      args: ["/root/.hermes-highclass/arra_mcp.py"]
      env:
        ORACLE_API: "http://100.83.0.1:47778"
```

**Verify from maclab:**
```bash
ssh meyd@141.11.156.4 "sudo python3 /root/.hermes-highclass/arra_search.py stats" | python3 -c "import sys,json; r=json.load(sys.stdin); print('total:', r['total'])"
# → total: 24371

echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | sudo ORACLE_API=http://100.83.0.1:47778 python3 /root/.hermes-highclass/arra_mcp.py
# → tools: arra_search, arra_learn, arra_stats
```

**Service:** `systemd unit highclass-gateway.service` (enabled). Restart via:
```bash
ssh meyd@141.11.156.4 "sudo systemctl restart highclass-gateway.service"
```

**Pitfall:** Can't restart gateway from *inside* the gateway process — `hermes gateway restart` from a separate shell, or `systemctl restart` via SSH from outside.

## Adding arra MCP to a remote Hermes seat (hermes mcp add)

For Hermes v0.19+ the correct way to register a MCP server is **`hermes mcp add`**, not editing config.yaml directly.
Direct yaml edits under `tools.mcp.*` are silently ignored on v0.19 — `hermes mcp list` returns "No MCP servers configured."

```bash
# On the remote node (as the service user):
HERMES_HOME=/root/.hermes-highclass /opt/hermes-venv/bin/hermes mcp add arra-oracle \
  --command python3 \
  --args /root/.hermes-highclass/arra_mcp.py \
  --env ORACLE_API=http://100.83.0.1:47778
# Responds: "Enable all 3 tools? [Y/n/select]:" → press Enter (default Y)
# Saved to config.yaml + restart gateway to activate
```

**Pitfall: `mcp` Python SDK required.** If the first `mcp add` attempt fails with:
> `MCP server 'arra-oracle' requires the 'mcp' Python SDK, but it is not installed`

Install it first, then retry:
```bash
sudo /opt/hermes-venv/bin/pip install mcp -q
# Then re-run hermes mcp add (it will prompt "Save config anyway?" — answer Y)
```

**Verify the registration worked:**
```bash
HERMES_HOME=/root/.hermes-highclass /opt/hermes-venv/bin/hermes mcp list
# Name         Transport                      Tools   Status
# arra-oracle  python3 /root/.hermes-hig...   all     ✓ enabled

HERMES_HOME=/root/.hermes-highclass /opt/hermes-venv/bin/hermes mcp test arra-oracle
# ✓ Connected (106ms)
# ✓ Tools discovered: 3 — arra_search, arra_learn, arra_stats
```

**Hermes version differences:**
- v0.19: Use `hermes mcp add` — direct yaml not parsed for MCP
- v0.20+: Both yaml and `hermes mcp add` work

## mcp SDK Version Lock & Hermes Compatibility (verified 2026-08-09)

- **CRITICAL — mcp Python SDK version pinning:**
  `mcp 2.0.0` is a **major breaking change** incompatible with Hermes ≤ 0.19.x:
  - Every field renamed camelCase → snake_case (`isError` → `is_error`, `inputSchema` → `input_schema`, etc.)
  - `FastMCP` class renamed to `MCPServer`; `httpx` / `httpx-sse` replaced by `httpx2`
  - `streamablehttp_client` removed

  Symptom on Hermes 0.19 with mcp 2.0.0:
  ```
  AttributeError: 'CallToolResult' object has no attribute 'isError'
  # Also: arra_search times out at 300s — Hermes cannot parse the tool response
  ```

  Fix — pin to latest stable v1:
  ```bash
  sudo /opt/hermes-venv/bin/pip install 'mcp==1.28.1'
  sudo systemctl restart highclass-gateway.service
  # Verify:
  sudo /opt/hermes-venv/bin/pip show mcp | grep Version   # → Version: 1.28.1
  ```

  Official migration guide: *"keep a `<2` upper bound until you've migrated"*  
  Safe constraint for any Hermes ≤ 0.19 seat: `pip install 'mcp<2'`

## Provisioning Hermes Seat Skills & Ansible Playbook Automation

- **`external_dirs` Requirement:** Hermes will NOT load custom/local skills unless `external_dirs` is configured in `config.yaml`:
  ```yaml
  external_dirs:
    - /root/.hermes-highclass/skills
  ```
- **Ansible Playbook Stage 04b:** Both `deploy-hermes-node.yml` (Linux) and `maclab-playbook.yml` (macOS) include **Stage 04b** to automatically create the skills archive from `maclab:~/.hermes-gmgrok/skills/`, copy/extract it to target seats, pin `mcp==1.28.1`, and verify `SKILL.md` count.

## Discord Thread & Reply Controls (`auto_thread`)

- **`auto_thread: false`**: To prevent Hermes from auto-generating threaded sub-conversations in Discord channels (which clutter public channels/Wormhole), set `auto_thread: false` in `~/.hermes-<seat>/config.yaml`:
  ```yaml
  gateway:
    platforms:
      discord:
        auto_thread: false
  ```
- **Discord Bot Rules:**
  1. Do NOT open thread replies in shared public channels unless requested.
  2. If a message explicitly addresses/mentions another bot (e.g. `@gmgrok`), unaddressed bots MUST stay quiet and not interject.

## MCP side (`arra-mcp-remote.ts` under bun)

Startup is logged per-attempt in the *seat's* `~/.hermes-<seat>/logs/mcp-stderr.log`:

```
===== [2026-08-03 01:15:33] starting MCP server 'arra-oracle' =====
error: Script not found "["                     ← args landed as a STRING (see hermes-parity-check)
...
===== [2026-08-03 01:16:42] starting MCP server 'arra-oracle' =====
[arra-mcp-remote] proxy → http://127.0.0.1:47778   ← healthy
```

`error: Script not found "["` (or `"0"`) is the signature of the list-valued-config bug —
bun is being handed the first *character* of a stringified JSON array as the script path.
The healthy line is the `proxy → <url>` banner. This log is the ground truth for whether the
MCP came up; a gateway restart appends a new block, so `tail` it after every bounce.
