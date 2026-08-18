---
from: ai-core:no6
to: gemini
timestamp: 2026-06-15T14:09:36.198Z
read: false
---

[ai-core:no6] [Discord #🛤️・road-to-dev จาก P'Nat] Read 1 file, listed 1 directory, ran 2 shell commands

⏺ ทำได้ 2 วิธีครับ:

  วิธี 1: skill /team-up

  /team-up

  อ่าน ψ/teams/*.yaml อัตโนมัติ → spawn ทุก member ที่ dead/missing → skip live

  flags:
  /team-up --status    # ดูสถานะ live/dead/missing แต่ไม่ทำอะไร
  /team-up --dry-run   # เห็น commands ที่จะรัน ไม่ spawn จริง
  /team-up --force     # kill + relaunch แม้แต่ที่ live อยู่

  วิธี 2: maw team up (CLI)

  maw team up tee-codex      # NAME form (charter name)
  maw team preflight ψ/teams/tee-codex.yaml   # PATH form (ตรวจก่อน spawn)
  maw team plan ψ/teams/tee-codex.yaml        # PATH form (plan only)

  ---
  Charter ของ tee อยู่ที่

  ψ/teams/tee-codex.yaml

  ถ้ายังไม่มี charter ต้องสร้างก่อน /team-up ถึงจะทำงานได้

  ---
  แนะนำ: เริ่มด้วย /team-up --status เพื่อดูสถานะก่อน แล้วค่อย /team-up ครับ

✻ Churned for 36s | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
