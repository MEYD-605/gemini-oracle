# 9router & Cloudflare Fleet Provider Realities

## 1. Local Node `maw hey` Delivery
When running on `maclab`, sending `maw hey maclab:00-gmgrok` fails with:
`hey: refusing to deliver — 'maclab:00-gmgrok' addresses this node via its own cross-node name and resolved back to a local pane`

**Fix:** Use plain local target `maw hey 00-gmgrok "<msg>"` when operating locally on maclab.

## 2. Live Agent Monitoring via Tmux
When asking another local agent (e.g. `00-gmgrok`) a question via `maw hey`, do not rely solely on the initial delivery receipt. Monitor the live thinking/tool execution in tmux:
```bash
tmux capture-pane -t 00-gmgrok:0 -p 2>&1 | tail -n 25
```
Sleep in intervals (6-10s) until the target agent finishes its reasoning and outputs the final response.

## 3. Cloudflare $5/mo Subscription vs 9router LLM Routes
- **Cloudflare $5/mo:** Applies to Workers Paid Plan (Vectorize vector storage & bge-m3 embeddings).
- **9router Models:** Routes through `http://127.0.0.1:20128/v1/models` and serves GLM, Gemini, Claude, AG, and CX models. Cloudflare Workers AI models are NOT automatically mounted as LLM routes in 9router unless explicitly configured.
