# Cloudflare Vectorize REST API Quickstart & Rules (Arra Oracle v3)

Condensed setup and troubleshooting rules derived from live debugging on MacLab (2026-08-12).

## 1. Authentication Headers (Global API Key)

When using Global API Keys (`cfk_...`):
- **Headers required**: `X-Auth-Email: <email>` AND `X-Auth-Key: <key>`
- **Do NOT use**: `Authorization: Bearer <key>` (causes HTTP 401 / Cloudflare error code 10000)

## 2. Environment Variables

```bash
CLOUDFLARE_ACCOUNT_ID=<account-id>
CLOUDFLARE_EMAIL=<email>
CLOUDFLARE_API_TOKEN=<global-api-key>

ORACLE_VECTOR_DB=cloudflare-vectorize
ORACLE_DB_PATH=/path/to/oracle-master.db
ORACLE_EMBEDDING_MODEL=@cf/baai/bge-m3
ORACLE_EMBEDDING_PROVIDER=cloudflare-ai
ORACLE_EMBEDDER=cloudflare-ai
```

> **Crucial**: `ORACLE_EMBEDDER` / `ORACLE_EMBEDDING_PROVIDER` MUST use the `-ai` suffix (`cloudflare-ai`). Passing `cloudflare` causes validation failure at startup.

## 3. Cloudflare Vectorize API Pitfalls & Limits

| Parameter / Action | Limit / Rule | Error Code on Failure |
|---|---|---|
| Vector ID length | Max 64 bytes (`safeVectorId` required; check `cast(id as blob)` byte length, not char length — multi-byte UTF-8 like `ψ` adds extra bytes) | HTTP 400 / Code 40008 |
| `topK` with `returnMetadata: 'all'` | Max 50 | HTTP 400 / Code 40025 |
| Endpoint for fetching IDs | `/get_by_ids` (snake_case) | HTTP 404 (`/getByIds` returns 404) |
| Propagation delay | 12s–57s after upsert | Returns empty results if queried immediately |

## 4. Safe Vector ID & Write Pipeline Protection

1. **Adapter-layer transformation**: `safeVectorId(id)` converts long document IDs to `prefix_55 + '_' + sha256(id)[:8]` (exactly 64 bytes).
2. **Future writes guarantee**: All new writes routed through `cloudflare-vectorize.ts` pass through `safeVectorId` automatically, ensuring no new writes trigger 40008 errors.
4. **Legacy Backfill Execution**: Run `bun scripts/cf-safeid-backfill.ts --batch 20` to backfill existing over-limit IDs in batches without modifying primary keys in SQLite DB.
5. **Dry-Run & Verify Options**: Use `bun scripts/cf-safeid-backfill.ts --dry-run` to preview transformations or `bun scripts/cf-safeid-verify-sample.ts --offset N --limit N` to verify index propagation.

## 5. Text Hydration Strategy

Cloudflare Vectorize metadata does not store document body text. Search handlers MUST hydrate document text from local SQLite (`oracle_fts` / `oracle_documents`):
1. Query Cloudflare Vectorize for matching IDs.
2. Exact match lookup in SQLite: `WHERE id = safe_id`.
3. If not found (due to safe_id hash suffix truncation), run prefix lookup: `WHERE id LIKE prefix || '%'`.
