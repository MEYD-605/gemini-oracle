# Soul-Brews-Studio Repo Landscape (verified 2026-08-12)

## Key repos (local clones at ~/Code/github.com/Soul-Brews-Studio/)

| Repo | Stars | Description | Status |
|---|---|---|---|
| `arra-oracle-v3` | 86 | Oracle MCP memory + search, Docker-first | Active (2 weeks ago) |
| `arra-oracle-skills-cli` | 116 | Install Oracle skills to 12+ AI agents | Active, Hermes support branch open |
| `maw-js` | 102 | Multi-agent CLI (tmux-based, engine-agnostic) | Active |
| `maw-rs` | 4 | Rust port of maw | Active (Discord gateway = dead code) |
| `multi-agent-workflow-kit` | 30 | tmux + git worktree multi-agent toolkit | Active |
| `oracle-framework` | 26 | Complete Claude Code framework | Active |
| `opensource-nat-brain-oracle` | 9 | Oracle Starter Kit | Reference |
| `nat-build-with-oracle` | 1 | flowengine (Raspberry Pi GPU visualizer) | Active |

## arra-oracle-v3 architecture (v26.7+ alpha branch)

- **Primary path**: Docker-first (`docker run ghcr.io/soul-brews-studio/arra-oracle-v3:http`)
- **Port**: 47778 (HTTP server)
- **MCP tools**: 32 tools, 11 plugins
- **Tool naming**: `oracle_*` canonical (retired: `muninn_*`, `arra_*` still aliased)
- **Vector backends**: cloudflare-vectorize, qdrant, sqlite-vec, none
- **Embedder backends**: cloudflare-ai, ollama, openai, gemini, none
- **Federation**: opt-in via `ORACLE_ENABLED_PLUGINS=federation`

## MCP plugin map (v3)

| Plugin | Tier | Key tools |
|---|---|---|
| `search` | core | `oracle_search`, `oracle_read`, `oracle_list` |
| `knowledge` | core | `oracle_learn`, `oracle_stats`, `oracle_supersede` |
| `session` | standard | `oracle_handoff`, `oracle_inbox` |
| `trace` | standard | `oracle_trace`, `oracle_trace_distill` |
| `dig` | standard | `oracle_trace_list`, `oracle_trace_get` |
| `standalone` | extra | `oracle_reflect`, `oracle_verify` |

## MEYD-605 fork notes

- `MEYD-605/arra-oracle-v3` has NO common ancestor with upstream — unrelated git histories
- Local fork is on `main` branch; upstream is `alpha` branch
- Update via `git fetch origin alpha && git reset --hard FETCH_HEAD` (not merge)
- Critical local patch: `fix(vectorize): use /info endpoint for accurate vector count` (CF Vectorize v2 specific)
- launchd manages server: `com.maclab.arra-cf` plist

## arra-oracle-skills-cli Hermes support (2026-08-12)

Branch: `copilot/add-hermes-agent-support`
Commits:
- `d6e137f feat: add Hermes Agent as supported install target`
- `b562739 Initial plan`

Status: not merged to alpha yet — monitor.
