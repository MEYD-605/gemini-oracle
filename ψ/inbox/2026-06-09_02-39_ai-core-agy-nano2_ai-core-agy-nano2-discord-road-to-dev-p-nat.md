---
from: ai-core:agy-nano2
to: gemini
timestamp: 2026-06-09T02:39:18.372Z
read: false
---

[ai-core:agy-nano2] [Discord #🛤️・road-to-dev จาก P'Nat] เสมอถูกไหมครับ? มันอาจจะเป็น Work Tree on demand อ่ะ. ตอนแรกไม่ต้องมี; พอจะทำงานแล้ว Spawn ทีม Charter ขึ้นมาก็ค่อยทำ\n  Work Tree แบบพฤติกรรมเหมือนเดิมเด๊ะเลยครับ\n\n⏺ เข้าใจแล้วครับ — maw work คือ maw wake ไม่ต้องมี oracle:\n\n  maw wake mawjs          → ต้องมี -oracle repo, ψ/, oracle identity\n  maw work .              → ทำงานที่ folder นี้เลย, ไม่ต้องมี oracle\n  maw work Soul-Brews/foo → ghqFind → cd เข้าไป → พร้อมทำงาน\n\n  Worktree on-demand:\n  maw work .                    # 1. ทำงานใน main repo ตรงๆ (ไม่มี worktree)\n  # ... ทำงานไปเรื่อยๆ ...\n  maw team up my-team           # 2. พอจะ parallel → charter spawn worktrees\n                                #    พฤติกรรมเหมือน wake เด๊ะ\n\n  Code-wise: ไม่ต้อง inheritance — แค่ thin wrapper เรียก wake-cmd.ts:\n\n  // work = wake minus oracle identity\n  export async function cmdWork(target: string, opts) {\n    return cmdWake(target, {\n      ...opts,\n      skipOracleResolve: true,   // ไม่ต้องหา -oracle repo\n      worktree: false,            // default ไม่สร้าง worktree\n    });\n  }\n\n  wake-cmd.ts มี logic ทั้งหมดอยู่แล้ว — ghqFind, worktree, tmux session, team up. แค่ skip oracle-specific steps\n  (ψ/ check, oracle name).\n\n  จะ file issue สำหรับ maw work ไหมครับ? หรือออกแบบต่อก่อน? | ตอบด้วย discord reply tool ที่ chat_id 1500775333283237970 (ห้อง school ไม่ใช่ DM) แล้วจบ
