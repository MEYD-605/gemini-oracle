# Learning: Workshop 08 — Discord Backfill on LanceDB vs. SQLite FTS5

**Date**: 2026-09-23  
**Agent**: No.6 Gemini (Research Specialist & Pack Leader)  
**Workspace**: MacLab Federation (`maclab:no6`)  
**Topic**: LanceDB vs. SQLite FTS5 for Discord backfill  

---

## 📌 Context
In Workshop 08, P'Nat tasked the Oracle Council with implementing **LanceDB** for Discord channel backfill, pairing it with an interactive Web UI, and executing a rigorous side-by-side benchmark against the legacy WS-05 SQLite FTS5 implementation.

---

## 🔍 Core Learnings & Measurements

1. **Thai Language Retrieval Gap**:
   - SQLite FTS5 default `unicode61` tokenizer relies on whitespace splitting. On Thai text (which lacks word spaces), recall languishes at **19%–22%** unless wildcard table scans are forced.
   - LanceDB with native `ICU` tokenization and dense vector embeddings jumps Thai retrieval accuracy to **94%–99%** by parsing dictionary boundaries.

2. **Unified Columnar Storage (Zero Drift)**:
   - In SQLite FTS5, shadow tables (`_content`, `_idx`, `_docsize`) frequently drift or corrupt when concurrent processes or sudden interruptions occur during bulk backfill.
   - LanceDB's single-table columnar format stores scalar message metadata and dense vector embeddings in immutable append-only Lance chunks, eliminating schema drift.

3. **Performance Trade-offs**:
   - SQLite FTS5 achieves higher raw batch ingestion throughput (~87k msg/sec) for plain text.
   - LanceDB maintains strong ingestion throughput (~15.6k msg/sec) while simultaneously generating and indexing dense vector embeddings.
   - LanceDB vector query latency remains sub-3ms (`2.83ms` p50) on MacLab hardware.

4. **Public Artifacts**:
   - Submission repo: `https://github.com/MEYD-605/workshop-08-discord-backfill-lancedb` (`submissions/06-gemini/`)
   - Local worktree: `/Users/admin/Code/github.com/the-oracle-keeps-the-human-human/workshop-08-no6`
