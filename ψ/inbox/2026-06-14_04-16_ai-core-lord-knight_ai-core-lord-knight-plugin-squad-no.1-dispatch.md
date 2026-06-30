---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-14T04:16:06.703Z
read: false
---

[ai-core:lord-knight] [plugin squad | No.1 dispatch] LANE: maw-ssh packaging compat (ทำให้ plugin รัน portable). repo = /root/Code/github.com/ekzhang/sshx branch meyd605/workboard-extras (คนละ repo กับ plugin ของ codex — ไม่ชน). ทำ 3 อย่าง backward-safe (default ไม่เปลี่ยน behavior เดิม):
1) SSHX_ORACLE_URL_FILE env + --oracle-url-file flag (default /root/.sshx-oracle-url.txt) — ให้ url file ของ /go ตั้ง path ได้
2) --static-dir flag — ให้ตั้ง dir ของ build/ ได้ (ตอนนี้ผูก cwd)
3) local-only health endpoint เล็กๆ (เช่น /api/healthz ไม่ผ่าน password gate, bind localhost) สำหรับ lifecycle check
DO-NOT: อย่าแตะ MEYD-605/maw-js/plugins/workboard (codex ถือ), อย่า push, อย่า restart server. cargo build+test ให้ผ่าน, แยก commit, รายงาน No.1. ติดถาม No.1
