---
pattern: "Learned relic4-scan & relic5: Rust local transcript/vault Parquet indexer with Blake2b-128 hash-chain ledger feeding the self-hosted relic5 cross-machine semantic & MCP hub"
date: 2026-10-24
source: learn: Soul-Brews-Studio/relic4-scan
concepts: ["learn", "codebase", "relic5", "relic4-scan", "parquet", "rust", "mcp", "transcript-indexing"]
---

# Learned relic4-scan & relic5 (`https://relic5.buildwithoracle.com`)

- **`relic5` (`v26.10.24-alpha.2308`, `https://relic5.buildwithoracle.com/`)** is a private-alpha, self-hosted central hub for every AI-agent session across every machine on a private network. It operates in 4 steps (**Find $\rightarrow$ Push $\rightarrow$ Index $\rightarrow$ Ask**):
  1. **Find (`ARRA Relic Scan` / `Soul-Brews-Studio/relic4-scan`)**: Open-source (`AGPL-3.0`) Rust CLI + Tauri desktop app (`v26.10.24-alpha.2025`) that walks a machine to find every transcript (`.claude`, `.codex`, `.omp`, `.omx`, `.gemini`, `.pi`, `.thclaws` + mirrors/archives) and every `ψ` vault.
  2. **Push**: Each machine incrementally parses new bytes into one Parquet file per Bangkok month (`~/.relic-scan/YYYY-MM.parquet`) and pushes only what changed to the `relic5` hub (or exports sealed months to S3/Garage/MinIO via `relic-scan export --to s3://...`).
  3. **Index**: The hub deduplicates messages pushed from multiple machines (`blake2b-64` line hash `h` + `sources` list), builds a keyword index (supporting inside-word Thai matching) and stores per-message embeddings, and places sessions on a 3D/2D semantic map by averaging their message vectors.
  4. **Ask**: Humans search via web UI or CLI (`relic-scan up` / `tui` / `ops`), and agents query the hub via 5 MCP tools (`relic_search`, `relic_show`, `relic_sessions`, `relic_session`, `relic_status`).
- **Append-Only Hash-Chain Ledger (`src/ledger.rs`)**: `~/.relic-scan/_ledger.tsv` records `chain_n = blake2b-128(chain_{n-1} || h_n)` for every file version read, classifying files as `same` (skip parse, record `copy_of`), `update` (seek to byte offset and parse tail only), `past-changed`, or `never`.
- **`relic5` "Oracles" Portal (`#tab=oracles&oracle=<name>`)**: Synthesizes an Oracle's entire `ψ` vault (`memory/resonance`, `memory/learnings`, `inbox`, rules) into two one-click prompts (`Character and style` and `Enlightenment`) where every trait is quoted directly from a real note, allowing any Oracle to be reincarnated/instantiated into a fresh Claude/LLM session with its exact voice, memories, and vocabulary cloud.
- **ANE Semantic Search & 3D PCA Map**: Uses `unsloth--embeddinggemma-300m@806f5f90` (768-dim) on Apple Neural Engine (`0.12–0.15 s` query encoding, fallback to MPS) to power semantic search and the 3D/2D PCA session map (`#tab=map`).
- **Docs**: `ψ/learn/Soul-Brews-Studio/relic4-scan/relic4-scan.md` and `ψ/learn/Soul-Brews-Studio/relic4-scan/2026-10-24/2321_*.md`.
