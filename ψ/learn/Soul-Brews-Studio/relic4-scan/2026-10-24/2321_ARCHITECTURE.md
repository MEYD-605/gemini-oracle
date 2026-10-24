# Soul-Brews-Studio/relic4-scan — Architecture (`2321_ARCHITECTURE.md`)

> **Target Repository**: `Soul-Brews-Studio/relic4-scan` (`v26.10.24-alpha.2025`, License: `AGPL-3.0-only`, Rust 2024 edition / `rust-version = "1.89"`)
> **Related Hub Surface**: `https://relic5.buildwithoracle.com/` (`v26.10.24-alpha.2308`, private alpha self-hosted hub that consumes `relic-scan` outputs)

---

## 1. System Overview & Role in the Relic 4 / Relic 5 Ecosystem

`relic4-scan` (binary name: `relic-scan`) is the local machine discovery, incremental parser, Parquet indexer, S3 exporter, and local UI/TUI browser for AI-agent transcripts and `ψ` vaults.

According to `https://relic5.buildwithoracle.com/` and `src/ops.rs`, the full **Relic 5** pipeline consists of four stages on private hardware:
1. **Find (`relic-scan`)**: Walks a machine to discover every agent transcript (`.claude`, `.codex`, `.omp`, `.omx`, `.gemini`, `.pi`, `.thclaws` homes, mirrors, and backups) and every oracle `ψ` vault (`src/scan.rs`, `src/vault.rs`).
2. **Parse & Index Locally (`relic-scan run`)**: Incrementally parses new bytes into one Apache Parquet file per Bangkok month (`~/.relic-scan/YYYY-MM.parquet`) plus session/file metadata (`meta/sessions.parquet`, `meta/files.parquet`, `meta/jsonl.parquet`) and a hash-chain ledger (`_ledger.tsv`).
3. **Push / Export (`relic5-push` / `relic-scan export`)**: Either pushes incremental monthly diffs to the private **relic5 hub** (`relic5 push`, monitored in `src/ops.rs:60,132`) or exports sealed (closed) months to an S3-compatible object store (`AWS S3`, `Garage`, `MinIO`) via `src/export_s3.rs`.
4. **Ask (`relic5` Hub & Local Views)**:
   - **Local (`relic-scan up` / `serve` / `tui` / Tauri app)**: Serves a zero-network local web UI on `127.0.0.1:8787` (`src/serve.rs`, `src/page/`) and a terminal UI (`src/tui/`).
   - **Central Hub (`relic5.buildwithoracle.com`)**: Folds messages pushed by multiple machines into one index, builds keyword + vector semantic search, renders a 3D/2D semantic session map, turns `ψ` memory notes into browsable pages, and exposes 5 MCP tools (`relic_search`, `relic_show`, `relic_sessions`, `relic_session`, `relic_status`).

---

## 2. Directory Structure

Verified from `/Users/admin/.no6-home/ghq/github.com/Soul-Brews-Studio/relic4-scan/`:

```text
relic4-scan/
├── Cargo.toml             # Crate config (relic-scan v26.10.24-alpha.2025, edition 2024)
├── AGENTS.md              # Operational & schema guide for coding agents
├── README.md              # Human documentation & benchmarks
├── justfile               # Build, test, Tauri desktop app, Linux Docker & SEO recipes
├── install.sh             # Curl-pipe installer (builds release binary to ~/.local/bin/relic-scan)
├── src/                   # Core Rust library & CLI binary (strict <500 lines per file rule)
│   ├── main.rs            # clap CLI entry point (Scan, Run, Up, Serve, Export, Ops, Seals, Log, Tui, Meta, Map, Parse)
│   ├── lib.rs             # Shared types, RunArgs, command wiring
│   ├── scan.rs            # Phase 1: multi-threaded filesystem walk, inode dedupe, home & origin classification
│   ├── sniff.rs           # Content sniffer to distinguish real transcripts from ops/prompt logs
│   ├── run.rs             # Incremental runner orchestrating scan -> ledger check -> parse -> meta -> map
│   ├── ledger.rs          # Append-only _ledger.tsv with Blake2b-128 line hash chains (same / update / past-changed / never)
│   ├── state.rs           # _state.tsv per-file byte offset & 4KB prefix hash tracking
│   ├── engine.rs          # Rust port of relic4's Python engine.py (line extraction, Bangkok timestamps, 10-rule secret redaction)
│   ├── parse/             # Multi-threaded Arrow/Parquet writer & truth-schema deduplication
│   ├── meta/              # Builds meta/sessions.parquet, meta/files.parquet, meta/jsonl.parquet, meta/months.json
│   ├── vault.rs           # Discovers ψ vaults & indexes markdown notes into meta/vaults.json
│   ├── map.rs             # Bundles src/page/* into self-contained meta/map.html
│   ├── serve.rs           # 127.0.0.1 HTTP server with X-Relic header CSRF guard & local APIs
│   ├── ops.rs             # Live relic chain monitor (parses relic-chain.log, ps, hub /api/status, S3 jobs)
│   ├── export.rs          # CSV/JSON metadata exporter
│   ├── export_s3.rs       # AWS SigV4 client for uploading/verifying sealed months on S3/Garage/MinIO
│   ├── page/              # Zero-dependency vanilla JS/CSS frontend views
│   └── tui/               # Ratatui + Crossterm terminal UI
├── desktop/               # Tauri desktop application wrapper for macOS (.dmg) and Linux (.deb/.AppImage)
├── site/                  # Static landing page for relic.buildwithoracle.com/scan/ (Preact + htm + Tailwind v4 + seo.mjs)
├── scripts/               # Operator scripts for multi-machine .claude home merging, S3 backup, and releases
│   ├── claude-home/       # claude-merge.py, claude-union.py, claude-verify.py, extra-merge.py
│   ├── export/            # relic-export-nightly timer script
│   └── release/           # macOS/Linux release builders
├── docs/                  # Architecture & provenance docs (DESIGN.md, OUTPUT-CHAIN.md, LEARNED.md, COMPARE.md, RESEARCH.md)
└── verify/                # Python parity verification against jsonl-truth
```

