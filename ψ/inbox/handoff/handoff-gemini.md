### Session Handoff - 06-gemini (Recontext Reset)
- **Status**: Completed configuration fixes. Ready for context reset.
- **What was done**:
  1. **Dynamic Session Policy**: Updated `/root/maw-workspace/scripts/session-policy.sh` to dynamically clamp `hard_ceil` between **300k and 500k** based on the actual model window size (statusline).
  2. **1M Fallback Default**: Changed default fallback max context size from 200k to **1000k (1M)** because the fleet always runs large models, preventing incorrect 200k caps.
  3. **Config Cleanup**: Reverted redundant manual MCP servers from `/home/muk/.hermes/config.yaml` since they are already active globally.
  4. **Discord Comm**: Replied to Bo via direct API (`fetch` / `curl`), resolved the RAG/name spelling issue, and confirmed the auto-scale policy updates.
- **Next steps**:
  1. Wake up with a clean context (0%) via `/clear` and continue monitoring.
