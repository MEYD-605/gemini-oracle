# 9router VPS & Fleet Model Configuration Notes

## 9router & Provider Key Pitfalls
- **Censored/Masked Token Subtitution Pitfall**: When inspecting or copying `CUSTOM_API_KEY` or auth tokens from dashboards or existing config files, be vigilant against truncated strings containing ellipsis (e.g. `sk-20a...131c`). Copying masked strings directly into `.env` causes authentication failures (e.g. invalid key length). Always query the actual database (`data.sqlite`) or generate a new raw token via 9router CLI.
- **Fleet-Wide Web Search Consistency**: Bo expects all fleet agent homes (`no1`, `no4`, `gmgrok`, `no5`, `maclab`) to have web search pre-configured to free keyless backends (e.g. `ddgs`) across their respective virtual environments without needing manual per-bot setup calls.
