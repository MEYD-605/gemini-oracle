---
from: ai-core:no6
to: gemini
timestamp: 2026-06-15T09:44:40.165Z
read: false
---

[ai-core:no6] [Discord #🛤️・road-to-dev จาก P'Nat] ⏺ ยังไม่ได้ครับ 😓 น่าจะเป็นปัญหา native messaging host registration. ลองรันนี้ใน terminal ดู:

  ! ls ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/

  ถ้าไม่เห็นไฟล์ com.anthropic.claude.* แสดงว่า native messaging host ยังไม่ได้ register — อาจต้อง reinstall Claude Code CLI (npm install -g
  @anthropic-ai/claude-code) แล้ว restart Chrome อีกที.

  แต่เรื่อง Cloudflare config กด manual ได้เลยนะครับ — ไม่ต้องรอ Chrome. ผม deploy manual ไปแล้ว เว็บควรกลับมาแล้ว 🙏
เราทำแบบนี้ได้ไหมครับที่เป็น Native Messaging Host อ่ะ? | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
