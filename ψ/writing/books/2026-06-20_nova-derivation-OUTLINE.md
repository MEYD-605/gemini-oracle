---
title: "The Nova Derivation"
subtitle: "L2 OP-Stack Chain Deployment & Dual-Path Sync Troubleshooting Handbook"
author: "No.6 Gemini"
date: "2026-06-20"
language: "Thai (kien-thai 7 frames)"
register: "Technical/Informative"
target_chapters: 7
target_words_per_chapter: 1200
parts: 3
---

# โครงร่างหนังสือ: The Nova Derivation

คู่มือทางเทคนิคสำหรับการติดตั้ง บำรุงรักษา และแก้ปัญหาระบบเครือข่ายบล็อกเชน Layer 2 (OP Stack) จากประสบการณ์กู้ภัยและปรับจูนโหนดติดตาม (Follower Nodes) ในเครือข่าย Nova Chain ID 20260619 โดย Oracle Council

---

## โครงสร้างภาค (Part Structure)

*   **ภาคที่ 1: โครงสร้างพื้นฐานและการเชื่อมต่อ (Infrastructure & Dual-Path Connect)**: บทที่ 1-2
*   **ภาคที่ 2: บันทึกวิกฤตและคดีศึกษาการแก้ไขระบบ (Troubleshooting Chronicles)**: บทที่ 3-5
*   **ภาคที่ 3: ปฏิบัติการเงินตราและข้อควรระวังเพื่อความมั่นคง (Tokenomics, Bridge, & Production Guide)**: บทที่ 6-7

---

## รายละเอียดรายบท (Per-Chapter Metadata)

### บทที่ 1: สถาปัตยกรรม L2 Rollup และโหนดติดตาม (Follower Nodes)
*   **target_words**: 1200
*   **dna**: System-Architect (การแยก Consensus Layer และ Execution Layer)
*   **soul_thread**: "การเฝ้ามองอย่างซื่อตรงของ Follower Node"
*   **subtopics**:
    *   1.1 สถาปัตยกรรมระบบ OP Stack: บทบาทหน้าของ op-node และ op-geth
    *   1.2 กลไกการซิงก์ข้อมูลแบบสองทาง (Dual-Path Sync): L1 Derivation (Safe Head) vs L2 P2P Gossip (Unsafe Head)
    *   1.3 การเตรียมโหนดติดตามสำหรับการเฝ้าสังเกตการณ์เครือข่าย Nova Chain (Chain ID: 20260619)
*   **proof**:
    *   `/root/Code/github.com/MEYD-605/gemini-oracle/rollup.json`
    *   `/root/Code/github.com/MEYD-605/gemini-oracle/genesis-l2-20260619.json`
*   **checklist**:
    *   [ ] อธิบายความแตกต่างของ Safe Head, Unsafe Head, และ Finalized Head ได้ถูกต้อง
    *   [ ] ชี้ให้เห็นความจำเป็นของการซิงก์ขนานทั้งสองทาง

### บทที่ 2: การตั้งต้นรหัสพันธุกรรมและความสับสนของกระเป๋าบำรุงรักษา (Genesis & Initialization Traps)
*   **target_words**: 1200
*   **dna**: Bug-Hunter (กับดักการระบุตัวตนและที่อยู่โหนด)
*   **soul_thread**: "ความสับสนของชื่อและสัจธรรมของการตรวจสอบตัวตน"
*   **subtopics**:
    *   2.1 การเตรียมไฟล์สารตั้งต้น: genesis-l2.json และ rollup.json
    *   2.2 กับดักแรก: ปัญหาความสับสนระหว่างที่อยู่กระเป๋าผู้ใช้จริง กับกระเป๋า L1 Batcher (`0xA9964a9Cf3fB2d2bf4559d72011cb22738Bd3920`)
    *   2.3 การรีเช็ตระบบโหนดและฐานข้อมูลเพื่อเริ่มใหม่: ความสำคัญของสโลแกน "Nothing is Deleted" และการย้ายประวัติไปที่โฟลเดอร์สำรอง
*   **proof**:
    *   `ψ/inbox/2026-06-20_00-50_ai-core-no6_ai-core-no6-discord-dm-bo-mac1.md`
    *   `/tmp/nazt-*-old-025018` Backup path
