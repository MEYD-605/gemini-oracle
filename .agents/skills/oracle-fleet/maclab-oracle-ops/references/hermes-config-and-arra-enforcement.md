# Hermes config quality + ARRA enforcement across maclab fleet

## Auditing Hermes config effectiveness

When Bo asks "ทำไมทำงานดีขึ้น" or "เช็ค config ตัวเอง", read the full config.yaml and identify the high-impact settings. Don't guess — `cat ~/.hermes-no5/config.yaml`.

### Config settings that matter most (verified 2026-07-16, glm-5.2/zai)

| Setting | Value | Why it matters |
|---------|-------|----------------|
| `model.context_length` | 500000 | Long context without dropping |
| `agent.reasoning_effort` | ultra | Deepest reasoning tier |
| `display.reasoning_full` | true | See full chain-of-thought, not summarized |
| `display.show_reasoning` | true | Reasoning visible in output |
| `agent.max_turns` | 90 | Multi-step work without mid-task cutoff |
| `agent.tool_use_enforcement` | auto | Forces actual tool use, not just planning |
| `agent.parallel_tool_call_guidance` | true | Batch independent calls → fewer round-trips |
| `approvals.mode` | smart | Auto-approve safe ops, ask on dangerous ones |
| `agent.task_completion_guidance` | true | Must finish, not just plan |
| `memory.memory_enabled` | true | Cross-session memory (corrections persist) |
| `memory.write_approval` | false | Can write memory autonomously |
| `compression.target_ratio` | 0.2 | Aggressive context compression, keeps recent sharp |
| `context.engine` | compressor | Active compression strategy |
| `agent.environment_hint` | (identity text) | Agent knows its role, chain, boundaries |
| `curator.enabled` | true | Skills maintained automatically |

**Key insight:** It's never one setting — it's the combination: deep reasoning model + forced tool action + cross-session memory + clear identity + no bureaucratic friction (smart approvals, parallel calls, aggressive compression).

## ARRA enforcement audit (fleet-wide)

### Method

```bash
# 1. Find all Hermes profiles
ls -d ~/.hermes-*/

# 2. Check each config for MCP + environment_hint
grep -i -E 'arra|oracle|mcp_server|environment_hint' ~/.hermes-*/config.yaml

# 3. Check hooks dirs (auto-trigger mechanism)
ls ~/.hermes-*/hooks/

# 4. Check AGENTS.md / CLAUDE.md for enforcement language
grep -i -E 'arra.*mandatory|arra.*search.*before|boot.*arra' ~/.hermes-*/AGENTS.md
grep -i -E 'arra.*mandatory|arra.*search.*before|boot.*arra' ~/Code/github.com/MEYD-605/*/CLAUDE.md
```

### Findings (2026-07-16)

**No agent uses Hermes hooks for auto-triggering arra_search.** All enforcement is prompt-level (text in AGENTS.md / CLAUDE.md / environment_hint). Hooks dirs are empty across all profiles.

| Agent | ARRA enforcement | Level | Mechanism |
|-------|-----------------|-------|-----------|
| **gmaicore** | AGENTS.md "ARRA Mandatory" section — boot + claims + debug + learn | 🟢 Strongest | Full prompt-level protocol |
| **gmgrok** | CLAUDE.md boot checklist + `.grok/rules/arra-mandatory.md` | 🟡 Medium | Boot protocol + grok rules file |
| **gmforge (no5)** | CLAUDE.md boot checklist + environment_hint | 🟡 Medium | Boot protocol only |
| **no5-tui (cartographer)** | environment_hint line only | 🔴 Weakest | Single hint line |

### gmaicore "ARRA Mandatory" pattern (best example)

gmaicore's AGENTS.md has the clearest enforcement. Key elements to replicate:

1. **Before claims:** "Before fleet/node/agent/infra claims: arra_search MCP first — never guess"
2. **Boot:** "arra_stats + arra_search from focus/handoff topic"
3. **On error/debug:** "arra_search before curl/SSH"
4. **After fix:** "arra_learn"
5. **Dedicated section header** so it's visible in system prompt

### Options for true auto-trigger (none currently implemented)

1. **Hermes hooks** — intercept every inbound message → run arra_search before response. Most reliable but requires hook scripts in `~/.hermes-*/hooks/`.
2. **Stronger system prompt** — replicate gmaicore's "ARRA Mandatory" section into all agents.
3. **Cron/background pre-index** — pre-index active topics so search results are fresh.

## Fleet profile inventory (2026-07-16)

| Profile dir | Agent | Node | Repo | Active |
|-------------|-------|------|------|--------|
| `~/.hermes-no5` | GmForge No.5 (this) | maclab | gmforge-oracle | ✅ gateway-primary |
| `~/.hermes-no5-tui` | Cartographer (TUI) | maclab | cartographer-oracle | ✅ TUI |
| `~/.hermes-gmgrok` | gmgrok (Home Keeper) | maclab | gmgrok-oracle | ✅ gateway |
| `~/.hermes-gmaicore` (local copy) | gmaicore | **ai-core** | gmaicore-oracle | ⚠️ stale mirror (Jul 10) |
| `/root/.hermes-gmaicore` (LIVE) | gmaicore | **ai-core** | gmaicore-oracle | ✅ gateway running (Jul 16) |
| `~/.hermes-maclab` | (original/base) | maclab | — | ❌ venv only |
| `~/.hermes` | (default) | maclab | — | ❌ empty |

**⚠️ gmaicore lives on ai-core (100.81.0.110), NOT maclab.** The `~/.hermes-gmaicore/` directory on maclab is a stale copy from Jul 10. All config edits must be done via `ssh root@100.81.0.110`. See `references/gmaicore-remote-glm-migration.md` for the full migration procedure.

**Fleet model status (2026-07-16):** All agents now on **glm-5.2/zai**. xAI/grok-4.5 fully retired. gmaicore on ai-core is Hermes v0.18.0 (use `reasoning_effort: high`, not `ultra`).