---

## 3. Core Architectural Invariants

1. **Read-Only on Transcripts & Vaults (`AGENTS.md:164`)**:
   `relic-scan` never modifies any `.jsonl` transcript or `ψ` vault file. All writes are confined to `~/.relic-scan` (or `--out`).
2. **One Line $\rightarrow$ One Truth Row (`docs/OUTPUT-CHAIN.md`)**:
   Every JSONL line is hashed with `blake2b(line_with_newline, 8)` into a signed 64-bit integer `h`. Copies of the same transcript across multiple homes, backups, or mirrors fold into a single row with all `agent:path:line` locators preserved in `sources`.
3. **Append-Only Blake2b-128 Hash-Chain Ledger (`src/ledger.rs`)**:
   `~/.relic-scan/_ledger.tsv` tracks every version of every transcript ever read using a rolling chain $\text{chain}_n = \text{blake2b-128}(\text{chain}_{n-1} \parallel h_n)$. Moved directories or cross-machine mirrors are recognized as `Answer::Same` by hash without re-parsing; grown files (`Answer::Update`) resume from the exact byte offset (`v.bytes`).
4. **Bangkok Month Sharding & Cryptographic Seals (`AGENTS.md:48-51`)**:
   Each row is placed into the `YYYY-MM.parquet` file of **its own timestamp in `Asia/Bangkok` (`UTC+7`)**, not the session start date. Months prior to the current Bangkok month are marked `sealed`, made read-only (`chmod 444`), and stamped with a key hash so `relic-scan seals --verify` and `relic-scan export --to s3://...` can guarantee immutability.
5. **Strict Local Security Boundary (`src/serve.rs`, `AGENTS.md:163-165`)**:
   The web UI binds exclusively to `127.0.0.1`, loads zero external fonts or CDNs, makes no outbound network calls from the browser, requires a custom `X-Relic` header on all state-changing `POST` endpoints, and restricts `/api/reveal` and `/api/note` to file paths already recorded in the index.

---

## 4. `relic5` Hub (`127.0.0.1:5275`) — Real Screenshots & The "Oracles" Reincarnation Portal

From P'Nat's live hub screenshots (`relic5 v26.10.24-alpha.2308` / `26.10.24-alpha.2025` running on `127.0.0.1:5275`), the hub provides 11 top-level tabs: **`Home`, `Search`, `Map`, `Live`, `Knowledge`, `Oracles`, `Jobs`, `Disk`, `Asked`, `Quality`, `Connect`**.

1. **`Oracles` Tab (`#tab=oracles&oracle=<name>` — The Soul/Reincarnation Portal)**:
   - Displays every Oracle's `ψ` vault across machines (e.g., `noah-oracle`: 2,985 notes in its `ψ` vault on `m5, white`).
   - Synthesizes two copy-ready persona prompts (**`Character and style`** and **`Enlightenment`**) with a **`Copy the prompt`** button:
     > *"Built only from `<oracle>`'s soul notes, learnings and the rules set for it. Paste it into Claude to get its character, voice and style, each claim quoted from a note."*
   - Below the prompt box, it surfaces **"Who it says it is"** (chronological `ψ/memory/resonance/` soul notes), **"THE WORDS ITS NOTES USE"** (vocabulary cloud extracted from the vault), and **"WHERE ITS NOTES ARE"** (bar breakdown of `memory/recovered`, `inbox`, `memory/learnings`, etc.).
2. **`Home` Tab**:
   - Fleet-wide sync status (`All in. 3 of 3 machines synced, searchable to 13 min ago, backed up 14 h ago`), total **Transcript Events (`7.37M` across `122,643` sessions)**, **Indexed (`1.15M` messages)**, **Embedded (`99.9%` / `1,146,857` vectors)**, `Searched most`, `Searched lately`, and per-machine sync table (`m5`, `white`, `mba`).
3. **`Map` Tab (`#tab=map`)**:
   - Interactive 3D / 2D semantic point cloud (`pca-3d of per-session mean vectors · unsloth_embeddinggemma_300m_806f5f90`, 768 dimensions) plotting `1k` / `3k` / `10k` sessions colored by repository.
4. **`Search` Tab (`#tab=search`)**:
   - Hybrid keyword (with inside-word Thai matching) + ANE-accelerated semantic vector search (`unsloth--embeddinggemma-300m@806f5f90` on Apple Neural Engine in `0.12–0.15 s`, fallback to MPS then keyword). Filters by layer (`Talk`, `Talk + tools`, `Talk + thinking`, `Memory notes`, `Git commits`, `Everything`), time window, speaker, machine, and repo.
5. **`Knowledge` Tab (`#tab=memory`)**:
   - Aggregates one-fact notes from every machine's `~/.claude/projects/*/memory` (`4,864` notes split into `rules`, `decisions`, `references`, `about Nat`, `notes`).
6. **`Live` Tab (`#tab=live`)**:
   - Real-time tail (`GET /api/tail` every 15s) across all machines with click-to-open modal showing full turn context and `relic5://YYYY-MM/<hash>` deep links.

