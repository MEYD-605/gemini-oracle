# SQLite FTS5 Anti-Join & CPU Load Guard

## Problem & Pitfall
When checking for unindexed records or gaps between `oracle_documents` and `oracle_fts` (an FTS5 virtual table in `oracle-master.db`), running a correlated subquery like:

```sql
-- DANGEROUS: Full O(N*M) scan, pegs CPU at 90%+ for 5-8 minutes
SELECT d.id FROM oracle_documents d WHERE NOT EXISTS (SELECT 1 FROM oracle_fts f WHERE f.id = d.id);
```

FTS5 virtual tables lack b-tree indexes on regular columns like `id`. A correlated `NOT EXISTS` forces SQLite to perform a full scan of the FTS table for every row of the document table.

### The `LIMIT N` Illusion
Adding `LIMIT N` (e.g., `LIMIT 20`) to a correlated `NOT EXISTS` query **does NOT speed it up**. SQLite must still complete the full scan of unindexed rows to verify non-existence for each outer candidate. If missing rows are rare or non-existent, `LIMIT 20` will scan all ~595M comparisons regardless.

## Safe & Fast Solution (<0.3s)
Use a materializing `LEFT JOIN` subquery pattern:

```sql
-- FAST (<0.3s): Materializes FTS ids once
SELECT d.id FROM oracle_documents d 
LEFT JOIN (SELECT id FROM oracle_fts) f ON f.id = d.id 
WHERE f.id IS NULL;
```
