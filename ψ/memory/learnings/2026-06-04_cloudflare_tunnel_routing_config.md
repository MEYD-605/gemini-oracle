# LXC 110 Cloudflare Tunnel & Ingress Routing Configuration

**Updated**: 2026-06-04 01:35 (Local Time)
**Tunnel Name**: `oracle-homelab`
**Tunnel ID**: `a36154a5-09c4-430c-bec7-36d0ca0a74e3`
**Service Path**: `/etc/systemd/system/cloudflared.service`
**Config Path**: `/etc/cloudflared/config.yml` (Systemd active config)
**Duplicate Config**: `/root/.cloudflared/config.yml` (Stale / missing some routes)

---

## 🛰 Active Connection Status
- **Connector ID**: `87fdd3db-883d-41cd-8869-ce8efb99bb54`
- **Uptime**: Active since `2026-06-02T17:30:13Z`
- **Origin Public IP**: `184.22.34.148`
- **Edge Data Centers**: Connected to `1xbkk03` (Bangkok), `1xbkk07` (Bangkok), and `2xsin13` (Singapore)
- **Version**: `2026.3.0` (Warning: Outdated, recommended upgrading to `2026.5.2`)

---

## 🛣 Ingress Routing Map (Inbound Traffic)

Traffic coming into Cloudflare under `*.clubsxai.com` is routed to the following local services:

| Domain | Target Origin Service | Associated Local Port / Node |
|--------|-----------------------|------------------------------|
| **oracle.clubsxai.com** | `http://localhost:47778` | Arra Oracle HTTP API Server |
| **maw.clubsxai.com** | `http://localhost:3456` | MAW-JS workflow engine |
| **studio.clubsxai.com** | `http://localhost:3100` | Oracle Studio Dashboard |
| **n8n.clubsxai.com** | `http://localhost:5678` | n8n workflow engine |
| **webhook.clubsxai.com** | `http://localhost:8765` | WebSocket custom relay |
| **velaa.clubsxai.com** | `http://localhost:8091` | Velaa static site Caddy proxy |
| **macmini.clubsxai.com** | `http://100.101.102.82:6080` | Mac Mini (Tailscale VNC web client) |
| **vnc.clubsxai.com** | `http://localhost:6080` | Local VNC web client proxy (novnc) |
| **imac.clubsxai.com** | `http://100.80.0.3:6080` | iMac Kubuntu (Tailscale VNC web client) |
| **dash.clubsxai.com** | `http://localhost:3200` | Tmux Fleet Viewer Dashboard |
| **(fallback)** | `http_status:404` | Default HTTP 404 return |

---

## ⚠️ Notes & Observations
1. **Config Discrepancy**: ไฟล์ `/root/.cloudflared/config.yml` เป็น config ฉบับเก่าที่ขาด 4 hostnames สำคัญ (`n8n`, `velaa`, `vnc`, `imac`) เวลาทดสอบการเปลี่ยน config ต้องแก้ที่ `/etc/cloudflared/config.yml` และรัน `systemctl restart cloudflared` เท่านั้น
2. **Context Canceled Warnings**: ใน journal logs พบข้อผิดพลาด `Incoming request ended abruptly: context canceled` สำหรับ API `/widgets/glances` และ `/api/ping` ซึ่งเกิดจากเบราว์เซอร์ของ client ปิดหน้าต่างกะทันหันระหว่างส่งข้อมูล ไม่ใช่ความขัดข้องของ network routing
