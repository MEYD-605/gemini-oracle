# Gotcha: Cloudflare Remote Config Overrides Local config.yml

**Date**: 2026-06-04
**Audit Target**: Cloudflare Tunnel `oracle-homelab`
**Confirmed Behavior**: Remote config on Cloudflare Zero Trust Dashboard overrides local `/etc/cloudflared/config.yml` completely.

---

## 🔍 The Investigation Findings
จากการดึงประวัติการบูตล่าสุดของ `cloudflared` (PID 3874287) พบว่าตัว daemon ดึงและอัปเดตการตั้งค่าแบบ Remote-managed (`Updated to new configuration version=16`) ส่งผลให้ไฟล์ `config.yml` ที่เราจัดระเบียบในเครื่องไม่มีผลต่อการเราต์ทราฟฟิกจริง

พบความแตกต่างที่สำคัญอย่างยิ่งระหว่าง **Local config (ในเครื่อง)** กับ **Remote config (ที่รันอยู่จริงบนคลาวด์)**:

| Hostname | Local config.yml (ชี้ในเครื่อง) | Remote Config on Cloud (ทำงานจริง) | Status / Impact |
|----------|--------------------------------|------------------------------------|-----------------|
| **webhook.clubsxai.com** | `http://localhost:8765` | `http://localhost:8080` | ⚠️ **ไม่ตรงกัน**: ส่งทราฟฟิกไปผิดพอร์ตหากเปลี่ยนมาใช้ 8765 |
| **imac.clubsxai.com** | `http://100.80.0.3:6080` | `http://100.83.0.12:6080` | ⚠️ **ไม่ตรงกัน**: บนคลาวด์ยังชี้ไปที่ IP `.12` แทนที่จะเป็น `.3` |
| **fleet.clubsxai.com** | (ไม่มีในเครื่อง) | `http://localhost:8190` | ℹ️ **มีเฉพาะบน Cloud** |
| **n8n.clubsxai.com** | `http://localhost:5678` | `http://localhost:5678` | ✅ ตรงกัน |
| **velaa.clubsxai.com** | `http://localhost:8091` | `http://localhost:8091` | ✅ ตรงกัน |

---

## 🛠 Action Plan / Solution
1. **การแก้ไขการเราต์พอร์ตจริง**: ต้องกระทำผ่าน **Cloudflare Zero Trust Dashboard** ➔ Tunnels ➔ `oracle-homelab` ➔ Configure ➔ Public Hostnames เท่านั้น
2. **การทำ Local Sync**: แม้ว่า local config.yml จะไม่มีผลต่อทราฟฟิกจริง แต่เราควรบันทึกหรือทำคอมเมนต์ระบุในไฟล์ local `/etc/cloudflared/config.yml` ว่า **"Managed remotely via Cloudflare Dashboard - Do not edit locally"** เพื่อไม่ให้เอเจนต์หรือมนุษย์ในอนาคตสับสน
