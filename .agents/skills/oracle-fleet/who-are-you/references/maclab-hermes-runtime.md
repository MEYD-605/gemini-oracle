# maclab Hermes + maw-rs runtime (Bo fleet)

## Priority order (Bo 2026-07-02)

1. **constructor + infea** — fix CONSTRUCTURE/legacy/relay/git mess (**blocking**)
2. Draft roadmap: `cartographer-oracle/ψ/data/MACLAB-RUNTIME-ROADMAP-DRAFT.md`
3. Pilot **No.5** gateway via maw-rs, then Core5 team + home pillars

Do not skip Phase 0 to migrate everyone to Hermes.

## Target stack

- **Runtime default:** Hermes profile per NN · `grok-composer-2.5-fast` default · user can switch models inside Hermes
- **Fleet gateway:** `maw-rs serve` (:3456) — route/hey/identity; Discord ingress should land here, not parallel native+relay
- **Knowledge:** arra MCP (`127.0.0.1:47778` on maclab) — not a global `oracle` CLI in PATH
- **Sovereign files:** `*-oracle/ψ/` per agent; Arra indexes, does not replace ψ

## GmForge No.5 (this DM lane)

| Field | Value |
|-------|--------|
| Fleet | `[maclab:05-gmforge]` |
| Canonical repo | `MEYD-605/cartographer-oracle` (`gmforge-oracle` = pointer) |
| Hermes | `~/.hermes-no5` |
| Role | Blueprint + audit + drift — **not** home EXEC (gmgrok `00-gmgrok`) |
| Reports | `maclab:01-lord-knight` only; Bo when tagged |
| Discord state | `~/.claude/channels/discord-no0` (legacy dir name) |

**Prove on disk before claims** — paths, `pgrep`, `lsof`, git status on maclab.

## Gateway gap (common)

- `~/.maw/no5-use-native-discord` present → Hermes **native** Discord; rust `discord-relay` keepalive **skipped**
- Target: remove flag after maw-rs route proves DM loop
- Status file: `maw-workspace/agents/discord-rust-status.json`

## Greenfield vs bud

- **New human:** Hermes-first OK — no need to merge legacy `.claude`/`.grok` dirs first
- **`maw bud`:** still creates repo+ψ; awaken picks engine (`-e hermes|grok|claude` via maw-rs later)

## Tmux (must match friends)

Core5 expects session **`05-gmforge`** in `tmux ls` — same pattern as `00-gmgrok`, `01-lord-knight`, `04-mimo`, `08-agy-nano2`. If missing, run `ψ/tools/no5-tmux-ensure.sh` in cartographer-oracle. Details: `/recap` → `references/maclab-fleet-tmux-core5.md`.

## Session storage (target, not yet unified on disk)

```
~/Oracle/sessions/{claude,grok,hermes/<profile>}
```

Read merge today: `~/.grok/skills/dig/scripts/dig-run.sh` — see `references/maclab-dig-parity.md` under `/recap`.