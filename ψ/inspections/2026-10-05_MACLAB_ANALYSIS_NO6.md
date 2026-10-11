# MacLab Remediation & Deep Inspection Report — 2026-10-05
**Auditor**: No.6 Gemini (Research Specialist & Pack Leader) `[maclab:no6]`  
**Requested by**: No.8 (Field Medic) & Master Bo (16:01 Urgent Directive)  
**Target Host**: MacLab (Apple Silicon / macOS)  
**Reference**: `lord-knight-oracle/ψ/inspections/2026-10-05_no6-maclab-remediation.md`  

---

## 1. Executive Summary

1. **Python Processes ฟังพอร์ตแปลกๆ**: **ไม่ใช่ภัยคุกคาม** 7 ใน 8 พอร์ตเป็นเซอร์วิสหลักของระบบ MacLab (Glances, HAOS Proxy, No.4 Facebook Webhook, Portal, No.4 Hermes, Homepage UI) มีเพียง **Port 8808 (PID 87448)** พอร์ตเดียวที่เป็นโปรเซสตกค้าง (Orphan Uvicorn) จากการทดสอบใน `/private/tmp/ws08` เมื่อวันที่ 23 ก.ย.
2. **`~/Desktop` บวม 26GB**: **ไม่ใช่ขยะ!** เป็นไฟล์ภาพถ่ายดิบ **Sony Alpha RAW (`.ARW`)** และคลิปวิดีโอรวม 25.9 GB ที่ทีมงานนำเข้าจากกล้องมาพักไว้ **ห้ามลบทิ้งเด็ดขาด (ห้าม `rm -rf`)** แนะนำให้ย้ายไปจัดเก็บบน NAS หรือ External Archive
3. **`/private/tmp` มีไฟล์ค้าง 334+ รายการ (>3 วัน)**: รวมขนาด ~1.0 GB พบว่าเป็น Unix Sockets Dummy (`zeb_def_ipc_*`) ขนาด 0 ไบต์จำนวน ~280 ไฟล์ และโฟลเดอร์ Test Workspaces ชั่วคราวของเอเจนต์ที่ทำงานจบไปแล้ว (`ws08`, `oct2_candidates`, `pstack-review` ฯลฯ)
4. **Token Openclawdweb หมดอายุ**: โทเคนหมดอายุจริงตั้งแต่วันที่ 2026-09-30 โดยไม่ได้ถูกใช้งานมาตั้งแต่ 23 มิ.ย. 2026 (ไม่มีผลกระทบต่อระบบปัจจุบัน) พร้อมตรวจพบโทเคน Tunnel เก่าที่ไม่ได้ใช้งานอีก 6 รายการ

---

## 2. Port Mapping

| Port | PID | Process / Binary | Working Directory / Script | Status | Action Plan |
|---|---|---|---|---|---|
| **61208** | 1252 | `/usr/local/bin/glances` | System daemon (`-w -t 15 -p 61208`) | **Legitimate** (Glances Web UI) | คงไว้ตามปกติ |
| **61209** | 1253 | `python3.14` | `/Users/admin/bin/glances-maclab-proxy.py` | **Legitimate** (MacLab Glances Proxy) | คงไว้ตามปกติ |
| **61211** | 1258 | `python3.14` | `/Users/admin/bin/glances-haos-proxy.py` | **Legitimate** (HAOS Glances Proxy) | คงไว้ตามปกติ |
| **8080** | 1254 | `python3.14` | `facebook-mcp-server/webhook_server.py` | **Legitimate** (No.4 MIMO Facebook Webhook) | คงไว้ตามปกติ |
| **3458** | 75814 | `python3.14` | `/Users/admin/bin/portal_server.py` | **Legitimate** (MacLab Web Portal) | คงไว้ตามปกติ |
| **8644** | 75840 | `python3.14` (venv) | `hermes_cli.main gateway run --replace` | **Legitimate** (No.4 Hermes Gateway) | คงไว้ตามปกติ |
| **3200** | 23484 | `node` (next-server) | `gethomepage/homepage/.next/standalone` | **Legitimate** (Homepage Dashboard) | คงไว้ตามปกติ |
| **8808** | **87448** | `python3.14` (uvicorn) | `/private/tmp/ws08/repo_git/.../no1-lord-knight/web` | **❌ STALE ORPHAN!** (รันค้างตั้งแต่ 23 ก.ย.) | **Kill PID 87448 ทันที** |

---

## 3. Desktop Breakdown (26GB)

```
26G    /Users/admin/Desktop
├── 11G    /Users/admin/Desktop/test          -> Sony Alpha RAW (.ARW) เช่น DSC01625.ARW - DSC01654.ARW
├── 7.2G   /Users/admin/Desktop/28-9-2026     -> Sony Alpha RAW (.ARW) เช่น DSC04887.ARW - DSC04901.ARW
├── 6.2G   /Users/admin/Desktop/21-09-2026    -> Sony Alpha RAW (.ARW) เช่น DSC04570.ARW - DSC04584.ARW
└── 1.5G   /Users/admin/Desktop/Clubs2022.mov -> วิดีโอบันทึกกิจกรรม Clubs
```

⚠️ **Action**: ห้ามลบเด็ดขาด ย้ายเข้า NAS หรือ Archive เท่านั้น

---

## 4. `/private/tmp` Cleanup Strategy

1. Kill PID 87448 (`uvicorn` port 8808)
2. Prune obsolete test workspaces: `ws08`, `oct2_candidates`, `oct2_thumbs`, `pstack-review`, `9r-test`, `QUO`, `agp-review`
3. Delete stale `zeb_def_ipc_*` socket files (> 3 days old)
4. Protect active sockets: `herdr.sock`, wine sockets, launchd sockets, agent communication files
