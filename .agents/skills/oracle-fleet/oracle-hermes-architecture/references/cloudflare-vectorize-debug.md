# Cloudflare Vectorize Integration & REST API Debugging Notes

## Root Causes Discovered (2026-08-12)

### 1. Global API Key Authentication (Error 401 / Code 10000 / Code 7000)
- **Problem**: Cloudflare Global API Keys (`cfk_` prefix) do not work with `Authorization: Bearer <key>`. Workers AI returns HTTP 401 code 10000, which surfaces as misleading code 7000 "No route for that URI".
- **Fix**: Use `X-Auth-Email` + `X-Auth-Key` headers when `CLOUDFLARE_AUTH_MODE=global_key` or key has `cfk_` prefix:
```typescript
export function cloudflareAuthHeaders(apiToken: string): Record<string, string> {
  const forceGlobal = (process.env.CLOUDFLARE_AUTH_MODE || '').trim().toLowerCase() === 'global_key';
  const isGlobalKey = forceGlobal || apiToken.startsWith('cfk_');

  if (isGlobalKey) {
    const email = (process.env.CLOUDFLARE_EMAIL || '').trim();
    if (!email) {
      throw new Error('CLOUDFLARE_EMAIL is required when using a Global API Key');
    }
    return { 'X-Auth-Email': email, 'X-Auth-Key': apiToken };
  }
  return { Authorization: `Bearer ${apiToken}` };
}
```

### 2. topK Cap with returnMetadata='all' (Error 400 / Code 40025)
- **Problem**: Cloudflare Vectorize `/query` REST API throws code 40025 when `topK > 50` while `returnMetadata='all'`:
  `with returnValues=true or returnMetadata=all, max top K is 50, but got 100`
- **Fix**: Clamp `topK` to `Math.min(limit, 50)`:
```typescript
const CF_METADATA_ALL_MAX_TOPK = 50;
const body = {
  vector: queryEmbedding,
  topK: Math.min(limit, CF_METADATA_ALL_MAX_TOPK),
  returnValues: false,
  returnMetadata: 'all',
};
```

### 3. Vector Results Have Empty Content (safe_id mismatch) — Added 2026-08-12

- **Problem**: `arra_search` returns `source: vector` results with `content: ''` (0 chars). FTS results have content. Docs confirmed to exist in SQLite manually.
- **Root cause**: CF Vectorize truncates document IDs at index time. Stored vector ID: `learning_2026-08-03_cloudflare-auth-is-n_1232313b`. SQLite ID: `learning_2026-08-03_cloudflare-auth-is-not-one-shape-global-api-key-a`. Exact match fails → content empty.
- **Fix** in `src/tools/search/vector.ts` → `hydrateFromSQLite()`:
```typescript
// Pass 1: batch exact match
const exactRows = ctx.sqlite.prepare(
  `SELECT d.id, d.type, d.source_file, f.content, d.concepts
   FROM oracle_documents d LEFT JOIN oracle_fts f ON f.id = d.id
   WHERE d.id IN (${placeholders})`
).all(...ids);
for (const r of exactRows) result.set(r.id, r);

// Pass 2: safe_id prefix LIKE fallback for misses
const missing = ids.filter(id => !result.has(id));
for (const safeId of missing) {
  const lastUnderscore = safeId.lastIndexOf('_');
  if (lastUnderscore > 0) {
    const prefix = safeId.slice(0, lastUnderscore);
    const row = ctx.sqlite.prepare(
      `SELECT d.id, d.type, d.source_file, f.content, d.concepts
       FROM oracle_documents d LEFT JOIN oracle_fts f ON f.id = d.id
       WHERE d.id LIKE ? LIMIT 1`
    ).get(prefix + '%');
    if (row) result.set(safeId, row); // key by safeId so caller finds it
  }
}
```
- **Commit**: `33ef8d6b`

## Verification Suite
- Unit test: `bun test src/vector/adapters/cloudflare-auth-headers.test.ts` (4/4 pass)
- Live verification endpoint: `GET /api/v1/search?q=oracle&mode=hybrid&limit=5`
- Expected: `"vectorAvailable": true`, `"warning": null`, `results[].source = "vector"`, `results[].content` non-empty

## bun Transpile Cache Gotcha

After editing `.ts` files and restarting via launchd, bun may serve a cached transpile — the new code doesn't run.

**Symptom**: Debug `console.error` lines added to code never appear in server logs after `launchctl kickstart -k`.

**Confirm new code is running**: Check `/Users/admin/.arra-oracle-v2/server.log` for version string. If unchanged after you know you bumped something, cache is the culprit.

**Force fresh**: `kill <server-pid>` → wait for launchd respawn, OR run `bun --no-cache src/server.ts` directly (but this won't have CF env vars from `oracle-cf-serve.sh`).

## Env Quick Reference

```bash
# Required in ~/.arra-oracle-v2/oracle-cf.env
ORACLE_VECTOR_DB=cloudflare-vectorize
ORACLE_EMBEDDING_PROVIDER=cloudflare-ai   # NOT "cloudflare"
ORACLE_EMBEDDER=cloudflare-ai             # NOT "cloudflare"
ORACLE_EMBEDDING_MODEL=@cf/baai/bge-m3

# Required in ~/.cloudflare.env
CLOUDFLARE_ACCOUNT_ID=***
CLOUDFLARE_API_TOKEN=cfk_***             # Global API Key
CLOUDFLARE_EMAIL=***
CLOUDFLARE_AUTH_MODE=global_key
```

## Health Check Script

```bash
curl -s http://127.0.0.1:47778/api/health | grep -o '"oracle":"[^"]*"'
curl -s "http://127.0.0.1:47778/api/v1/search?q=test&mode=hybrid&limit=3" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print('vector:', d.get('vectorAvailable'), '| warning:', d.get('warning','none'))
for r in d.get('results',[])[:3]: print(f'  source={r[\"source\"]:<8} content={len(r.get(\"content\",\"\"))}')"
```
