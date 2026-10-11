# maclab Hermes gateway ops (Bo / No.5)

> Session detail for `/recap`, audit, Bo DM troubleshooting. Canonical EXEC docs live in `cartographer-oracle/ψ/data/`.

## Three layers (Bo target topology)

| Layer | Role | maclab today |
|-------|------|----------------|
| Headless gateway | Discord ingress + agent loop | `launchd` `ai.hermes.gateway` · `HERMES_HOME=~/.hermes-no5` |
| tmux `hermes` | maw reader / inbox loop | Often missing — EXEC spawns |
| tmux `hermes-chat` / `05-gmforge` | TUI sees conversation | `hermes chat` — **must resume** Discord session key, not fresh CLI session |

**DM session key:** `agent:main:discord:dm:<chat_id>` in `~/.hermes-no5/state.db`.

## S8 fleet picker (not sequential 1–4)

```bash
bash ~/.maw/tmux-selector.sh 05   # gmforge | no5 | cartographer
```

Trap: `4` ≠ No.5 — use **`05`**.

## Rust vs Python gate (common Bo confusion)

| Has RS? | What |
|---------|------|
| Yes | `maw-rs serve :3456`, `discord-reply-mcp` outbound |
| No (yet) | Discord **ingress** — still Hermes Python gateway until Phase 2 |

Target: `ψ/data/phase2-hermes-mawrs-wiring-plan.md`, `TARGET-hermes-maw-discord-native.md`.

## HERMES_HOME collision (P0 symptom)

Gateway + tmux `hermes chat` on **same** `HERMES_HOME` → logs:

- `Agent cache invalidated … possible cross-process write`
- `final stream delivery not confirmed`

**Prove Discord path:** `tail ~/.hermes-no5/logs/gateway.log` · MCP `discord-reply` one-line prove · ask Bo if `prove outbound` visible.

**Do not** assert "DM works" without delivery proof.

## Bo says GO (GmForge lane)

1. Write `ψ/inbox/handoff/YYYY-MM-DD_bo-go-*.md` with P0/P1 checklist.
2. `maw hey maclab:01-lord-knight` (seal) + `maw hey maclab:00-gmgrok` (EXEC).
3. Update `ψ/focus.md` → `EXEC-QUEUED`.
4. **No.5 does not** restart `:3456`, cutover gateway, or cargo on maclab.

## Buddy No.1

Draft/audit in `ψ/data/` → No.1 seal → gmgrok execute. Silent to Bo unless tagged or DM thread (Bo personal lane).

## Hermes docs (operator)

https://hermes-agent.nousresearch.com/docs/user-guide/messaging/discord

Learn hub: `ψ/learn/NousResearch/hermes-agent/hermes-agent.md`