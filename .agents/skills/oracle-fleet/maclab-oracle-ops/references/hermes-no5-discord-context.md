# Hermes no5 — Discord context & tool diet (GmForge)

**Profile:** `~/.hermes-no5` · **Gateway:** Discord DM Bo (`sessions.json` key `agent:main:discord:dm:…`)

## Session control (slash commands)

| Command | Effect | Discord DM |
|---------|--------|------------|
| `/new` `/reset` | Fresh session (no long history in prompt) | ✅ |
| `/clear` | New session + clear screen | ❌ CLI only |
| `/compress` | Manual context compression | ✅ |
| `/usage` `/status` | Tokens / session info | ✅ |

`compression` in config (threshold ~0.5) **does not replace** `/new` on very long DMs.

**Prove session bloat:** `~/.hermes-no5/sessions/sessions.json` → `last_prompt_tokens`, `is_fresh_reset`; `hermes sessions list`.

## Baseline prompt (always, even after `/new`)

```bash
export HERMES_HOME=~/.hermes-no5
hermes prompt-size --platform discord
```

Typical (2026-07-02): ~26 KB system + **~61 KB tool schemas (29 tools)** + ~8.5 KB skills index + memory/user profile.

## Inventory (run before diet)

```bash
export HERMES_HOME=~/.hermes-no5
hermes tools list
hermes mcp list
```

## GmForge No.5 — keep vs drop

**Keep:** file, terminal, web, skills, memory, session_search, clarify, vision · MCP **arra-oracle**, **discord-reply**

**Drop for DM audit/map (after Bo GO):**

- MCP **playwright** (largest MCP bloat)
- Toolsets: `browser`, `computer_use`, `delegation`, `code_execution`, `image_gen`, `x_search`, `tts`, `cronjob` (optional: keep `todo`)

Bo media uses **Grok terminal** / **xai-video-one.py** / **No.8 Ultra** — not Hermes `image_generate`.

## Config snippet (`~/.hermes-no5/config.yaml`)

```yaml
agent:
  disabled_toolsets:
    - browser
    - computer_use
    - delegation
    - code_execution
    - image_gen
    - x_search
    - tts
    - cronjob
```

Remove or comment the entire `playwright:` block under `mcp_servers:`.

**Restart gateway** after edit (`HERMES_HOME=~/.hermes-no5`). Re-run `hermes prompt-size --platform discord`.

## Living doc mirror (repo)

`cartographer-oracle/ψ/data/LIVING-DOCS/hermes-no5-tool-diet.md` — same inventory; update both when maclab config changes.