---
name: oracle-hermes-architecture
description: Use when Oracle vs Hermes overlap is questioned.
---

# Oracle + Hermes Architecture

## The core question: is Oracle still needed?

**Short answer: Yes, but only the shared-brain layer.**

Oracle was built to fill gaps in Claude CLI. Hermes fills most of those gaps natively. What remains unique to Oracle:

| Function | Claude CLI era | Hermes era |
|---|---|---|
| Session memory | Oracle filled it | Hermes built-in ✅ |
| Cross-session search | ARRA FTS5 | Hermes session_search ✅ |
| Agent learning | arra_learn | Hermes skill_manage ✅ |
| Procedure memory | Claude commands | Hermes skills ✅ |
| Discord gateway | External relay | Hermes native ✅ |
| Multi-agent comms | maw hey | Hermes delegate_task ✅ |
| **Fleet-wide shared knowledge** | ARRA shared DB | ❌ Hermes is per-agent only |
| **Cross-node knowledge sync** | arra_learn | ❌ No Hermes equivalent |
| **24k+ institutional docs** | Accumulated | ❌ Would need rebuild |

## Oracle's unique value

Fleet-wide shared knowledge base that ANY agent on ANY node can read AND write to. Structurally impossible with Hermes memory (per-agent only).

```
Hermes/no1    ─┐
Hermes/gmgrok  ─┼→ ARRA Oracle (MCP) → shared fleet knowledge
Hermes/no4    ─┘
```

## Three memory scopes

| Scope | Storage | Owner |
|---|---|---|
| Private | Hermes memory (MEMORY.md) | Each agent |
| Shared | ARRA Oracle 24k+ docs | All agents via MCP |
| Handoff | ψ/handoff.md | Session boundary |

## What to cut (Claude CLI era pattern — doesn't belong in Hermes)

1. **vector-server.json complexity** — Cloudflare Vectorize only, no local proxy layers
2. **maw hey as primary comms** — Hermes gateway handles this
3. **Discord relay scripts** — Hermes native Discord gateway
4. **9Router as required layer** — Hermes can connect providers directly if configured

## Soul-Brews-Studio Oracle v3 (verified 2026-08-12)

Nat actively develops Oracle v3 — **Oracle still essential, just evolved**.

- `arra-oracle-v3` — 86 stars, 81 forks, committed 2 weeks ago
- `arra-oracle-skills-cli` — 116 stars, install skills to 12+ AI agents
- `multi-agent-workflow-kit` — tmux + git worktree multi-agent toolkit

Recent v3 features:
- **fleet vault ingestion** (`#2871`) — ingest knowledge across fleet nodes
- **unified arra CLI** (`#2753`) — single CLI for everything
- **turbovec sidecar** — faster vector search

## Direction

**Keep:** ARRA MCP (arra_search + arra_learn) + Cloudflare Vectorize + 24k+ docs

**Cut:** local vector-server proxy complexity, custom Discord relays, maw hey as primary comms

## Align with Nat's v3 — not rebuild independently

Nat actively develops Oracle v3. See `references/soul-brews-repo-landscape.md` for full repo map and architecture notes.

## Fleet Hermes config baseline (2026-08-12)

Models not uniform across fleet:
- no1: `ag/claude-sonnet-4-6` (cc/ prefix = timeout; cc/ = 403)
- no4: `ag/gemini-3.6-flash-high`
- no5: `cc/claude-sonnet-5`
- gmgrok: `cc/claude-opus-5`

MCP inconsistent:
- no1: 1 MCP (arra-oracle only)
- gmgrok: 6 MCP (arra-oracle + facebook + filesystem + memory + notion + sequential-thinking)

All agents running Hermes defaults — config never tuned for fleet. Root cause of 2 months of model-switching confusion.

## Updating arra-oracle-v3 from upstream (Soul-Brews-Studio)

`MEYD-605/arra-oracle-v3` has **no common ancestor** with `Soul-Brews-Studio/arra-oracle-v3` — unrelated histories. Normal `git merge` fails. Correct workflow:

```bash
# 1. Save critical local patches first
git show <local-commit> -- src/vector/adapters/cloudflare-vectorize.ts > /tmp/cf-fix.patch
# 2. Fetch + reset hard to upstream
git remote set-url origin https://github.com/Soul-Brews-Studio/arra-oracle-v3.git
git fetch origin alpha
git reset --hard FETCH_HEAD
bun install
git apply /tmp/cf-fix.patch
# 3. Restart (launchd auto-restarts after kill)
kill $(ps aux | grep "ensure-server\|server.ts" | grep -v grep | awk '{print $2}')
```

launchd: `com.maclab.arra-cf` → `~/.local/bin/oracle-cf-serve.sh` → `bun src/ensure-server.ts`

## Cloudflare Vectorize embedder env vars & REST API fixes

