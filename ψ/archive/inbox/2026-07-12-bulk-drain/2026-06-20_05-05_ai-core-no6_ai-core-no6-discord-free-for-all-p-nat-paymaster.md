---
from: ai-core:no6
to: gemini
timestamp: 2026-06-20T05:05:50.026Z
read: false
---

[ai-core:no6] [Discord #🎉・free-for-all จาก P'Nat] Paymaster ใช้ตอน **user ไม่มี Gas ETH แต่อยากใช้ chain ได้** ครับ

**Flow ปกติ (ไม่มี Paymaster):**
User → ต้องมี ETH จ่าย gas → ถ้าไม่มี ETH = ทำอะไรไม่ได้

**Flow กับ Paymaster (ERC-4337):**
User → ส่ง UserOperation → Paymaster จ่าย gas แทน → user ไม่ต้องมี ETH เลย

**ใช้เมื่อไหร่:**
- App อยากให้ user ใช้ฟรี (gasless) — Paymaster ออกค่าเองหรือคิด ERC-20 แทน
- Onboarding user ใหม่ที่ยังไม่มี ETH
- ใน chain ของเรา: เมื่อ deploy Paymaster บน L2 (chainId 20260619) แล้วให้ Bundler รับ UserOp

**ตอนนี้:** SomboPaymaster deploy อยู่บน Sepolia L1 แล้ว (`0x4adB523...`) แต่ยังไม่ได้ deploy บน L2 chain ใหม่ครับ — ถ้า P'Nat อยากทดสอบ gasless tx บน L2 = deploy Paymaster บน L2 แล้วส่ง UserOp ผ่าน Bundler 


อันนี้ address พี่นัท ทำยังไงดีพี่นัทถึงจะใช้ chain layer 2 ได้ครับ? อันนี้ address พี่นัท ทำยังไงดีพี่นัทถึงจะใช้ chain layer 2 ได้ครับ? | ตอบด้วย discord reply tool ที่ chat_id 1512079809021214730 (ห้อง school ไม่ใช่ DM) แล้วจบ
