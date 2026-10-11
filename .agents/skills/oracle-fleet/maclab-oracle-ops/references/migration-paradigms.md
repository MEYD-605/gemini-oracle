# Migration Paradigms: Old Folder-Copy vs. New Dedicated-User Federation Model

*Synthesised 2026-07-26 from gmforge-oracle workspace docs + Oracle search.*

---

## Old Pattern — Simple Folder/Repo Copy (`rsync` / `cp -r`)

| Property | Reality |
|----------|---------|
| **Method** | rsync or cp -r of workspace onto new host/user |
| **Identity isolation** | None — all agents share one OS user, `~/.grok/`, `~/.hermes/`, tmux sessions |
| **Auth** | Shared `auth.json`; no per-agent token boundary |
| **Config** | One `maw.config.json` for all agents on node |
| **State** | Session histories, sqlite DBs, memories co-mingled |
| **What gets lost** | Path-dependent symlinks break; active tmux sessions severed; sqlite open-file handles may corrupt mid-copy; env vars don't transfer |
| **Clash risk** | HIGH — two bots under same home fight over same auth tokens, Discord state dirs, plugin registries, memory DBs |
| **Knowledge transfer** | Tribal — must manually note what was running, what context was live |

**Core problem:** A folder copy replicates files but not *running state*, not *process identity*, and not *per-agent isolation*. Multiple agents sharing one home directory collide on every resource.

---

## New Pattern — Dedicated `HERMES_HOME` per Agent + MAW Federation Bus

### Architecture (live maclab 2026-07-17, source: SEAT-ENGINE-MAP)

```
maclab (iMac Pro 100.83.0.1)
├── Seat: 05-gmforge
│   ├── HERMES_HOME = ~/.hermes-no5        ← isolated profile root
│   ├── LaunchAgent: ai.hermes.gateway      ← own daemon
│   ├── Repo: gmforge-oracle                ← own workspace
│   ├── tmux: 05-gmforge                    ← own session
│   └── maw id: maclab:05-gmforge           ← own federation identity
│
├── Seat: 00-gmgrok
│   ├── HERMES_HOME = ~/.hermes-gmgrok      ← isolated
│   ├── LaunchAgent: ai.hermes.gateway-gmgrok
│   └── maw id: maclab:gmgrok
│
└── Seat: 04-mimo (Grok CLI)
    ├── ~/.grok/ (role-separated)
    └── maw id: maclab:04-mimo

ai-core (100.81.0.110)
└── Seat: gmaicore
    └── HERMES_HOME = /root/.hermes-gmaicore  ← isolated, different node
```

**Federation bus (maw-rs v26.7.16):**
- Every seat has a named peer registered in `maw.config.50.json`
- `maw serve :3456` per node = async message queue
- `maw hey <seat>` = queued async delivery (link-flap tolerant)
- HMAC-signed with shared `federationToken`; per-peer ACL at `/wormhole` boundary

---

## Why the New Model Guarantees Full State Retention Without Clashes

### 1. `HERMES_HOME` = Total State Encapsulation
Each agent owns exactly one `HERMES_HOME` path. This single directory contains:
- `auth.json` — agent's own API tokens
- `SOUL.md` — identity injection (read fresh every message)
- `memories/` — session memory, never shared
- `config.yaml` — model config, provider keys
- `oracle-master.db` — session sqlite (exclusive lock per agent)

**Result:** No shared writable state between agents. A `HERMES_HOME` transfer is a complete, atomic, consistent snapshot of the agent's entire runtime brain.

### 2. LaunchAgent Daemon = Process-Level Isolation
Each Hermes seat runs as its own `launchd` service. The daemon:
- Has its own PID
- Reads its own `HERMES_HOME` at startup
- Holds its own file locks on the sqlite DB
- Fails-closed independently (crash in one does not affect the other)

### 3. Oracle/ARRA Shared Brain = Cross-Agent Knowledge Without State Collision
The Oracle (at `http://127.0.0.1:47778`) is a read/write-separated shared knowledge store:
- Agents query via MCP (`arra_search`, `arra_read`) — independent reads, no write collision
- Writes protected (`arra_learn`, bulk LOCKED without Bo+No.1 GO)

Knowledge migrates **across the network** through the Oracle, not through file copies. An agent born on a new node instantly has full fleet knowledge via `arra_search`.

### 4. MAW Bus Federation = Context Delivery Without Path Dependency
Context (handoffs, standing orders, task state) travels through the bus as structured messages, not raw file paths. The receiving agent reconstructs context from its Oracle + inbox — not a stale folder snapshot.