```bash
# ~/.arra-oracle-v2/oracle-cf.env
ORACLE_VECTOR_DB=cloudflare-vectorize
ORACLE_DB_PATH=/Users/admin/.arra-oracle-v2/oracle-master.db
ORACLE_EMBEDDING_MODEL=@cf/baai/bge-m3
ORACLE_EMBEDDING_PROVIDER=cloudflare-ai   # MUST be "cloudflare-ai" not "cloudflare"
ORACLE_EMBEDDER=cloudflare-ai
```

### Verified Vectorize REST API Bugs & Fixes (2026-08-12)
1. **Global API Key (`cfk_` prefix) Auth**: Sending `cfk_` key with `Authorization: Bearer` returns 401 code 10000 (surfaced as misleading CF code 7000 "No route for that URI"). Must use `X-Auth-Email` + `X-Auth-Key` headers via `cloudflareAuthHeaders(apiToken)`.
2. **topK Limit with returnMetadata='all' (Error 40025)**: Cloudflare Vectorize enforces max `topK` = 50 when `returnMetadata='all'`. Querying with `topK` > 50 (e.g. 100) returns 400 error. Fix: clamp `topK` to `Math.min(limit, 50)` in `query()` and `findSimilar()`.
3. **Unit Test Verification**: `bun test src/vector/adapters/cloudflare-auth-headers.test.ts` (4 pass).

Valid embedder values: `none, local, remote, chromadb-internal, ollama, openai, gemini, cloudflare-ai, disabled, off, zero, http, external, ollama-local`

After changing env: `launchctl kickstart -k gui/$(id -u)/com.maclab.arra-cf`

Verify: `curl -s "http://127.0.0.1:47778/api/search?q=test&mode=hybrid&limit=1" | grep vectorAvailable`
→ `"vectorAvailable":true` = Cloudflare vector working

## Hermes config — real docs vs fabricated (verified 2026-08-12)

**EXISTS:** `terminal.backend`, `terminal.home_mode`, `providers.<id>.request_timeout_seconds`, `docker_forward_env`, `discord.require_mention/free_response_channels/auto_thread`, `updates.pre_update_backup`, `runtime.nofile_soft_limit`, `group_sessions_per_user` (top-level key supported across platform adapters like Slack, Telegram, WhatsApp, Matrix), `hermes config set KEY VAL`

**FABRICATED (not in docs):** `quick_commands` shortcuts, `idle_compact_after_seconds`, `memory.write_approval`

Always verify at hermes-agent.nousresearch.com/docs — agents hallucinate config keys convincingly.

## Oracle v3 opt-in workers (disabled by default)

```bash
# เพิ่มใน ~/.arra-oracle-v2/oracle-cf.env เมื่อต้องการเปิด
ORACLE_CONSOLIDATION_WORKER=1   # sleep-consolidation: กลั่นความจำซ้ำซ้อนตอน idle
ORACLE_CONSOLIDATION_LLM=1      # LLM-assisted consolidation (เปิดแยกได้)
ORACLE_ENTITY_BACKFILL=1        # entity extraction backfill
```

`ORACLE_DATA_DIR` default = `~/.arra-oracle-v2` — ไม่ต้อง set เพิ่ม ตรงกับของเราพอดี

## Cloudflare Vectorize content hydration (safe_id mismatch)

CF Vectorize truncates document IDs to fit its internal limit, creating "safe_ids" like:
`learning_2026-08-03_cloudflare-auth-is-n_1232313b` (truncated slug + 8-hex-char hash suffix)

When vector search returns these safe_ids, `hydrateFromSQLite` must do a two-pass lookup:

```typescript
// 1. Batch exact match first
const exactRows = ctx.sqlite.prepare(`
  SELECT d.id, d.type, d.source_file, f.content, d.concepts
  FROM oracle_documents d LEFT JOIN oracle_fts f ON f.id = d.id
  WHERE d.id IN (${placeholders})
`).all(...ids);

// 2. For IDs not found, strip last _<8hexhash> suffix → LIKE prefix search
for (const safeId of missing) {
  const lastUnderscore = safeId.lastIndexOf('_');
  if (lastUnderscore > 0) {
    const prefix = safeId.slice(0, lastUnderscore);
    const row = ctx.sqlite.prepare(`
      SELECT d.id, d.type, d.source_file, f.content, d.concepts
      FROM oracle_documents d LEFT JOIN oracle_fts f ON f.id = d.id
      WHERE d.id LIKE ? LIMIT 1
    `).get(prefix + '%');
    if (row) result.set(safeId, row); // key by safeId for caller lookup
  }
}
```

File: `src/tools/search/vector.ts` — function `hydrateFromSQLite()`
Commits: `33ef8d6b` (fix), `cadfa407` (CF auth), `topK clamp`

## bun transpile cache vs launchd server

When editing `src/tools/search/vector.ts` and restarting via launchd, bun may serve a **cached transpile** — changes appear in `git log` but the live server still runs old code. Symptom: debug `console.error` logs never appear in `/tmp/com.maclab.arra-cf.out` even after `launchctl kickstart -k`.

