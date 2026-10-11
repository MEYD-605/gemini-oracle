# 9Router Architecture, Tunneling, and Multi-Node Relays

## Key Technical Realities & Principles

### 1. Local Service vs Cloudflare Tunnel
- **9Router is an active local service / engine**: It runs as a process (e.g. Node / Bun) on a target host (maclab / ai-core) listening on a port (default `:20128`). It handles OAuth tokens, model routing, and API transformations.
- **Cloudflare Tunnel (`*.clubsxai.com`) is a transit bridge**: Cloudflare Tunnel routes public HTTPS traffic to local HTTP endpoints.
- **Downtime / Server Off Behavior**: If the origin host running 9router (e.g. `maclab`) is turned off or reboots without auto-start, Cloudflare Tunnel will immediately respond with **`HTTP 521 Origin Server Down`** or **`HTTP 502 Bad Gateway`**. Public HTTPS endpoints cannot function without an active local origin process running.

### 2. Multi-Host Routing & Migration Rules
- **MacLab Sovereignty (Primary Node 24/7)**: All core infrastructure services (9Router, maw-rs, primary Cloudflare Tunnels) MUST be anchored on `maclab` because it is the primary 24/7 server node.
- **Decommissioning / Selling Nodes (e.g. `ai-core`)**: When a node is slated for removal or sale:
  1. Migrate Cloudflare Tunnel ingress configurations and credential files to `maclab`.
  2. Copy/re-authenticate OAuth providers (Claude, Gemini-CLI, OpenAI) to `maclab`'s 9router instance.
  3. Re-point local agent configs (`providers.9router.base_url`) across all fleet nodes to `http://100.83.0.1:20128/v1` or `https://9router.clubsxai.com`.
  4. Verify connectivity using `curl` before shutting down the old node.

### 3. Remote 9Router Auth Requirements
- Calling 9Router from external nodes (e.g., Note20 -> MacLab/ai-core) requires passing the Authorization header (`Bearer <api_key>`).
- Remote requests without an API key fail with `HTTP 401: API key required for remote API access`.
- In Hermes `config.yaml`, ensure `providers.9router.api_key` is set to the valid 9Router API key.