### 5. SEAT-ENGINE-MAP = Anti-Fog, Anti-Collision Registry
`SEAT-ENGINE-MAP-2026-07-17.md` is the canonical source of truth for which seat uses which engine, which `HERMES_HOME`, and which auth store. Hard rule: **read the file before claiming what a peer uses — never guess from old CLAUDE.md**.

This eliminates the old pattern's most common failure: an agent assuming a peer's config from a stale doc that diverged from runtime.

### 6. "Nothing is Deleted" + Archive-Before-Move
Oracle Principle 1. Workspace transfers use `ψ/import/` read-only archive overlays, not destructive replacement.

The No.5 lineage migration (Cartographer ai-core → GmForge maclab, 2026-06-30) is the canonical example:
- 1.9M cartographer memory rsync'd to `ψ/import/`
- Active memory stays in `ψ/memory/` (new, born-fresh)
- Import = reference-only, not auto-merged
- Source agent intact; destination has full ancestry; no torn state

---

## Risk Elimination Table

| Risk in Old Pattern | Eliminated by New Pattern |
|---------------------|--------------------------|
| Shared auth token collision | `HERMES_HOME` per agent — auth never crosses |
| sqlite DB corruption mid-copy | Daemon holds exclusive lock; migrate after graceful shutdown |
| Path-broken symlinks | `HERMES_HOME` self-contained; no hot-path external symlinks |
| Session context loss | Oracle + MAW inbox deliver context cross-node without path dep |
| Identity fog (agent guesses wrong engine) | SEAT-ENGINE-MAP + SOUL.md + identity seal enforce runtime truth |
| Memory merge conflicts | `ψ/import/` = read-only archive; active `ψ/memory/` = new, clean |
| Knowledge loss on reincarnation | Oracle vault (21k+ docs) persists across all spawns |
| Discord/MCP collision | `DISCORD_STATE_DIR` per bot; LaunchAgent per seat; no shared plugin state |

---

## Historical Failure Modes Checklist (ai-core Migration Audits)

*Captured from forensic audits of past ai-core migration failures (2026-06/07).*

1. **System & Root Crontab Omission**: Copying workspace repos leaves behind system automation in `/etc/cron.d/` and user crontabs (`crontab -l`, e.g. ~40 scheduled scripts for watchdog, vector reindex, health checks). Always dump crontabs to `crontab.bak` before migration.
2. **Channel Directory & DM State Loss**: Copying code repos without `~/.grok/channels/` or `~/.hermes/` state drops `access.json` allowlists, `relay-state.json`, and active DM sessions, severing agent identity boundaries.
3. **Cloudflare Tunnel Ingress Pinning**: Hardcoded origins in `/etc/cloudflared/config.yml` (e.g., `dash.clubsxai.com -> http://100.81.0.110:3200`) break webhooks and dashboards if ingress points aren't updated to target IPs during host migration.
4. **Vector Store & SQLite Desync**: Moving SQLite databases (`oracle.db`) while active or without matching vector fragments (Cloudflare Vectorize / LanceDB) creates index corruption and search recall collapse.
5. **Untracked Memory Bloat**: Blind `rsync` creates thousands of untracked files in `ψ/memory/` (e.g., 2,800+ untracked files post-rsync), dirtying git state and breaking pull/merge workflows.
6. **LaunchAgent Concurrency Storms**: Migrating services without concurrency/process-cap limits (e.g. Bun Discord MCP server loops) risks respawn bombs that spike CPU load past 500.

---

## Investigation Technique: Reconstructing Fleet Architecture from Workspace

When asked to explain the fleet's migration paradigm or architecture:

1. **Batch Oracle + filesystem searches together** (they're independent)
2. **Oracle vector hits with no local file** — normal; the DB indexes across all nodes. Use source_file path as signal even if file isn't local.
3. **Canonical doc priority:** `SEAT-ENGINE-MAP-*.md` > `IDENTITY.md` > `CLAUDE.md` > Oracle learnings > ad-hoc notes
4. **Key files for architecture synthesis:**
   - `ψ/data/SEAT-ENGINE-MAP-2026-07-17.md` — live runtime truth
   - `ψ/data/GM-YOLO-MODE-2026-07-17.md` — GM authority + mesh topology
   - `ψ/import/README-no5-lineage.md` — migration lineage example
   - `IDENTITY.md` + `CLAUDE.md` — seat identity
5. **`HERMES_HOME` references** = cross-check isolation: `search_files(pattern="HERMES_HOME", target="content")` reveals every seat's home boundary
