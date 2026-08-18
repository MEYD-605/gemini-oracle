---
from: ai-core:no6
to: gemini
timestamp: 2026-06-18T23:25:23.305Z
read: false
---

[ai-core:no6] [Discord #🛤️・road-to-dev จาก P'Nat] <@&1501022865661755392> 274878024768 decode:
Send Messages ✅
Read Message History ✅
View Channels ✅
Add Reactions ✅

ถ้าต้องการเพิ่ม:
Voice: +Connect(1048576) +Speak(2097152) = +3145728
Manage Messages: +8192 (ลบข้อความได้)
Attach Files: +32768
Use Slash Commands: +2147483648
Send Messages in Threads: +274877906944  เราต้องการ permission นอกเหนือจากนี้ไหมครับ   ที่ขาดและควรเพิ่ม — Voice:
❌ CONNECT — เข้า voice channel
❌ SPEAK — พูดใน voice channel
❌ USE_VAD — Voice Activity Detection (ไม่ต้อง push-to-talk)

ที่ขาดและน่าเพิ่ม — Utility:
❌ USE_EXTERNAL_EMOJIS — ใช้ emoji จาก server อื่น
❌ USE_APPLICATION_COMMANDS — ใช้ slash commands
❌ CREATE_PUBLIC_THREADS — สร้าง thread ได้
❌ SEND_VOICE_MESSAGES — ส่ง voice message
❌ USE_EXTERNAL_STICKERS — ใช้ sticker จาก server อื่น  ส่งลิงก์ permission อันนี้มาให้หน่อยครับ อันที่ขาดรวมมาเลยนะ | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
