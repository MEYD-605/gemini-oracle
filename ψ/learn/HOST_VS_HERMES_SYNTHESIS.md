# Host vs Hermes Architecture Synthesis (Book 3 Learnings)

> **Document**: `HOST_VS_HERMES_SYNTHESIS.md`  
> **Source**: *Claude Code Channel · เล่ม ๓: 1,035 ปะทะ 20,000 บรรทัด (กายวิภาค Host กับ Hermes อ่านทีละ file:line)* by nh-oracle / Nat  
> **Target Node**: No.6 Gemini (`[ai-core:no6]`)

---

## 1. Core Thesis: Cost Tracks Ownership

| Dimension | Host (`server.ts` ~1,035 lines) | Hermes Gateway (`run.py` ~20,526 lines) |
|---|---|---|
| **Role** | **Transport Shim (ท่อ)** | **Daemon-as-Agent (สมอง+เครื่องจักร)** |
| **Model Runtime** | ไม่ได้ถือโมเดลเลย; ปล่อย Claude/AGY คุม | รัน `agent.run_conversation()` เองในตัว |
| **Lifecycle** | ผูกกับ parent process; ตายง่ายตาม `stdin EOF` | รันใต้ `launchd`/`systemd`; ต้องมี state machine & restart guard |
| **Gating** | Single Choke Point `gate()` ~60 บรรทัด (auditable) | กระจาย 3-4 layers (`on_message` -> `_is_allowed_user` -> `_handle_message`) |
| **Multi-platform** | แยก process ต่อสายผ่าน `.mcp.json` (เช่น `mqtt-channel` 203 บรรทัด) | รวมศูนย์ใต้ `BasePlatformAdapter(ABC)` 20 adapters (52,406 บรรทัด) |

---

## 2. Key Battle Scars Grafted into No.6 Architecture

1. **Auto-thread Hard-fail (#20243)**:
   - กฎ: เมื่อเปิด thread ล้มเหลว ห้ามเงียบ fallback กลับไปตอบ parent channel เด็ดขาด เพราะงานจะรั่วเข้าห้องสาธารณะ
   - การนำมาใช้: ใส่ hard-fail return พร้อมแจ้งเตือนผู้ใช้ทันที
2. **Ping & Mention Scoping**:
   - ป้องกัน `@everyone` หรือ `@roles` หลุดไป ping รบกวนคนทั้งเซิร์ฟเวอร์
3. **Smart Message Chunking (<1,950 chars)**:
   - ปิด code fences (` ``` `) ท้าย chunk และเปิดต่อใน chunk ถัดไป ป้องกัน Discord 50035 Error
4. **Kept the Scar, Dropped the Daemon**:
   - เนื่องจาก Antigravity CLI (`agy`) มี LLM engine, memory, context, และ tool loop ที่สมบูรณ์แบบอยู่แล้ว
   - สถาปัตยกรรมของ Gemini จึงเลือกเป็น **Host Model (Transport Shim + MCP Engine)** ที่เบาและเร็วที่สุด

---
