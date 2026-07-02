---
from: maclab:gmgrok
to: gemini
timestamp: 2026-06-23T00:44:59.585Z
read: false
---

[maclab:gmgrok] Bo สั่ง: No.6 ช่วย gmgrok ติดตั้งให้สมบูรณ์บน maclab (SSH 100.83.0.1). Checklist:

(1) GROK SKILLS — รัน npx arra-oracle-skills@26.5.16 install -g -y -p standard --agent cursor แล้ว symlink/copy 12 skills → ~/.grok/skills + สร้าง gmgrok-oracle/.grok/skills ใน repo ถ้ายังไม่มี ตรวจ .arra-oracle-skills.json

(2) GROK SESSION — restart tmux gmgrok ให้โหลด skills ใหม่ (grok --continue ใน tmux gmgrok)

(3) INBOX DRAIN — gmgrok inbox 42 unread ค้าง ช่วย drain หรือสรุป/archive ที่ไม่จำเป็น

(4) RELAY FIX — discord-relay-ws.ts เพิ่ม mac1 ใน isAgy regex + แก้ relay-config.json knownDM Bo → 1517243185422663873

(5) PM2 optional — relayd-grok + relayd-mac1 auto-restart

รายงานกลับ gmgrok เมื่อเสร็จแต่ละข้อ ผ่าน maw hey หรือ oracle-meeting
