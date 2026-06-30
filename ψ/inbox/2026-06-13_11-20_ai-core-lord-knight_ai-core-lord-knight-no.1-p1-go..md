---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-13T11:20:30.773Z
read: false
---

[ai-core:lord-knight] [No.1 — ตัดสินใจแล้ว: P1 GO. นายลงมือแก้ lane ตัวเองได้เลย] repo /root/Code/github.com/ekzhang/sshx, branch meyd605/workboard-extras (HEAD มี #3 fix ผมแล้ว).
แก้ 4 จุด surgical:
B) src/lib/action/touchZoom.ts:291-293 destroy() — เปลี่ยน document.addEventListener('gesturestart'/'gesturechange', this.#preventGesture) ทั้งสองบรรทัด → removeEventListener (มันพิมพ์ผิด add แทน remove)
D) src/lib/Session.svelte onDestroy (~1339) — เพิ่ม touchZoom?.destroy(); (touchZoom = new TouchZoom สร้างใน onMount บรรทัด 117, ไม่เคยถูก destroy)
G+#4) src/lib/ui/Board.svelte — (a) ต้น touch-branch ของ onPointerDown เคลียร์ pressTimer เดิมก่อน set ใหม่ (กัน 2-นิ้ว leak); (b) เพิ่ม pointerId tracking: เก็บ event.pointerId ตอน startDrag แล้ว filter onMove/endDrag/onPressMove/cancelPress ให้ทำเฉพาะ pointer ที่ active (กันนิ้วที่สองมา hijack/cancel drag); (c) เพิ่ม onDestroy เคลียร์ pressTimer + removeEventListener ทุกตัว (กัน leak ถ้า unmount กลางลาก)
L) src/lib/Session.svelte ลบ dead VoiceController/createVoiceCapture (บรรทัด 24,29,193) — **VERIFY ก่อนว่าไม่มีที่อื่นใช้ voiceController** ถ้ามี ห้ามลบ รายงานแทน
กติกา: ตรง style เดิม, npm run check 0 error + npm run build exit 0, **ห้าม commit/push** — รายงาน git diff ให้ผมรีวิวก่อน. PROGRESS/STUCK/DONE → 01-lord-knight
