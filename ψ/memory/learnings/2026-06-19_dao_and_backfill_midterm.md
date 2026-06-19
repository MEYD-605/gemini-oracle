---
pattern: Bypass faulty GPUs using Accelerate CPU-only mode for BERT BGE-M3 and escape SQLite FTS5 MATCH characters to prevent driver hangs and parser crashes.
date: 2026-06-19
source: rrr: gemini-oracle
concepts: [cpu-embeddings, sqlite-fts5, lancedb, workspace-hygiene, visual-authenticity]
---

# Midterm Indexer Learnings: GPU Bypass, FTS5 Safety, and DAO Principles

## 1. BERT/BGE-M3 Embedding GPU Timeout on Intel macOS (Vega 56)
- **Problem**: When running `bge-m3` embedding processing on iMac Pro 2017 with discrete AMD Radeon Pro Vega 56 GPU, Metal GPU commands buffered status returned 5 (`GPU Timeout Error`) causing 9s latency and driver hangs.
- **Pattern**: Force CPU-only execution (`-ngl 0 --parallel 1` using the native Accelerate framework) instead of GPU-acceleration for large BERT/BGE models.
- **Outcome**: Blazing-fast performance at **22ms per request** (400x speedup) and 1.05s per 50-document batch.
- **Confidence Level**: High. Tested across multiple batches and verified clean execution writing to `reindex.log`.

## 2. SQLite FTS5 MATCH Query Operator Escaping
- **Problem**: SQLite's FTS5 MATCH query syntax crashes with parser exceptions when users query special characters (e.g. `-` or `:`).
- **Pattern**: Sanitize queries before passing them to the SQLite `MATCH` statement by replacing special operators with blank spaces or escaping quotes fully.
- **Outcome**: Prevents runtime crash exceptions on search queries with syntax operators.
- **Confidence Level**: High. Fully resolved FTS5 query parser crash incidents.

## 3. Stale LanceDB Connection Handles (Post-Migration Gotcha)
- **Problem**: A vector collection reindexing or model migration changes actual vector counts in the database, but long-running API servers do not mirror this update, showing empty/low counts.
- **Pattern**: A long-running database connection holds a stale table handle in memory. Re-embed scripts must trigger a systemd service restart to force connection drops and reload lancedb stats.
- **Connection to Past Learnings**: Connected directly to the silent search rot incident resolved on 2026-06-02.
- **Confidence Level**: Medium. Requires manual validation on target services to confirm stats sync.

## 4. Subdirectory Workspace Isolation in Shared Repositories
- **Problem**: Multi-agent collaboration in a shared repository can pollute root structures and cause git namespace conflicts on branches.
- **Pattern**: Isolate implementation and configuration files inside `submissions/<agent_name>/` or `submissions/<bot_number>/` subdirectories to ensure conflict-free peer branch merging.
- **Confidence Level**: High. Standardized across midterm and final exam workflow rules.

## 5. Visual Authenticity (No Faked Proofs)
- **Problem**: Rushing submissions by simulating browser visuals with AI image generators violates the transparency rules and breaks visual checks.
- **Pattern**: Always use real Headless Google Chrome screenshots of `index.html` or direct CLI output captures to verify UI states.
- **Confidence Level**: High. Verified visual checks across fleet platforms.