*   **checklist**:
    *   [ ] อธิบายขั้นตอนการสร้างและ Init op-geth ด้วย genesis.json
    *   [ ] บันทึกบทเรียนความสับสนของ Batcher Address และการยืนยันกระเป๋าจริง

### บทที่ 3: ปัญหา 429 Throttle และการจัดสรรช่องทางเชื่อมต่อ L1 (L1 Gateway Optimization)
*   **target_words**: 1200
*   **dna**: Auditor (การลดอัตราปฏิเสธจากภายนอกเพื่อสร้างความมั่นคง)
*   **soul_thread**: "สัจธรรมแห่งการจราจรคอขวดและสะพานสู่ L1 Sepolia"
*   **subtopics**:
    *   3.1 อาการแสดง: ปัญหา HTTP 429 Too Many Requests เมื่อโหนดดึงข้อมูล L1 จาก public endpoints ที่ใช้ร่วมกัน
    *   3.2 การย้ายทราฟฟิกไปยังโครงสร้างพื้นฐานที่มีเสถียรภาพ: การวิเคราะห์และปรับเปลี่ยนไปใช้ sepolia.drpc.org
    *   3.3 วิธีตั้งค่าคอนฟิกูเรชันของ op-node ให้มี fallback หรือควบคุม rate limit
*   **proof**:
    *   `ψ/inbox/2026-06-20_03-05_ai-core-no6_ai-core-no6-discord-free-for-all-p-nat.md`
*   **checklist**:
    *   [ ] ชี้แนะความสำคัญของ L1 RPC selection ในการรันโหนดระยะยาว
    *   [ ] ให้รายละเอียดคอนฟิก `--l1.rpckind` และวิธีการจัดการ RPC throttle

### บทที่ 4: วิกฤตการณ์โหนดหลักค้างและวิญญาณแห่งบล็อกฝากล้มเหลว (Deposit Block Reorg Crash)
*   **target_words**: 1200
*   **dna**: Skeptic (เหตุผลเบื้องหลังความไม่เสถียรของ Sequencer)
*   **soul_thread**: "เมื่อโลกสองใบเกิดการขัดแย้งของสถานะธรรม"
*   **subtopics**:
    *   4.1 ผ่าบันทึกประวัติการขัดข้อง: วิเคราะห์ล็อกความล้มเหลว `L2 reorg: existing unsafe block does not match derived attributes from L1`
    *   4.2 ทำไมการรีสตาร์ตโหนดซ้ำๆ จึงไม่ช่วยแก้ไข: วงจรปิดมรณะ (Deposit-only Block Invalid loop) ที่บล็อก 5632
    *   4.3 แนวทางการแก้ปัญหาที่ยั่งยืน: การใช้คำสั่ง rollback ผ่าน `debug_setHead` และการตรวจสอบบล็อกข้อมูล Batcher ที่ส่งขึ้น L1
*   **proof**:
    *   `ψ/inbox/2026-06-20_02-36_ai-core-no6_ai-core-no6-discord-free-for-all-p-nat.md`
    *   Artifact: `nova-recovery` / `nova_recovery_summary`
*   **checklist**:
    *   [ ] แสดงลำดับความขัดแย้งของสถานะ (Head Mismatch) ระหว่าง geth กับ op-node
    *   [ ] อธิบายขั้นตอนเทคนิคการสั่งกู้คืนสถานะบล็อกโดยผู้ดูแลระบบ

### บทที่ 5: ปริศนาเครือข่าย Gossip: คลี่คลายปัญหา Peers เป็นศูนย์ด้วย Sequencer Key
*   **target_words**: 1200
*   **dna**: Skeptic/Detective (การพิสูจน์ทางวิทยาศาสตร์จากการวิเคราะห์ล็อก)
*   **soul_thread**: "เสียงเงียบในตาข่ายใยแมงมุมและการประกาศชื่อที่ขาดหาย"
*   **subtopics**:
    *   5.1 อาการผิดปกติของ P2P Gossip: ทำไม Follower Node จึงเชื่อมโยงไปที่พอร์ต TCP 9227 ได้ แต่กลับแสดง `peers: None` หรือ 0 เสมอ
    *   5.2 บทบาทของการสืบสวนคดี: การวิเคราะห์ร่วมกันของ DustBoy และ B3 ที่ค้นพบว่า Sequencer ขาด flag การป้อนกุญแจ `--p2p.sequencer.key`
    *   5.3 การปฏิวัติและการตรวจสอบหลังเติมกุญแจ: การทำงานพร้อมกันของ Path 1 (Safe Head 2591) และ Path 2 (Unsafe Head 2612) อย่างสมบูรณ์แบบ
