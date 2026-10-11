# ย้ายบ้าน Oracle (Ferry · Traps · Systemd) Summary & Reference

Detailed reference synthesized from Nat Weerawan's book **"ย้ายบ้าน Oracle"** (July 26, 2026) and live migration execution logs on machine `black`.

---

## ภาค 1: Ferry ย้ายอะไร และไม่ย้ายอะไร (บท 1–4)

### 5 ชั้นของการ Ferry (ลำดับปฏิบัติจริง)
1. **`repo`**: โค้ดคลังหลัก (`git clone` หรือ `rsync -a --exclude target/`)
2. **`sessions`**: ไฟล์ประวัติสนทนา `.jsonl` ใน `~/.claude/projects/<encoded-dir>/` (ต้องนับ subagent transcripts ในโฟลเดอร์ย่อยด้วย `fd -e jsonl`)
3. **`memory`**: บันทึกความจำ `memory/*.md` (ย้ายและ merge ด้วย `comm` เพื่อไม่ให้ทับข้อมูลเดิม)
4. **`credentials`**: vault (`pass`), `federationToken`, `gh auth` (ต้องตั้งด้วยมือเพื่อความปลอดภัย)
5. **`tooling`**: ตรวจสอบเครื่องมือประกอบ (`maw`, `claude`, `tmux`, `git`, `gh`, `cargo`, `rustc`)

### 3 สิ่งที่ Ferry ไม่ย้ายให้อัตโนมัติ (และไม่เตือนว่าขาด)
- **`tmux session`**: `.jsonl` คือบันทึก ไม่ใช่ process ที่รันอยู่ ต้องเปิด session ใหม่เองที่ปลายทาง (`/tmp/tmux-<uid>`)
- **`namedPeers` / `federationToken`**: ต้องเขียนใน `maw.config.json` ใหม่ที่ปลายทาง
- **`gh auth`**: ต้องสั่ง `gh auth login` ใหม่

---

## ภาค 2: กับดักสิบชั้น (บท 5–14)
- **`MAW_HOME`**: ย้ายทุกอย่างตาม env var
- **Config Layers**: แยกแยะระหว่าง Legacy config vs NN config
- **`defaultEngine` Trap**: คีย์ที่ตั้งแล้วไม่มีผลหากโดน override
- **Engine Resolution & Name Collisions**: ปัญหานามแฝงและชื่อชนกัน
- **Cross-Node Hey (3 ชั้น)**: โครงสร้างคำสั่งสื่อสารข้ามเครื่อง (`maw hey`)
- **Trust & Pubkey Probing**: การแลกเปลี่ยน SSH Public Key ผ่านการ probe
- **Identity Freeze**: ล็อกตัวตน Agent หลังย้ายเครื่องเพื่อไม่ให้สับสน role/node
- **Name Resolution**: ปัญหา musl, mDNS (`.local`), และ link-local IP
- **Context Controller & MacOS Local Network Permissions**: การจัดการสิทธิ์เครือข่าย

---

## ภาค 3: ทำให้มันอยู่รอด (บท 15–20)
- **Detach Serve**: รัน background process ด้วย `setsid` / `nohup` ให้ถูกต้อง
- **Systemd User Unit**: สร้าง service ใน `~/.config/systemd/user/`
- **Linger (`loginctl enable-linger`)**: ป้องกัน daemon/service ตายเมื่อ SSH session ถูกปิด
- **PM2 Process Management**: การจัดการ daemon และสิทธิ์ที่ถือครอง
- **Verification**: ตรวจสอบผลลัพธ์จากเครื่องจริง ไม่วัดแค่ `exit 0`
- **Checklist ย้ายบ้าน**: ตารางตรวจสอบก่อน-หลังย้าย 100%

---

## Technical Workarounds & Pitfalls Discovered (Live Migration Sessions)

1. **Path Encoding & `sed` Rewrite:**
   - `<encoded-dir>` ใน `~/.claude/projects/` คือ absolute path ที่แทน `/` ด้วย `-` (เช่น `-home-meyd-agents-sombo-Code-...`)
   - หากย้ายปลายทางแล้วเปลี่ยน path ต้องเปลี่ยนชื่อโฟลเดอร์ `<encoded-dir>` (ใช้ `mv --` สำหรับชื่อที่ขึ้นต้นด้วย `-`) และใช้ `sed -i` ไล่แก้ `"cwd"` ภายในไฟล์ `.jsonl` ทั้งหมด เพื่อให้ `/resume` ค้นเจอประวัติสนทนาเดิม

2. **SQLite Malformed DBs:**
   - การก๊อปปี้ `state.db` ข้ามเครื่องในขณะที่ process ยังทำงานอยู่อาจทำให้เกิด `database disk image is malformed`
   - แก้ไขโดยการลบ `.db`, `-shm`, และ `-wal` ออกเพื่อให้ Hermes Agent สร้าง schema ใหม่ที่สะอาดอัตโนมัติ

3. **9router Model Prefix Requirement:**
   - การระบุโมเดลใน `config.yaml` ผ่าน 9router ต้องใส่ prefix ค่ายด้วยเสมอ (เช่น `ag/gemini-3.6-flash-high`) หากระบุแค่ `gemini-3.6-flash-high` จะเจอ `404 NOT_FOUND`

4. **Discord Bot Token DM Auto-Invalidation:**
   - Discord จะ auto-revoke Token ที่ถูกแปะลงในช่องแชต/DM ทันที
   - การเปลี่ยน Token ต้องอัปเดตใส่ `.env` ตรงๆ และรีสตาร์ต Gateway ทันที

5. **`maw token` vs `federationToken` vs `DISCORD_BOT_TOKEN`:**
   - `maw token` ( subcommands `maw token list|use|current` ) ใช้สำหรับจัดการเอนจิน API key/token
   - `federationToken` ใช้สำหรับสื่อสารข้ามเครื่องผ่าน `maw hey`
   - `DISCORD_BOT_TOKEN` ใช้สำหรับรัน Discord Gateway ใน `.env`
