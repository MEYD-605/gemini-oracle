# Soul-Brews-Studio/relic4-scan — Code Snippets (`2321_CODE-SNIPPETS.md`)

> **Target Repository**: `Soul-Brews-Studio/relic4-scan` (`v26.10.24-alpha.2025`)

---

## 1. CLI Entry Point & Subcommands (`src/main.rs:8-119`)

`relic-scan` provides 12 subcommands via `clap` derive macros:

```rust
#[derive(Parser)]
#[command(version, about = "Find and index every AI-agent transcript on this machine")]
struct Cli {
    #[command(subcommand)]
    cmd: Option<Cmd>,
}

#[derive(Subcommand)]
enum Cmd {
    /// Find every agent home (.claude, .claude_bak, .claudebak, .claude2, .codex …) and index its .jsonl files
    Scan { /* roots, depth, threads, json, index, exclude, full */ },
    /// Incremental: scan, then parse only new/grown/rewritten files from where they were left, then meta + map
    Run(RunArgs),
    /// One command: `run`, then serve the map and the tree on 127.0.0.1 (http://127.0.0.1:PORT/map · /tree)
    Up { #[command(flatten)] run: RunArgs, #[arg(long, default_value_t = 8787)] port: u16 },
    /// Serve OUT/meta/map.html on 127.0.0.1
    Serve { /* out, port, kind */ },
    /// Copy the sealed months and their seals to an S3-compatible store (AWS S3, Garage, MinIO)
    Export { /* out, kind, to, endpoint, region, dry_run, overwrite, verify, insecure_http, list */ },
    /// What the relic chain is doing right now: the pass in flight with its stages and ETA, running processes, the hub, the S3 job
    Ops { /* out, kind, json, watch, no_hub */ },
    /// Closed months and their seals (read-only files with the time, rows and key hash they were sealed at)
    Seals { /* out, kind, verify */ },
    /// The scan log: every index run and check (dry run) with what it found
    Log { /* out, kind, n, diff */ },
    /// Browse the sessions, repos and every .jsonl in the terminal
    Tui { /* out, kind */ },
    /// The month files + _state.tsv -> meta/files.parquet + meta/sessions.parquet
    Meta { /* out, agent, threads, kind */ },
    /// meta/sessions.parquet + meta/files.parquet -> meta/map.html
    Map { /* out, agent, kind */ },
    /// Parse every indexed file -> one Parquet file per Bangkok month
    Parse { /* index, out, agent, threads, jt_compat, only, keep_parts, all */ },
}
```

---

## 2. Blake2b-128 Hash-Chain Ledger (`src/ledger.rs:24-73`)

Every JSONL line's 64-bit hash `h` is folded into a 16-byte rolling hash chain (`Chain = [u8; 16]`). This lets `relic-scan` detect identical copies moved across folders/machines or resume appended files without re-parsing:

```rust
pub type Chain = [u8; 16];

/// The chain after one more line whose hash is `h`.
pub fn step(prev: &Chain, h: i64) -> Chain {
    let mut st = blake2b_simd::Params::new().hash_length(16).to_state();
    st.update(prev).update(&h.to_be_bytes());
    let mut c = [0u8; 16];
    c.copy_from_slice(st.finalize().as_bytes());
    c
}

/// One version of one file: where its lines had reached, and the ctx a parse resumes from there with.
#[derive(Clone, Debug, PartialEq)]
pub struct Version {
    pub first: i64,
    pub lines: i64,
    pub bytes: u64,
    pub chain: Chain,
    pub session: String,
    pub last_ms: Option<i64>,
    pub path: String,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Answer {
    Same(Version),      // Whole chain matches a known version -> skip parsing, mark copy_of
    Update(Version),    // Known version is a prefix -> seek to v.bytes and parse only the new tail
    PastChanged,        // First line known, but prefix diverged -> reparse whole file, keep old rows
    Never,              // First line never seen -> parse from byte 0
}
```

---

## 3. Bangkok (`UTC+7`) Timestamp Bucketing (`src/engine.rs:91-108`)

Every line is assigned to its own Bangkok month (`YYYY-MM.parquet`), preventing long multi-month sessions from skewing monthly shards:

```rust
pub struct Stamp {
    pub month: String, // "2026-10" or "undated"
    pub ts: String,    // UTC, 24 chars, Z
    pub ts_th: String, // +07:00
}

pub fn stamp(ms: Option<i64>) -> Stamp {
    let Some(ms) = ms else { return Stamp { month: "undated".into(), ts: String::new(), ts_th: String::new() } };
    let u = DateTime::from_timestamp_millis(ms).unwrap_or_default();
    let b = DateTime::from_timestamp_millis(ms + 7 * 3600 * 1000).unwrap_or_default();
    let f = format!(".{:03}", ms.rem_euclid(1000));
    Stamp {
        month: format!("{:04}-{:02}", b.year(), b.month()),
        ts: format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}{f}Z", u.year(), u.month(), u.day(), u.hour(), u.minute(), u.second()),
        ts_th: format!("{:04}-{:02}-{:02}T{:02}:{:02}:{:02}{f}+07:00", b.year(), b.month(), b.day(), b.hour(), b.minute(), b.second()),
    }
}
```

---

## 4. Relic 5 Chain Stage Monitor (`src/ops.rs:101-135`)

`relic-scan ops` tracks the 5-stage pipeline connecting local `relic-scan` to the `relic5` hub (`scan` $\rightarrow$ `extract` $\rightarrow$ `push to the hub` $\rightarrow$ `hub index + embed` $\rightarrow$ `sync check`):

```rust
let flags = [p.scan.is_some(), p.extract.is_some(), !p.push.is_empty(), p.end.is_some(), checked];
let cur = flags.iter().position(|d| !d).unwrap_or(5);
let names = ["scan", "extract", "push to the hub", "hub index + embed", "sync check"];

/// What a `ps` line is, when it is part of the relic chain.
pub fn what(cmd: &str) -> Option<&'static str> {
    [("relic-scan run", "scan"), ("relic-extract run", "extract"), ("relic5-push", "push"), ("relic5 index", "hub index (on white)"),
     ("relic-scan export", "S3 export"), ("relic5 embed", "embed"), ("local/bin/relic-chain", "chain")]
        .iter().find(|(k, _)| cmd.contains(k)).map(|(_, w)| *w)
}
```
