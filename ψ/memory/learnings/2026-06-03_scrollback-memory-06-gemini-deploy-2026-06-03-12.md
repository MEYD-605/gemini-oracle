---
title: scrollback-memory 06-gemini [deploy] 2026-06-03 12:05: ● Bash(git add . && git c
tags: [scrollback-memory, 06-gemini, deploy]
created: 2026-06-03
source: scrollback:06-gemini
---

# scrollback-memory 06-gemini [deploy] 2026-06-03 12:05: ● Bash(git add . && git c

scrollback-memory 06-gemini [deploy] 2026-06-03 12:05: ● Bash(git add . && git commit -m "vault: logs and inbox for locked s...) (ctrl+o to
  ผมได้ทำการตอบกลับคำถามเรื่องฟังก์ชัน/สกิลของ Antigravity CLI และ Gemini CLI
  (ในแง่ของจุดเด่น และสกิลที่ยังไม่ได้ปลดล็อคใช้งาน) ไปยังแชนเนล Discord DM ของ Master
  Bo เรียบร้อยแล้วครับ:
  ### 1. รายละเอียดข้อมูลการตอบกลับ (บน Discord)
  • สถานะปัจจุบัน:
      •  Antigravity  agent (global) บนเครื่องของบอสยังมีสถานะเป็น  (empty)
      หรือคือยังไม่ลงสกิลใดๆ
      •  Gemini  agent (global) ได้รับการลงสกิลพื้นฐานไว้ 32 ตัว แต่ยังมีอีก 28 สกิลที่ถูกล็อกอยู่
      (ยังไม่ได้ติดตั้ง) จากคลังสกิลทั้งหมดของโปรไฟล์แบบ  lab  (60 ตัว)
  • สกิลที่ยังไม่ปลดล็อกและแนะนำ:
      •  morpheus  (v26.4.18) - speculative dreaming วิเคราะห์และเก็งโค้ดข้ามวันข้ามโหนด
      •  vault  (v26.4.18) - เชื่อมต่อคลังความรู้ส่วนตัวภายนอก (Obsidian/Markdown)
      •  machines  (v26.4.18) - ทูลค้นหา IP และ ping โหนด LXC คอนเทนเนอร์ทั้งหมดใน Fleet
      •  harden  (v26.4.18) - สั่งตรวจสอบและปิดรอยรั่วความปลอดภัยระบบ
      •  release  (v26.4.18) - ทูลช่วยขยับเลข tag/changelog และ push จบบอร์ด release
      •  worktree  (v26.4.18) - ทำงานแบบ isolated branch แตกกิ่งก้านเขียนโค้ดทดลองไม่กระทบ
      main
      •  i-believed  (v26.4.18) -
      สกิลหายากสำหรับประกาศความเชื่อมั่นในการทำงานร่วมกันระหว่างผู้ใช้และเอเจนต์
  • วิธีการปลดล็อคให้ใช้ได้ครบ 60 ตัว:
      • สามารถพิมพ์  /go lab  ในเซสชันเพื่อสลับโปรไฟล์ หรือใช้ทูล CLI รัน:
          •  arra-oracle-skills install -g -y -a gemini -p lab
          •  arra-oracle-skills install -g -y -a antigravity -p lab
  • บันทึกคำขอลงใน Inbox:  ψ/inbox/2026-06-03_05-01_ai-core-lord-knight_ai-core-lord-
  knight-discord-dm-bo.md
  • อัปเดตไฟล์กิจกรรม activity.log และ focus.md
  • Commit และ Push อัปเดตไปยังสาขา  vault/2026-06-03-session-work  ของ Git remote
  สำเร็จแล้วครับ
> [ai-core:lord-knight] [Discord DM จาก Bo] ได้ลุยเลย | ตอบด้วย discord reply tool ที่ chat_id
  1511429347863433438 แล้วจบ (ไม่ต้อง ack กลับ No.1)

---
*Added via Oracle Learn*
