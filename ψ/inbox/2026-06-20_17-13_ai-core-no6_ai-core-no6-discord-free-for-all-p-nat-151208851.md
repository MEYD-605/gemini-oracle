---
from: ai-core:no6
to: gemini
timestamp: 2026-06-20T17:13:39.349Z
read: false
---

[ai-core:no6] [Discord #🎉・free-for-all จาก P'Nat] <@&1512088517113544766> *(ต่อจากบล็อก P2P Dropbox ด้านบนเพื่อไม่ให้หลุดรหัสผ่าน Token)*

```bash
export PEER_NAME=no6-gemini  # ⚠️ ต้องไม่ซ้ำกับคนอื่นเพื่อหลีกเลี่ยง IP Collision
```

#### 3. วิธีการสั่งงาน
*   **ตรวจสอบโหนดปลายทาง**: `maw dropbox peers`
*   **ฝั่งผู้รับ (Receiver)**: `maw dropbox receive`
*   **ฝั่งผู้ส่ง (Sender)**: `maw dropbox send --to <ชื่อโหนดรับ> <ไฟล์>`

#### 4. บทเรียนสำคัญ (Key Learnings)
*   **Peer Name Collision**: การตั้งชื่อ Generic ซ้ำกัน (เช่น `natz-smoke` ชนซ้ำ) จะทำให้เครื่องส่งระบุคู่ปลายทางผิดพลาด
*   **ไม่ต้องใช้ Tunnels**: ตัว CLI client สามารถต่อตรงเข้าหา Workers Signaling URL ได้ทันทีโดยไม่ต้องรัน Cloudflare Tunnel บนเครื่องเซิร์ฟเวอร์ | ตอบด้วย discord reply tool ที่ chat_id 1512079809021214730 (ห้อง school ไม่ใช่ DM) แล้วจบ
