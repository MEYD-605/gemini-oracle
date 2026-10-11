# Summary of "ย้ายบ้าน Oracle" (ferry · กับดัก · systemd)
**Author:** Nat Weerawan (ณัฐ วีระวรรณ์) · **Date:** 2026-07-26

Bugs and lessons measured on live machines (2026-07-25 to 2026-07-26).

## Core Philosophy
- "Every bug in this book stems from the same disease: results delivered without explanation."
- "The fix is always the same: make results explain their reasons, and never let 'unknown' look like 'success'."

---

## ภาค 1: Ferry ย้ายอะไร และไม่ย้ายอะไร (บท 1–4)

### 5 Layers of Ferry (Sequential Order)
1. **`repo`**: `git clone` or `rsync -a --exclude target/`. Source repo is small (~5.9MB). Always exclude `target/` build artifacts.
2. **`sessions`**: `rsync -a ~/.claude/projects/<encoded-dir>/`. Contains `.jsonl` files.
   - *Pitfall*: `ls *.jsonl` vs `fd -e jsonl .`: subagent transcripts sit in subdirectories. Counting only top-level `.jsonl` misses deep session logs.
   - *Path Encoding*: `<encoded-dir>` is the absolute path of the repo with `/` replaced by `-`. If repo path changes on target host, directory name must be updated, and `"cwd"` inside `.jsonl` files must be rewritten via `sed -i`, otherwise `/resume` fails.
3. **`memory`**: `memory/*.md` inside the encoded project directory. Small but critical — without it, the oracle acts as if it forgets past session context.
4. **`credentials`**: `pass` store (vault), `federationToken` (`maw.config.json`), `gh auth`. Must be manually verified/imported per host. Never auto-rsynced without human check.
5. **`tooling`**: `command -v maw claude direnv git gh cargo rustc tmux`. Check tool dependencies on target host before starting.

### 3 Items Ferry NEVER Auto-Migrates
1. **`tmux session`**: `.jsonl` files are transcript logs, not active OS processes. Socket paths `/tmp/tmux-<uid>/default` depend on Unix UID. Must start fresh tmux sessions on target host.
2. **`namedPeers` / `federationToken`**: Silent failure if omitted. Oracle works locally but fails cross-node `maw hey` without error warning. Must configure `maw.config.json` manually.
3. **`gh auth`**: GitHub auth credentials live outside repo and project dirs. Must run `gh auth login`.

---

## ภาค 2: กับดักสิบชั้น (บท 5–14)

- **บทที่ 5: `MAW_HOME`**: ย้ายทุกอย่างตาม `MAW_HOME`
- **บทที่ 6: Config Layers**: แยกแยะระหว่าง Legacy vs NN config
- **บทที่ 7: `defaultEngine`**: คีย์ที่ตั้งแล้วไม่มีผลหากมี override ซ้อนอยู่
- **บทที่ 8: Engine Resolution**: สถาปัตยกรรมระบุเอนจินและกับดักชื่อชน
- **บทที่ 9: Cross-Node Hey**: 3 ชั้นของ `maw hey`
- **บทที่ 10: Trust / Pubkey**: Pubkey ที่เกิดจากการ probe อัตโนมัติ (TOFU)
- **บทที่ 11: Frozen Identity**: การล็อกตัวตน Agent ไม่ให้สับสนหลังย้ายเครื่อง
- **บทที่ 12: Name Resolution**: ปัญหาระบบระบุชื่อเครื่อง (musl, mDNS, Link-local)
- **บทที่ 13: Controller Context**: ตัวควบคุมที่อยู่ผิดบริบท
- **บทที่ 14: macOS Local Network Permission**: สิทธิ์เครือข่ายท้องถิ่นบน macOS

---

## ภาค 3: ทำให้มันอยู่รอด (บท 15–20)

- **บทที่ 15: Detach serve**: ใช้ `setsid` / `nohup` / background detachment ให้ถูก
- **บทที่ 16: systemd User Unit**: การสร้าง user-level service (`~/.config/systemd/user/`)
- **บทที่ 17: Linger**: ทำไม service ตายเมื่อ logout -> ต้องรัน `loginctl enable-linger <user>`
- **บทที่ 18: PM2 & Daemon Privileges**: การคุม daemon สิทธิ์
- **บทที่ 19: Verify ให้ถูก**: อย่าเชื่อแค่ exit 0 ให้ตรวจผลลัพธ์จริง (`ls`, `curl`, `ps`, `maw status`)
- **บทที่ 20: Checklist ย้ายบ้านฉบับเต็ม**: ตารางสรุปขั้นตอนตรวจสอบก่อน-หลังย้าย
