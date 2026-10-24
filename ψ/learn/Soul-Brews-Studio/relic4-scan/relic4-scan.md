# relic4-scan (& relic5) Learning Index

## Source
- **Origin**: `./origin/` (`/Users/admin/.no6-home/ghq/github.com/Soul-Brews-Studio/relic4-scan`)
- **GitHub**: https://github.com/Soul-Brews-Studio/relic4-scan (`v26.10.24-alpha.2025`, AGPL-3.0)
- **Web Surfaces**:
  - `https://relic5.buildwithoracle.com/` (`v26.10.24-alpha.2308` — Relic 5 private-alpha self-hosted cross-machine hub)
  - `https://relic.buildwithoracle.com/scan/` (`ARRA Relic Scan` public release & workbench page)

## Explorations

### 2026-10-24 2321 (default)
- [[2026-10-24/2321_ARCHITECTURE|Architecture]]
- [[2026-10-24/2321_CODE-SNIPPETS|Code Snippets]]
- [[2026-10-24/2321_QUICK-REFERENCE|Quick Reference]]

**Key insights**:
1. **Two-tier Private Architecture (`relic-scan` + `relic5` Hub)**: `relic-scan` (`Soul-Brews-Studio/relic4-scan`, Rust 1.89+) runs locally on each machine to discover every agent transcript (`.claude`, `.codex`, `.omp`, `.omx`, `.gemini`, `.pi`, `.thclaws`) and `ψ` vault, indexing them into monthly Parquet shards (`~/.relic-scan/YYYY-MM.parquet`). `relic5` (`relic5.buildwithoracle.com`, private alpha) is the central self-hosted hub that receives incremental pushes from all machines, builds keyword + vector semantic search, renders a 3D/2D semantic session map, and exposes 5 MCP tools (`relic_search`, `relic_show`, `relic_sessions`, `relic_session`, `relic_status`).
2. **Append-Only Blake2b-128 Hash-Chain Ledger (`_ledger.tsv`)**: Every line hash `h` (`blake2b-64`) is chained into a 16-byte rolling `blake2b-128` digest per file version. Moved directories or mirrored transcripts across machines are recognized by hash (`Answer::Same`) without re-parsing, and grown files (`Answer::Update`) resume from their exact byte offset.
3. **Bangkok (`UTC+7`) Month Sharding & Cryptographic Seals**: Each line is bucketed into the Bangkok month of its own timestamp (not session start). Closed months prior to the current month are marked `sealed`, set read-only, and verified by key hash before exporting to S3/Garage/MinIO (`relic-scan export --to s3://...`).
