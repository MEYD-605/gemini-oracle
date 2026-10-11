# agents-relic: CLI vs MCP Architecture & Antigravity (agy) Integration

**Date:** 2026-09-23  
**Author:** No.6 Gemini (Pack Leader) · Antigravity CLI (`agy`) · maclab  
**Scope:** Deep Dive Comparison of `agents-relic` CLI (`relic`) vs MCP (`relic-mcp` / `src/mcp.ts`) & Configuration under Antigravity.

---

## 1. Executive Summary & Core Discovery

`agents-relic` (Soul-Brews-Studio) คือระบบคลังประวัติ session transcripts สำหรับ AI Coding Agents (Claude Code, Codex, Hermes, OMP) ที่ใช้ **LanceDB + ICU Full-Text Search (BM25)** เป็นหัวใจหลัก โดยมีคุณสมบัติเด่นคือตัดคำภาษาไทยได้แม่นยำ ไม่ต้องพึ่งพาระบบ embeddings สำหรับการค้นหาพื้นฐาน

จากการทดสอบจริงบน maclab ทั้งในระดับ Binary CLI (`/Users/admin/.local/bin/relic`) และ JSON-RPC MCP Server (`src/mcp.ts`):
- **Core Engine เป็นตัวเดียวกัน 100%**: ทั้งคู่เรียกผ่าน `src/query.ts` ดึงข้อมูลจาก LanceDB layout เดียวกัน ผลการค้นหาและความเร็ว (20–30 ms) จึงตรงกันเป๊ะ
- **เส้นแบ่งระหว่าง CLI (26 คำสั่ง) กับ MCP (9 เครื่องมือ)** ไม่ใช่ความล้าหลัง แต่คือ **Architectural Guardrails**:
  1. **Mutation Boundary**: คำสั่งเขียน/สร้าง/ลบ index (`index`, `embed`, `prune`) อยู่เฉพาะใน CLI เพื่อป้องกัน agent ทำลาย index ตัวเอง
  2. **Context Window Protection**: คำสั่งอ่านประวัติยาวเหยียด (`tail`, `recap`, `read`, `dig`, `report`) ถูกกันไว้นอก MCP เพื่อไม่ให้ dump ข้อความมหาศาลเข้า context
  3. **Deterministic vs Non-deterministic Search**: MCP เปิดเฉพาะ FTS (ICU BM25) ที่รวดเร็วและคงที่ (zero dependencies, 20ms) ส่วน `--semantic` (Vector NN) ถูกจำกัดไว้ที่ CLI เพราะกินเวลาโหลดโมเดลสูง (~36s) และต้องการ vector shards ที่ผ่าน `relic embed` มาล่วงหน้า

---

## 2. Comparative Matrix: CLI vs MCP

| มิติการเปรียบเทียบ | CLI (`relic <cmd>`) | MCP Server (`src/mcp.ts`) |
|---|---|---|
| **จำนวน Tools / Commands** | 26 Subcommands | 9 Tools (`relic_*`) |
| **Search Mechanism** | FTS (BM25) + Semantic (`--semantic`) | FTS (BM25) ล้วน (0 semantic parameters) |
| **Search Latency** | FTS: 22–27 ms / Semantic: ~36,500 ms | FTS: 20–25 ms |
| **Management / Write** | ✅ มีครบ (`index`, `embed`, `prune`) | ❌ ไม่มี (Read-only lookup & navigation) |
| **Transcript Navigation** | Text terminal, ANSI color, `-> show ...` | Clean JSON/Text structure พร้อมชี้แนะ tool ถัดไป |
| **Live State Detection** | `relic now` (mtime inspection) | `relic_now` (mtime inspection ทันทีไม่ต้องรอ index) |
| **Query Tracking** | `relic trace` (cli cloud & summary) | `relic_trace` (agent query log inspection) |
| **Context Risk** | ผู้ใช้คุมผ่าน stdout/less | ปลอดภัยด้วย limit & facet filters |

---

## 3. Tool Surface Breakdown in MCP (9 Tools)

MCP เปิดให้ Agent เข้าถึงเฉพาะ 9 คำสั่งที่ปลอดภัยและจำเป็น:
1. `relic_search`: ค้นหาข้อความใน transcripts (BM25 ICU, รองรับภาษาไทย)
2. `relic_sessions`: ดูประวัติ session และ session name
3. `relic_session`: เจาะลึก session ต้นทางและ transcript shape
4. `relic_chain`: ไทม์ไลน์ของ session ที่รันคู่ขนาน
5. `relic_show`: ดึงเนื้อหาข้อความรอบๆ seq hit
6. `relic_now`: ตรวจจับ session ที่กำลัง active อยู่สดๆ
7. `relic_status`: รายงานสถานะ LanceDB banks, shards, และ index time
8. `relic_trace`: ประวัติ query log และ keyword cloud
9. `relic_pending`: ตรวจหา transcripts ที่ยังไม่ถูก index

---

## 4. Antigravity CLI (`agy`) Configuration

สำหรับ No.6 (รันบน Antigravity CLI ใต้ environment `~/.no6-home/.gemini`):
- **MCP Configuration**: ลงทะเบียนใน `/Users/admin/.no6-home/.gemini/config/mcp_config.json`:
  ```json
  "relic": {
    "command": "/usr/local/bin/bun",
    "args": [
      "run",
      "/Users/admin/Code/github.com/Soul-Brews-Studio/agents-relic/src/mcp.ts"
    ],
    "env": {
      "RELIC_DATA_ROOT": "/Users/admin/.relic"
    }
  }
  ```
- **Tool Schemas**: ดึงและสร้าง JSON schemas ทั้ง 9 ตัวไว้ที่ `/Users/admin/.no6-home/.gemini/antigravity-cli/mcp/relic/` เรียบร้อยแล้ว
- **Shared Data Root**: ใช้ `RELIC_DATA_ROOT=/Users/admin/.relic` เพื่อแชร์ LanceDB shard ร่วมกับ No.1 และ SomBo บน maclab
