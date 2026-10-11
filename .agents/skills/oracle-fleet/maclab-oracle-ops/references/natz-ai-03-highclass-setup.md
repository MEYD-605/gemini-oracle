# natz-ai-03 & 03-highclass Hermes Setup & 9router Integration

## Node Overview (natz-ai-03)
- **Host / IP:** `natz-ai-03` (`141.11.156.4`, CSNE IDC Bangkok).
- **Users:** `root`, `meyd` (sudoer).
- **Services:** `9router` (port 20128), `highclass-gateway.service`.

## 03-highclass Hermes Profile & Systemd Setup
- **Profile Directory:** `/root/.hermes-highclass`
- **Identity & Role:** No.3 HighClass Hermes Agent (`03-highclass`), Lead Researcher for Hermes Agent & ARRA Oracle Systems Integration. Repo: `high-class-oracle`. Buddy with `maclab:gmgrok` & `maclab:05-gmforge`.
- **Systemd Unit (`/etc/systemd/system/highclass-gateway.service`):**
  ```ini
  [Unit]
  Description=No.3 HighClass Hermes Gateway Service
  After=network.target

  [Service]
  Type=simple
  User=root
  Environment=HERMES_HOME=/root/.hermes-highclass
  Environment=PATH=/opt/hermes-venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  ExecStart=/opt/hermes-venv/bin/hermes gateway run
  Restart=always
  RestartSec=5

  [Install]
  WantedBy=multi-user.target
  ```

## 9router Custom Provider Configuration Pitfalls
1. **Valid 9router API Key Required:**
   In Hermes `config.yaml`, when setting `provider: custom` with `base_url: "http://127.0.0.1:20128/v1"`, passing a dummy string like `"sk-dummy"` triggers `HTTP 401: Invalid API key`.
   - **Fix:** Extract an active client key from 9router's SQLite DB (`/home/9router/.9router/db/data.sqlite`), table `apiKeys` (e.g. `SELECT key FROM apiKeys LIMIT 1;`). Pass that exact key in `providers.custom.api_key`.

2. **9router JSON Decoding / Truncation with Certain Models:**
   Some openrouter models (e.g. `openrouter/tencent/hy3`) or providers output leading whitespace or extra data chunks in 9router's response stream. When querying programmatically, parse JSON using robust parsers or `json.JSONDecoder().raw_decode()`.

3. **Discord Bot Token Typos (`MTQ7` vs `MTQ3`):**
   Discord tokens starting with `MTQ7...` instead of `MTQ3...` fail static login with `discord.errors.LoginFailure: Improper token has been passed. / 401 Unauthorized`. Always verify token prefixes before writing to `.env`.

## Tailscale & Firewall Security (UID Owner Isolation)
- **Tailscale Daemon:** Installed on `natz-ai-03`.
- **UID Firewall Rule (`iptables`):** To restrict Tailscale network & ARRA Oracle access to specific users, enforce UID-owner matching rules:
  ```bash
  iptables -N OUTPUT_TAILSCALE
  iptables -I OUTPUT -j OUTPUT_TAILSCALE
  iptables -A OUTPUT_TAILSCALE -m owner --uid-owner 0 -j ACCEPT     # root
  iptables -A OUTPUT_TAILSCALE -m owner --uid-owner 1005 -j ACCEPT  # meyd
  iptables -A OUTPUT_TAILSCALE -d 100.64.0.0/10 -j REJECT
  iptables -A OUTPUT_TAILSCALE -d 100.83.0.1 -j REJECT
  iptables-save > /etc/iptables/rules.v4
  ```
- **Result:** Users `root` (0) and `meyd` (1005) have full access to Tailscale and ARRA Oracle (`100.83.0.1:47778`), while other users (`nat`, `phaith`) are blocked from reaching Tailscale IPs.

## Claude Code CLI with 9router (SomBo pattern)
- When configuring Claude Code CLI to use 9router on remote nodes, set:
  - `ANTHROPIC_BASE_URL=http://127.0.0.1:20128/v1`
  - `ANTHROPIC_API_KEY=<valid_9router_key>`
  - `ANTHROPIC_MODEL=openrouter/tencent/hy3`
- Do NOT convert Claude Code CLI agents to Hermes profiles unless the user explicitly requests it.
