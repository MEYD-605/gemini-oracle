# รายงานประเมินสถาปัตยกรรม Soul-Brews-Studio/arra-oracle-v4
**วันที่ประเมิน:** 2026-10-03  
**ผู้จัดทำ:** No.6 Gemini (Pack Leader) · maclab  
**สถานะการทำงาน:** ประเมินอย่างเดียว (Read-only 100% / ไม่มีการติดตั้งหรือแตะต้องระบบจริง)  
**แหล่งข้อมูลอ้างอิง:** Repository `Soul-Brews-Studio/arra-oracle-v4` (Commit `v26.9.27-alpha.2048` / `e00b50b` บน `/tmp/arra-oracle-v4`)

---

## 1. การทำงานร่วมกับ v3 (แทนที่ หรือ ขนาน?)

### ข้อสรุป: **ทำงานแบบ "ขนานกัน" (Parallel / Side-by-Side) 100% — ห้ามแทนที่ทันที**

### หลักฐานและเหตุผล:
1. **คำสั่งชี้ขาด R32 จาก อ.นัท (Nat, 2026-09-28)**:
   * อ้างอิง [`docs/overnight/DECISIONS.md#L510-L514`](file:///tmp/arra-oracle-v4/docs/overnight/DECISIONS.md#L510-L514):
     > *"Ruling (Nat, 2026-09-28): start v4 fresh on target-19; do not migrate v3 data. Target-19 becomes the default for a fresh v4 install. v3 keeps running untouched for as long as it is used."*
   * ระบุชัดเจนว่า v3 จะต้องรันต่อไปโดยไม่ถูกแตะต้อง (untouched) ตราบใดที่ระบบและกองเรือยังใช้งานอยู่
2. **Implementation Rule 3 ของโครงการ v4**:
   * อ้างอิง [`AGENTS.md#L134`](file:///tmp/arra-oracle-v4/AGENTS.md#L134):
     > *"Preserve v3 service/data. The migration described in DESIGN is v4 spike -> v4 target on a copy, not automatic v3 corpus import."*
3. **การแยกพอร์ตและสถาปัตยกรรมอิสระ**:
   * **v3 (Production ปัจจุบัน)**: ทำงานบน Home Assistant OS (HAOS) พอร์ต `:8099` (SQLite backend `~/.arra-oracle-v2` + FastAPI) เก็บความจำกองเรือ ~20k memories
   * **v4 (ระบบใหม่)**: ทำงานบน Bun/Elysia พอร์ต `:3939` (LanceDB Apache Arrow backend บนไดเรกทอรีเฉพาะ `ARRA_KNOWLEDGE_DATASET_ROOT`)
4. **v3 Protocol Adapter ใน v4 เป็นเพียงตัวรับคำสั่ง (ไม่ดูดข้อมูล)**:
   * v4 มีออปชันเปิด `ARRA_MCP_V3_COMPAT=1` ซึ่งจะ expose เครื่องมือชื่อเดิมของ v3 จำนวน 25 ตัว (เช่น `oracle_learn`, `search`, `ask`, `read`) เพื่อให้ Client เก่าต่อติดได้ แต่มีกฎเหล็ก **"No v3 corpus is imported (D9)"** ([`AGENTS.md#L56`](file:///tmp/arra-oracle-v4/AGENTS.md#L56))

---

## 2. การจัดการข้อมูลเดิมของ v3 (~20k memories) ภายใต้คำสั่ง R32

### ข้อสรุป: **v3 คงเป็น Archive / Read-Only Service ดั้งเดิม — v4 เริ่มต้นจากกระดานว่าง (Clean Slate)**

### รายละเอียดการปฏิบัติ:
1. **สถานะของข้อมูลเดิม v3**:
   * ข้อมูล SQLite เดิม ~20,000 memories ใน HAOS `:8099` จะ**ไม่ถูกย้ายหรือแปลงเข้า v4**
   * กองเรือยังคงเข้าถึงและค้นหาความจำประวัติศาสตร์เดิมผ่าน Endpoint v3 (:8099) หรือ MCP v3 เดิมได้ตามปกติ
2. **เหตุผลที่ R32 สั่งไม่ Migrate (R32 Rationale)**:
   * อ้างอิง [`docs/overnight/DECISIONS.md#L514-L517`](file:///tmp/arra-oracle-v4/docs/overnight/DECISIONS.md#L514-L517):
     > *"Why: the #135 cutover rehearsal found no live v4 data. Production is the v3 SQLite at ~/.arra-oracle-v2, which arra-migrate-copy refuses by design (R18 D9 keeps v3 import out of scope)... A migration had nothing to carry."*
   * สคริปต์ไมเกรตของ v4 (`arra-migrate-copy` ใน Issue #34) ถูกออกแบบมาเพื่อย้ายข้อมูลทดลองจาก *v4 spike (active15)* ไปสู่ *v4 target19 บน copy เท่านั้น* โดยปฏิเสธฐานข้อมูล SQLite v3 โดยสิ้นเชิง
3. **ความแตกต่างเชิงโครงสร้าง (Semantics Mismatch)**:
   * ข้อมูล v3 เป็น Flat/Raw memories ที่ไม่มีการควบคุม Versioning
   * v4 บังคับโครงสร้างเป็น **Single Node + Immutable Revisions** ([`AGENTS.md#L120`](file:///tmp/arra-oracle-v4/AGENTS.md#L120)), มีการแบ่งบทบาท Author / Observer / Subject อย่างเด็ดขาด, และใช้ Taxonomy แบบปิด (Sealed vocabulary ห้ามตั้ง category เองตามใจชอบ)
   * หากฝืนดูดข้อมูล v3 เข้ามาจะทำให้ Invariants และ Integrity ของ v4 เสียหายทันที
4. **แนวทางปฏิบัติสำหรับ Fleet**:
   * ข้อมูลอดีต: คิวรี่ผ่าน v3 (:8099)
   * ข้อมูล/บริบทใหม่: เริ่มต้นบันทึกใน v4 (:3939)
   * หากมีชุดความรู้เก่าที่จำเป็นต้องเข้า v4 ในอนาคต ต้องใช้แนวทาง **Selective ETL Script** ภายนอกเพื่อ curate และแปลงเข้า schema target19 ทีละรายการ

---

## 3. ขนาดงาน ความต้องการของระบบ และความเสี่ยง (Scope, Requirements & Risks)

### ก. สิ่งที่ระบบต้องการ (Prerequisites & Dependencies)
1. **Database & Storage Engine (LanceDB)**:
   * ใช้ **LanceDB (Apache Arrow / Parquet)** เป็น Canonical storage บน Local Disk (ไม่ใช่ SQL / RDBMS)
   * **ไม่มี Foreign Key หรือ Uniqueness Constraints ในระดับฐานข้อมูล** ([`AGENTS.md#L119`](file:///tmp/arra-oracle-v4/AGENTS.md#L119)) การคุมความถูกต้องทั้งหมดขึ้นกับ TypeScript Application Logic
   * ต้องการ Storage Roots 2–3 จุดพร้อมกัน:
     * `ARRA_KNOWLEDGE_DATASET_ROOT` (Target19 สำหรับ Node & Knowledge)
     * `ARRA_DATA_DIR` (Legacy15 สำหรับ Memories tier และ Operations/Audit)
     * `ARRA_OPS_DIR` (ตามแผน R33 สำหรับแยก audit/mcp_calls)
2. **Dual Language Runtimes (Python + Bun)**:
   * **Python (>= 3.11 with venv)**: เป็นเจ้าของ Physical Schema รัน `app/migrate-py` เพื่อ declare/migrate/drift-check LanceModel (19 Tables, 228 Fields)
   * **Bun (Strict Version Lock)**: บังคับ **Bun == 1.3.14** และ **Elysia == 1.4.30** แบบ Hardcode Pinning ([`app/server/src/composition.constants.ts:23-24`](file:///tmp/arra-oracle-v4/app/server/src/composition.constants.ts#L23-L24)) หากเวอร์ชันไม่ตรงเป๊ะ Server จะตัดการทำงาน (Refuse to start) ทันที! (ไม่รองรับ Node.js)
3. **Embeddings & LLM (Local Ollama Only)**:
   * บังคับพึ่งพา **Local Ollama daemon** เท่านั้น ([`AGENTS.md#L33,L75`](file:///tmp/arra-oracle-v4/AGENTS.md#L33))
   * **Embedding Model**: `all-minilm` (Profile `ollama/all-minilm/384/none`, 384 dimensions)
   * **Model Digest Pinning**: ระบบจะจำค่า Hash ของโมเดลไว้ใน `.embedding-profile-pins.json` ตั้งแต่การ embed ครั้งแรก หาก Ollama มีการอัปเดตโมเดลจน hash เปลี่ยน เวกเตอร์ใหม่จะถูกปฏิเสธ (`embedding_profile_mismatch`) ([`AGENTS.md#L79-L82`](file:///tmp/arra-oracle-v4/AGENTS.md#L79-L82))
   * **Chat Model**: `gemma3:4b` (หากเปิด `ARRA_CHAT_PROVIDER=ollama`)
4. **Security & Concurrency**:
   * ต้องการไฟล์ Auth Policy สิทธิ์ 0600 (`ARRA_AUTH_POLICY`) + Bearer Token (64-hex lowercase)
   * บังคับรันผ่าน **Single Writer Gate (fd-42)** ([`AGENTS.md#L25,L126`](file:///tmp/arra-oracle-v4/AGENTS.md#L25)) ห้ามมีมากกว่า 1 Writer Process เข้าถึง Dataset พร้อมกัน

---

### ข. ขนาดงาน (Work Scope & Complexity)
* **ระดับความซับซ้อน: สูงมาก (Enterprise-grade / Complex Stack)**
* **Schema Scale**: 19 tables, 228 fields
* **API Scale**: 58 Knowledge Registry Methods (`kb_*`), 66–91 MCP Tools (8 legacy + 58 kb + 25 v3 compat)
* **3 Transports**: HTTP REST, MCP, CLI
* **ขั้นตอนเตรียมระบบ**: ต้องเซ็ตอัปทั้ง Python 3.11 venv (PyArrow, LanceDB), ติดตั้ง Bun 1.3.14 เฉพาะเจาะจง, ติดตั้งและ pull model ใน Ollama (`all-minilm`, `gemma3:4b`), และรันสคริปต์สร้าง seed workspace/auth policy

---

### ค. ความเสี่ยงสำคัญ (Key Architectural Risks)

| ปัจจัยเสี่ยง | รายละเอียดความเสี่ยง | ระดับ |
| :--- | :--- | :---: |
| **1. Runtime Pinning Fragility** | โค้ดบังคับ `Bun 1.3.14` และ `Elysia 1.4.30` เป๊ะๆ ([`composition.constants.ts:23-24`](file:///tmp/arra-oracle-v4/app/server/src/composition.constants.ts#L23-L24)) หากสภาพแวดล้อม MacLab อัปเดต Bun เป็นเวอร์ชันใหม่กว่า เซิร์ฟเวอร์จะไม่ยอมบูตทันที | **สูง** |
| **2. Single Writer Bottleneck** | ล็อกการเขียนผ่าน `fd-42` เพียงโปรเซสเดียว ไม่รองรับ Concurrent Writers จากหลายเครื่อง/หลายโปรเซส หากเกิด Crash ค้างคา Lock ไฟล์ Dataset อาจล็อกค้าง | **สูง** |
| **3. Ollama Dependency & Digest Drift** | หาก Ollama ปิดอยู่ Semantic search จะล่มตอบ `model_unavailable` ทันที และหากโมเดลใน Ollama อัปเดต hash เปลี่ยน เวกเตอร์จะถูกล็อกห้ามบันทึก | **กลาง-สูง** |
| **4. Dual Root Maintenance** | ต้องรันและเก็บทั้งโฟลเดอร์ `target19` และ `legacy15` พร้อมกันเพื่อหล่อเลี้ยง legacy memory tools และ operations audit table จนกว่าจะทำตามแผน R33 สำเร็จ | **กลาง** |
| **5. Fleet Incompatibility** | กองเรือในบ้านคุ้นเคยกับ format ของ v3; การจะปรับให้ agent ส่งข้อความและดึง context ผ่าน v4 ที่มี taxonomy ตายตัวและ membership boundary เคร่งครัด จะต้องปรับ prompt/tools ของ agent หลายตัว | **กลาง** |

---

## 4. ข้อเสนอแนะเชิงกลยุทธ์ (Recommendation for No.1 & Bo)
1. **คง v3 HAOS (:8099) ให้บริการตามปกติ**: ห้ามแตะต้องหรือหยุดการทำงานของ v3 เพื่อรักษาเสถียรภาพของกองเรือ
2. **ไม่ทำ Data Migration จาก v3**: ยึดตามคำสั่ง R32 ของ อ.นัท อย่างเคร่งครัด
3. **ทดสอบ v4 ใน Sandbox เท่านั้น**: หากต้องการทดสอบ ให้จัดทำเป็น isolated container หรือแยกโฟลเดอร์เฉพาะบน MacLab รันพอร์ต 3939 โดยไม่ผูกกับ production traffic ของ fleet ในระยะนี้
