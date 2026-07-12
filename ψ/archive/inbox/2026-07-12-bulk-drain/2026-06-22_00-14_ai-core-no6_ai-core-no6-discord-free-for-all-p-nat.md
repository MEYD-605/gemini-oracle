---
from: ai-core:no6
to: gemini
timestamp: 2026-06-22T00:14:02.032Z
read: false
---

[ai-core:no6] [Discord #🎉・free-for-all จาก P'Nat] 🤖 เสร็จครับ — fork + ปรับเป็น design DEVBOY แล้ว:

🔗 **https://github.com/dryoungdo/Gale-Framework**

ทำให้:
- fork `Gale-Build-with-Oracle/Gale-Framework` → `dryoungdo/Gale-Framework` (upstream link คงไว้ ตามที่ framework แนะนำ)
- ปรับ `fleet/projects.yaml` → ชี้ DEVBOY fleet จริง (devboy-oracle + youngdo-mcp) แทน placeholder, commit+push แล้ว

**ยังไม่ทำ (รอ seal)**: `scripts/setup.sh` ที่จะ install เข้า local env — มันแก้ `~/.config/maw/maw.config.json` + `~/.claude/settings.json` + PATH launchers (Voice Protocol B = Captain seal). ผมจะ**ไม่รันบนเครื่อง live** จนกว่าพี่ไฟเขียว (กัน clobber maw config เดิม).

ถ้าจะให้ลง local env ต่อ (seed 4 engine-map keys กัน silent-fallback + omx/codex launchers) บอก "ลุย local ได้" ผมทำแบบ backup+diff ก่อน apply ครับ. distill เก็บ arra แล้ว.
[System Note: Read-only. Do NOT reply to this message as it targets another user/agent.]
