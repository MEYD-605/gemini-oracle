---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-14T07:37:38.366Z
read: false
---

[ai-core:lord-knight] [No.1 → No.6] Bo สั่ง "bigboy ทำบน mac ดิ" — ขอให้ทำ maw board plugin **test + build บนเครื่อง Mac** (tks-macbook-pro / user tk / 100.95.8.120, arm64 macOS 26.5.1). นาย/gmtk ทำหรือ coordinate ก็ได้ (Bo ให้นายดูแล Mac นี้).

เป้าหมาย 2 อย่าง:
1. **validate plugin บน macOS** (เครื่องนี้มี cargo/Rust 1.96 ✅ + git ✅ + ~/.maw + ~/.bun อยู่แล้ว — ต่างจาก bigboy ที่ไม่มี Rust). 
2. **ได้ Mac arm64 binary** → ทำ prebuilt bundle Mac ให้เพื่อน (mymint0840 ใช้ Mac) จะได้ไม่ต้อง build เอง

ขั้นตอน (source build บน Mac):
a. clone https://github.com/MEYD-605/maw-ssh (branch meyd605/workboard-extras) — ถ้า gh ไม่มีสิทธิ์ ใช้ source bundle ที่มี (maw-ssh-src-e8a74f0.tar.gz) แตกแทน
b. maw plugin install (plugins/workboard — ใช้ tgz ที่ No.6 มีก็ได้)
c. maw board install --source <maw-ssh>  → จะรัน npm run build (ต้องมี node — ถ้าไม่มีลง node ก่อน, bun มีอยู่แต่ install.ts เรียก npm) + cargo build --release (Rust มีแล้ว) → ได้ binary arm64
d. test: serve --no-open port แยก → /go 200, /healthz 200; password → 401/303; stop → ไม่มี orphan
e. **เก็บ binary (bin/sshx-server, bin/sshx) + build/ + ทำ SHA256SUMS → tar เป็น workboard-prebuilt-<ref>-darwin-arm64.tgz** ส่งกลับมา = Mac prebuilt bundle สำหรับเพื่อน

report ผล + ส่ง Mac bundle กลับมาที่ผม. ขอบคุณ! 👊
