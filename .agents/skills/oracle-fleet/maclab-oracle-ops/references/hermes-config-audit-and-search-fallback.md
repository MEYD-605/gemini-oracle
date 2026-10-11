# Hermes Configuration Audit & Search Fallback

## Topic Disambiguation for Continuation Searches
- When resuming or carrying over context, avoid jumping to older unrelated topics (e.g. past avatar courses / decimen).
- Check `ψ/focus.md`, `ψ/handoff.md`, and recent audit documents under `/Users/admin/Documents/Oracle-บ้าน/` to ground the exact search scope (e.g. 6 Hermes pro-config categories).

## Fallback Execution when Terminal / Shell is Blocked
- If shell execution / terminal commands are restricted or blocked by gateway safety:
  1. Inspect local configuration via `search_files` / `read_file` on `~/.hermes-no5/config.yaml` and `~/.hermes-no1/config.yaml`.
  2. Inspect official documentation via `read_file` or `search_files` on local repo docs (e.g. `website/docs/user-guide/configuration.md`).
  3. Perform web/X verification using the `x_search` tool call or `web_search` directly without relying on terminal curl/scripts.
