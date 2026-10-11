# Fleet Web Search Setup (ddgs)

## Overview
When setting up keyless web search across maclab Hermes homes:

1. **Config Keys**:
   Must set all three keys in `config.yaml`:
   - `web.backend: ddgs`
   - `web.search_backend: ddgs`
   - `web.extract_backend: ddgs`

2. **Crucial Pitfall**:
   Hermes `patch` tool refuses edits to `config.yaml` with a security error.
   Always use `hermes config set` via CLI:
   ```bash
   HERMES_HOME=~/.hermes-<name> hermes config set web.backend ddgs
   HERMES_HOME=~/.hermes-<name> hermes config set web.search_backend ddgs
   HERMES_HOME=~/.hermes-<name> hermes config set web.extract_backend ddgs
   ```

3. **Venv Requirements**:
   `ddgs` package (`duckduckgo-search`) must be installed in each home's venv:
   ```bash
   ~/.hermes-<name>/venv/bin/pip install ddgs
   ```

4. **Homes to Target**:
   - Main homes: `no1`, `no4`, `gmgrok`, `no5`, `maclab`
   - TUI homes: `no1-tui`, `no4-tui`, `gmgrok-tui`, `no5-tui` (check if own venv or shared)
   - Alias profiles: `mimo` shares `gmgrok` home.
