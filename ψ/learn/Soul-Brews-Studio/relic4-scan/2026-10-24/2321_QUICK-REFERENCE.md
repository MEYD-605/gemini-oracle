# Soul-Brews-Studio/relic4-scan & relic5 — Quick Reference (`2321_QUICK-REFERENCE.md`)

> **Target Repository**: `Soul-Brews-Studio/relic4-scan` (`v26.10.24-alpha.2025`) & `https://relic5.buildwithoracle.com/` (`v26.10.24-alpha.2308`)

---

## 1. What It Does

- **`ARRA Relic Scan` (`Soul-Brews-Studio/relic4-scan`)**: Free, open-source (`AGPL-3.0`) Rust CLI + Tauri desktop app that finds every AI-agent transcript on a machine (`.claude`, `.codex`, `.omp`, `.omx`, `.gemini`, `.pi`, `.thclaws`) and every `ψ` vault, incrementally indexes them into monthly Parquet files (`~/.relic-scan/YYYY-MM.parquet`), and serves an offline local web UI (`127.0.0.1:8787`) and TUI.
- **`relic5` (`https://relic5.buildwithoracle.com/`)**: Private-alpha self-hosted central hub that receives monthly transcript pushes from every machine on a private network, deduplicates messages across machines, builds keyword + semantic vector indexes, renders a 3D/2D semantic session map, displays `ψ` memory notes as pages, and exposes MCP tools for agents.

---

## 2. Installation (`relic-scan`)

```bash
# Option A: Build from source via installer script (requires Rust 1.89+; installs to ~/.local/bin/relic-scan)
curl -fsSL https://raw.githubusercontent.com/Soul-Brews-Studio/relic4-scan/main/install.sh | sh

# Option B: From local checkout with just
git clone https://github.com/Soul-Brews-Studio/relic4-scan && cd relic4-scan
just install
```

Desktop releases (`v26.10.24-alpha.2025`):
- macOS Apple Silicon: `ARRA-Relic-Scan_26.10.24-alpha.2025_macos-arm64.dmg`
- macOS Intel: `ARRA-Relic-Scan_26.10.24-alpha.2025_macos-x64.dmg`
- Linux x86_64: `.deb` and `.AppImage`

---

## 3. Core CLI Commands

```bash
relic-scan run --dry-run        # Preview what files/bytes would be read (writes nothing)
relic-scan run                  # Incremental scan + parse + meta + map into ~/.relic-scan
relic-scan up                   # Run incremental index, then serve UI on http://127.0.0.1:8787
relic-scan tui                  # Interactive terminal UI (Ratatui)
relic-scan ops --watch          # Live status of the 5-stage relic5 chain, processes, hub & S3 job
relic-scan seals --verify       # Re-read every closed (sealed) month and verify its key hash
relic-scan log -n 20            # View scan history log (_scans.jsonl)
```

### S3 Export Commands (AWS S3 / Garage / MinIO)
```bash
export RELIC_S3_ENDPOINT=http://odin.follow-rankine.ts.net:3920
# Credentials in ~/.config/relic-scan/s3.env (chmod 600) or environment
relic-scan export --to s3://bucket/relic --dry-run
relic-scan export --to s3://bucket/relic
relic-scan export --to s3://bucket/relic --verify
relic-scan export --to s3://bucket/relic --list
```

---

## 4. Querying Local Parquet Files with DuckDB

```bash
cd ~/.relic-scan

# Count total rows across all monthly shards
duckdb -c "select count(*) as all_rows from '*.parquet'"

# Breakdown by row type (user, assistant, thinking, call, result)
duckdb -c "select coalesce(nullif(kind, ''), nullif(role, ''), '(none)') as what, count(*) as n from '*.parquet' group by 1 order by n desc"

# Breakdown by agent engine (claude, codex, omp, thclaws, gemini, ...)
duckdb -c "select engine, count(*) as n from '*.parquet' group by 1 order by n desc"

# API calls and output tokens per model, per month
duckdb -c "select left(ts_th, 7) as month, model, count(distinct msg_id) as calls, sum(out_tokens) as out_tokens from '*.parquet' where model is not null group by all order by month, calls desc"
```

---

## 5. `relic5` Hub MCP Tools (for Agents)

When a machine registers the `relic5` MCP server, agents can query the cross-machine hub using:
- `relic_search`: Keyword or semantic vector search (`{"query": "...", "semantic": true, "horizon": "1m"}`)
- `relic_show`: Fetch a specific message (`relic5://YYYY-MM/...`) and its surrounding turns (`before` / `after`)
- `relic_sessions`: List sessions filtered by repository and time window
- `relic_session`: Read all turns of a single session
- `relic_status`: Inspect hub inventory and per-machine sync freshness
