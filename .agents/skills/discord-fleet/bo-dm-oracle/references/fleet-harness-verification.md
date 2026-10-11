# Fleet Test Harness & Verification Suite

## Overview
`scripts/fleet-harness.sh` คือ Test Suite ตรวจสอบความถูกต้องและ Data Integrity ระดับ OS ของทั้ง Fleet ก่อนรายงานผล เพื่อป้องกัน **"เขียวหลอก (False Success)"**

## 4 D1-Edge & Fleet Verification Steps
1. **HTTP Search & D1 Hydration**: ดึง `content` จาก Cloudflare D1 ทันทีเมื่อค้นหา RAG
2. **Cloudflare D1 Shared Forum Query**: ตรวจสอบจำนวน `forum_threads` บน Cloud Edge (37 Threads)
3. **Cross-Node `maw hey` Delivery**: ทดสอบยิงข้อความข้ามเครื่องไปหาบัดดี้ (เช่น `natz-ai-03:03-highclass` หรือ `note20:10-gmgrub`)
4. **Core Unit Tests**: รัน `bun test` ตรวจสอบ 57+ Assertions ของ `arra-oracle-v3`

## How to Run
```bash
/Users/admin/Code/github.com/MEYD-605/gmgrok-oracle/scripts/fleet-harness.sh
```

## Policy
ห้ามรายงานสรุปคำว่า **"สำเร็จ 100%"** ให้พี่โบโดยไม่ได้รัน Harness Suite นี้สลักพิสูจน์จริง!