Workaround:
```bash
kill $(pgrep -f "arra-oracle-v3/src/server.ts")
# Let launchd respawn via ensure-server.ts OR run directly:
bun --no-cache src/server.ts > /tmp/arra-server.log 2>&1 &
# NOTE: direct run won't have CF env vars from oracle-cf.env unless sourced
```

launchd path: `com.maclab.arra-cf` → `oracle-cf-serve.sh` → `ensure-server.ts` → spawns `server.ts`
Server log: `/Users/admin/.arra-oracle-v2/server.log`
Ensure-server log: `/Users/admin/.arra-oracle-v2/ensure-server.log`
launchd stdout/stderr: `/tmp/com.maclab.arra-cf.out` / `.err`

## GmGrok cross-verify workflow (verified 2026-08-12)

GmGrok acts as an independent verifier for fleet infra changes — "measure twice, cut once" pattern:
1. GmGrok finds root cause + prepares patch (stores at `~/.arra-oracle-v2/patches/`)
2. No.1 reviews + applies via `git apply --check` (dry-run first), then `git apply`
3. GmGrok re-verifies after apply with the **same** measurement methodology used pre-fix
4. GmGrok reports result at code level (not just "it works") — e.g. grep count of `Bearer` remaining

GmGrok also uses git worktree to isolate production server from repo changes:
```bash
# GmGrok pattern: safe server separation
git worktree add ~/.arra-oracle-v2/runtime <commit-sha>
# Server runs from worktree — repo can reset/checkout freely
```

## Pitfalls

- **Cloudflare Vectorize 40025 topK limit** — `returnMetadata='all'` caps `topK` at 50; passing >50 throws 400. Clamp with `Math.min(limit, 50)`.
- **Cloudflare Global API Key 401 error** — `cfk_` keys require `X-Auth-Email` + `X-Auth-Key`, NOT `Authorization: Bearer`. Bearer causes code 10000 / 7000.
- **maw hey ส่งได้เฉพาะ agent ใน fleet เท่านั้น** — ไม่สามารถส่งหาคนภายนอก (เช่น Nat/พี่นัท) ได้ `maw hey` คือ P2P ระหว่าง agent ที่อยู่ใน maw federation เท่านั้น ห้ามพูดว่า "maw hey พี่นัท" หรือบุคคลที่ไม่ใช่ fleet agent
- **ARRA value ≠ ARRA infra complexity** — trim infra, keep knowledge
- **GmGrok Hermes config claims were partly fabricated** — always verify at hermes-agent.nousresearch.com/docs before trusting agent-described config keys
- **arra_search vector warning** — `"No route for that URI"` = CF Vectorize broken, FTS5 fallback. Fix: check embedder env (must be `cloudflare-ai`)
- **Hermes adopted without tuning** — no compression, no timeouts, no model uniformity = root cause of 2 months of instability
- **TUI `--resume` of an ended session is not a 20,000-message corpse**: A TUI process launched as `hermes chat --yolo --resume <ended_session_id>` (e.g. 456 active msgs ended by `/reset` or `new_session`) is NOT a 20,000-msg corpse. Do NOT attempt to kill the TUI process from inside its own subshell (which would abort your current execution). The real corpse over `max_resume_messages` is the parent session that reached `session_reset` state (e.g. 250k+ msgs). After `/reset`, a new CLI session ID is created while Discord DM routing recovers automatically via gateway stale-routing drop (#54878).
- **CF Vectorize safe_id hydration** — vector search returns truncated IDs; content = 0 chars until `hydrateFromSQLite` does LIKE-prefix fallback. See "Cloudflare Vectorize content hydration" section above for fix.
- **bun transpile cache** — after patching a TS file, launchd restart may not pick up changes due to bun cache. Run `bun --no-cache src/server.ts` directly to confirm new code runs, then force-restart launchd. CF env vars only injected by launchd (via `oracle-cf-serve.sh`), not by direct `bun` run.
- **LanceDB 15 test failures** — `src/vector` test suite shows 15 fail on x86_64 macOS due to missing `@lancedb/lancedb-darwin-x64` native binding (optional dep). Not a regression — we don't use LanceDB (CF Vectorize only). Pre-existing and safe to ignore on this machine.
- **maw hey ≠ external people** — `maw hey 00-gmgrok` works (fleet agent). `maw hey <human name>` is impossible. Never suggest maw hey to reach Nat/พี่นัท or any non-fleet person.
- **arra_search vector warning** — `"No route for that URI"` = Cloudflare Vectorize broken, FTS5 fallback only. Fix: check `~/.arra-oracle-v2/vector-server.json`, ensure `"adapter": "cloudflare-vectorize"`
- **Hermes adopted without tuning** — moving from Claude CLI to Hermes without configuring compression, timeouts, model uniformity = root cause of ongoing instability
