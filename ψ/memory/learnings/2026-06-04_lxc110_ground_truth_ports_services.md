# LXC 110 Ground-Truth Ports & Running Services

**Updated**: 2026-06-04 01:30 (Local Time)
**Node**: ai-core (LXC 110)
**Scanning Tool**: ss, systemctl

---

## 🔌 Sockets & Listening Ports (TCP)

| Port | Process / Service | Description |
|------|-------------------|-------------|
| **22** | `sshd` | Secure Shell Server (SSH access) |
| **80** | `tailscaled` | Tailscale Web Services |
| **139 / 445** | `smbd` | Samba file sharing (SMB) |
| **1883** | `mosquitto` | MQTT Broker (Council bridge) |
| **2019** | `caddy` | Caddy Local API port |
| **3100** | `bun` | Oracle Studio Dashboard |
| **3200** | `next-server` | Next.js server (Tmux Fleet Viewer / Web UI) |
| **3456** | `bun` | **MAW-JS Multi-Agent Workflow** |
| **5173 / 3457** | `node` | Vite Dev Server (MAW-UI Office) |
| **5901** | `Xtigervnc` | TigerVNC Server (Display :1) |
| **6080** | `websockify` | noVNC WebSocket Proxy |
| **6379** | `redis-server` | Redis Database |
| **8081** | `docker-proxy` | Docker redirect port (Homepage Dashboard) |
| **8090** | `pocketbase` | OracleNet PocketBase (Local DB) |
| **8091** | `caddy` | Caddy Reverse Proxy |
| **8093** | `node` | Homelab Stats WebSocket server |
| **8095** | `docker-proxy` | Docker redirect port |
| **8190** | `node` | Velaa Longevity website |
| **8200** | `tailscaled` | Tailscale Local API |
| **8474** | `bun` | **JC3248 Fleet Feed HTTP Server** |
| **8644** | `python` | Telemetry Stats / System Logger |
| **9222** | `docker-proxy` | Chrome debug port |
| **11435** | `python3` | **OpenVINO Embedding Server** (`bge-m3` on iGPU - Vector Search) |
| **20241** | `cloudflared` | Cloudflare Tunnel client daemon |
| **38501 / 45019** | `agy` | **Antigravity CLI Agent** background processes |
| **47778** | `bun` | **Arra Oracle HTTP API Server** (Drizzle DB/Dopelab API) |
| **47780** | `bun` | Custom backend server |
| **61208** | `glances` | Glances System Monitor Web API |

---

## ⚙️ Active Systemd Services (Running)

1.  **`arra-oracle.service`**: Arra Oracle HTTP API Server (พอร์ต `47778`)
2.  **`no6-discord-relay.service`**: **No.6 SuperNovice Discord inbound relay** (poll DMs -> maw hey 06-gemini)
3.  **`maw-js.service`**: **MAW-JS Multi-Agent Workflow** (พอร์ต `3456`)
4.  **`maw-ui.service`**: MAW-UI Office (Vite dev server)
5.  **`fleet-feed.service`**: JC3248 Fleet Feed HTTP Server (พอร์ต `8474`)
6.  **`homelab-stats-ws.service`**: LXC 110 telemetry WS server for JC3248 Rust dashboard (พอร์ต `8093`)
7.  **`homepage.service`**: Homepage Dashboard (พอร์ต `8081`)
8.  **`maw-audit-broadcast.service`**: Fleet audit log → Discord `#oracle-meeting` broadcaster
9.  **`mosquitto.service`**: Mosquitto MQTT Broker (พอร์ต `1883`)
10. **`novnc.service`**: noVNC WebSocket Proxy (พอร์ต `6080`)
11. **`openvino-embedding.service`**: **OpenVINO Embedding Server** (Vector Search, พอร์ต `11435`)
12. **`oracle-mqtt-bridge.service`**: Oracle Council MQTT-Discord Bridge
13. **`oracle-studio.service`**: Oracle Studio Dashboard (พอร์ต `3100`)
14. **`oraclenet.service`**: OracleNet PocketBase (พอร์ต `8090`)
15. **`tigervnc.service`**: TigerVNC Server (พอร์ต `5901`)
16. **`tmux-fleet-viewer.service`**: Tmux Fleet Viewer (พอร์ต `3200`)
17. **`velaa-web.service`**: Velaa Longevity static website (พอร์ต `8190`)
18. **`cloudflared.service`**: cloudflared tunnel
19. **`glances.service`**: Glances System Monitor (พอร์ต `61208`)
20. **`tailscaled.service`**: Tailscale Node Agent
21. **`caddy.service`**: Caddy Reverse Proxy