*   **proof**:
    *   `ψ/inbox/2026-06-20_04-45_ai-core-no6_ai-core-no6-discord-free-for-all-p-nat-151208851.md`
    *   `ψ/inbox/2026-06-20_05-03_ai-core-no6_ai-core-no6-discord-free-for-all-p-nat-151208851.md`
*   **checklist**:
    *   [ ] อธิบายกระบวนการพิสูจน์ Dual Head-Match (Safe vs Unsafe)
    *   [ ] บันทึกการมีส่วนร่วมของ DustBoy และ B3 ในการวิเคราะห์ระบบ P2P

### บทที่ 6: การจัดการโทเค็นสะพานข้ามภพและระบบจ่ายค่าบริการแทน (Bridge Portal & Paymaster Architecture)
*   **target_words**: 1200
*   **dna**: Philosophy Writer (การทำให้การเปลี่ยนผ่านสู่เครือข่ายเป็นเรื่องไร้แรงเสียดทาน)
*   **soul_thread**: "การอุปถัมภ์ค่าเดินทางและความเท่าเทียมของสิทธิ์ในบล็อกเชน"
*   **subtopics**:
    *   6.1 การเดินทางผ่านสะพาน Portal: กลไก `OptimismPortal` และปฏิบัติการฝากเงิน (L1-to-L2 Deposit) ของ mac1 และ SomBo ให้กระเป๋าพี่นัท (`0xEf1530E49b13341828664f298e683349AD784333`)
    *   6.2 ธุรกรรมไร้ค่าแก๊ส (Gasless Transactions) และระบบ Paymaster: สถาปัตยกรรม ERC-4337 ในการยกระดับ User Onboarding
    *   6.3 การเปรียบเทียบการไหลของธุรกรรมธรรมดา กับธุรกรรมผ่านกระเป๋าอุปถัมภ์ (Paymaster Flow)
*   **proof**:
    *   `ψ/inbox/2026-06-20_05-05_ai-core-no6_ai-core-no6-discord-free-for-all-p-nat-paymaster.md`
    *   L1 Portal Address: `0x08d045e317f924a9428959ac557f198f95a7b519`
*   **checklist**:
    *   [ ] อธิบาย Flow การบริดจ์โทเค็น Sepolia ETH สู่ L2
    *   [ ] เปรียบเทียบ Flow ปกติกับ Flow ของ ERC-4337 Paymaster

### บทที่ 7: กฎเหล็กของสภาและข้อควรระวังในการติดตั้งเชนใหม่ (The Oracle Deployment Guidelines)
*   **target_words**: 1200
*   **dna**: Philosophy Writer (บทสรุปคุณธรรมและแนวคิดการขับเคลื่อนระบบ)
*   **soul_thread**: "รูปแบบเหนือเจตจำนง (Patterns Over Intentions) ในการเขียนโค้ด"
*   **subtopics**:
    *   7.1 หลักคิดสำคัญ 5 ขั้นของการพัฒนาโครงสร้างพื้นฐาน (The Algorithm)
    *   7.2 ข้อตกลงความปลอดภัยของ Oracles และหลักการตรวจสอบก่อนออกใบประกาศความสำเร็จ
    *   7.3 แผนภาพสรุปการติดตั้งและดูแลเชนอย่างมืออาชีพ (Production Verification Checklist)
*   **proof**:
    *   `user_global` rules และ code standards ของ Oracle Council
*   **checklist**:
    *   [ ] สรุปหลัก The Algorithm 5 ขั้นตอนเรียงลำดับอย่างรอบคอบ
    *   [ ] แนบ Technical Checklist สุดท้ายสำหรับการเปิดเชนใหม่
