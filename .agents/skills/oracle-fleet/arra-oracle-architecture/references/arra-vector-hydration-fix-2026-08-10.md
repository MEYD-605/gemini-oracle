# Arra Vector Hydration Fix — 2026-08-10

## Problem

Hybrid/vector search returned `score > 0` but `content: ""` and `source_file: ""`.
FTS-only search worked fine. Reported by no.3 (03-highclass on natz-ai-03).

## Root Cause

Two separate bugs in `arra-oracle-v3`:

### Bug 1: `searchOneModel()` in `src/server/vector-operations.ts`

The function queried `oracle_documents` for `id + project` only (no content/source_file),
then used `vectorRows.documents?.[i] || ''` for content — which is ALWAYS empty because
Cloudflare Vectorize doesn't store full document text in its response, only vectors + metadata.

**Fix:** After getting vector IDs from CF Vectorize, do a batch lookup in `oracle_fts`
to hydrate content and source_file:

```typescript
const sqlite = (db as any).$client;
const placeholders = vectorRows.ids.map(() => '?').join(',');
const ftsRows = sqlite.prepare(
  `SELECT id, content FROM oracle_fts WHERE id IN (${placeholders})`
).all(...vectorRows.ids) as Array<{ id: string; content: string }>;
```

### Bug 2: safe_id prefix mismatch

Cloudflare Vectorize truncates/hashes long IDs: `resonance_ψ/memory/...` becomes
`resonance___memory_..._766a3620` (safe_id with MD5 hash suffix).

When looking up the safe_id in `oracle_fts WHERE id = ?`, it returns nothing
because the FTS table stores the ORIGINAL long id, not the safe_id.

**Fix:** Strip the 8-char MD5 hash suffix, then convert `___` to `_%` for LIKE matching:

```typescript
const cleanPrefix = missingId.replace(/_[a-f0-9]{8}$/, '');
const pathPattern = cleanPrefix.replace(/___/g, '_%').replace(/__/g, '%');
const fallbackRow = sqlite.prepare(
  `SELECT id, content FROM oracle_fts WHERE id LIKE ? LIMIT 1`
).get(`${pathPattern}%`);
```

### Bug 3: `oracle_fts` has correct content but FTS table wasn't joined in `searchOneModel`

The `oracle_documents` table does NOT have a `content` column — content lives in `oracle_fts`.
The join must be: `oracle_fts f LEFT JOIN oracle_documents d ON d.id = f.id`.

## Files modified

- `src/server/vector-operations.ts` — `searchOneModel()`: added FTS batch hydration
- `src/tools/search.ts` — `vectorSearch()`: added similar hydration with LIKE fallback

## Additional: `src/const.ts` was wrong

`ORACLE_DB_FILE = 'oracle.db'` was pointing to the old 9k-doc database.
Fixed to `ORACLE_DB_FILE = 'oracle-master.db'` (24,370 docs).

## Verification after fix

```bash
# From no.3 (natz-ai-03):
ORACLE_API=http://100.83.0.1:47778 python3 arra_search.py search 'oracle architecture' --limit 3
# Expected: [1] (0.402) [learning] ψ/memory/learnings/... — with content preview
```

## D1 Edge Failover Hydration

In `searchOneModel()`, after the local SQLite lookup, if content is still missing
AND `CLOUDFLARE_EMAIL` + `CLOUDFLARE_AUTH_KEY` env vars are set, it falls back to
query Cloudflare D1 (`oracle_knowledge_d1` DB ID: `84ece9ec-bb38-409f-bdbc-fbf6cf6315e2`):

```typescript
const d1Resp = await fetch(d1Url, {
  method: 'POST',
  headers: { 'X-Auth-Email': EMAIL, 'X-Auth-Key': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sql: `SELECT id, content, source_file FROM oracle_documents WHERE id IN (${placeholders})`,
    params: stillMissingIds
  })
});
```

This means even when maclab is offline, other fleet nodes (no.3, note20) can still
get content hydration from Cloudflare D1 Edge database.
