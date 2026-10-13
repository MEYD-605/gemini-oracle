# 🚀 Sovereign Vibe Coder — 1-Click Starter Kit

> **ชุดเครื่องมือเริ่มต้นสำหรับ Vibe Coding ระดับสถาปัตยกรรมด้วย Antigravity CLI (`agy`)**  
> อ้างอิงตามพิมพ์เขียวบทที่ 8 ของหนังสือ *The Sovereign Vibe Coder Handbook*  
> พัฒนาโดย **Master Bo** & **No.6 Gemini (Oracle Council, MacLab HQ)** | ครูผู้ชี้แนะ: **อาจารย์พี่ณัฐ (nazt_)**

---

## 🎯 ปรัชญาแห่ง Sovereign Vibe Coding

**Vibe Coding ไม่ใช่แค่การสั่ง AI เจนโค้ดลอยๆ แล้วก๊อปแปะ**  
แต่คือการทำตัวเป็น **"ผู้อำนวยการเพลง (Conductor)"** ที่ควบคุม Agentic AI ด้วย:
1. **บริบทมหาศาล 1,000,000 โทเค็น** (Gemini 3.8 Flash) — จดจำได้ทั้งคลังโค้ด ไม่ตาบอดในโปรเจกต์ใหญ่
2. **Safety Gate กำกับความปลอดภัย** — ป้องกันคำสั่งทำลายล้าง (`rm -rf`, format disk, git reset หลุด)
3. **Lifecycle Hooks & Progress HUD** — สตรีมสถานะการทำงานสดแบบ Real-Time เข้าสู่เทอร์มินัลและ Discord
4. **Tokenomics ชั้นเลิศ (RTK)** — ตัดข้อความขยะในเทอร์มินัล ประหยัดโทเค็นได้ถึง 60% – 90%
5. **สูตรโกงงบ 0 บาทสำหรับนักศึกษา** — ปลดล็อกพลังผ่านโควตาฟรีและ 9Router

---

## 📦 โครงสร้างไฟล์ใน Starter Kit

```
agy-vibe-kit/
├── install.sh                  # 🚀 สคริปต์ติดตั้งอัตโนมัติ 1-Click
├── config/
│   ├── settings.json           # การตั้งค่า AGY (SessionStart, Permissions, Dark Theme)
│   └── hooks.json              # กำหนดจุด Hook (PreToolUse, PostToolUse, Stop)
├── scripts/
│   ├── safety-gate.py          # 🛡️ ระบบตรวจจับและระงับคำสั่งอันตราย
│   └── vibe-progress.py        # ⚡ ระบบรายงานความคืบหน้า HUD และ Discord
├── templates/
│   ├── settings.json.template  # เทมเพลตสำหรับปรับแต่ง settings
│   ├── hooks.json.template     # เทมเพลตสำหรับกำหนดตำแหน่งไดเรกทอรีสคริปต์
│   ├── vibe.env.example        # ตัวแปรสภาพแวดล้อม (Discord Webhook, 9Router)
│   └── AGENTS.md.template      # ข้อตกลงการทำงานของ Agent ประจำโปรเจกต์
└── README.md                   # 📖 คู่มือการใช้งานฉบับสมบูรณ์
```

---

## ⚡ การติดตั้งแบบ 1-Click (Quickstart)

### 1. ความต้องการขั้นต่ำของระบบ
- **ระบบปฏิบัติการ**: macOS หรือ Linux (รวมทั้ง WSL บน Windows)
- **เครื่องมือจำเป็น**: `python3`, `git`, `curl`
- **Antigravity CLI**: ติดตั้งจากเว็บทางการของ Google
  ```bash
  # ดาวน์โหลดไบนารีอย่างเป็นทางการจาก Google
  # https://antigravity.google.com
  # นำไฟล์ไบนารี 'agy' วางไว้ใน ~/.local/bin/ หรือโฟลเดอร์ใน $PATH
  ```

### 2. รันคำสั่งติดตั้ง
เพียงสั่งรันคำสั่งเดียวในโฟลเดอร์นี้:

```bash
chmod +x install.sh
./install.sh
```

> 🔒 **Seat Protection Guard**:  
> หากตรวจพบว่าในระบบมี `trustedWorkspaces` ใน `settings.json` อยู่แล้ว (เช่น เป็นเครื่องเซิร์ฟเวอร์หรือที่นั่ง Agent ในทีม) ตัวติดตั้งจะ **ปฏิเสธการติดตั้งทันที** เพื่อป้องกันการเขียนทับการตั้งค่าที่นั่งของตนเองหรือเพื่อนในฟลีตโดยไม่ตั้งใจ  
> หากต้องการบังคับติดตั้งทับจริงๆ ให้ระบุแฟล็ก `--force`:
> ```bash
> ./install.sh --force
> ```

สคริปต์จะทำการ:
1. ตรวจสอบ dependencies ในระบบ และตรวจสอบว่าไม่มีการทับที่นั่งเดิม (เว้นแต่ระบุ `--force`)
2. วางโครงสร้างโฟลเดอร์ `~/.gemini/config`, `~/.gemini/antigravity-cli`, `~/.gemini/vibe-kit/`
3. สำรองข้อมูลคอนฟิกเดิม (Backup) อัตโนมัติป้องกันการสูญหาย
4. คัดลอกและตั้งสิทธิ์สคริปต์ Safety Gate และ Progress HUD
5. รัน Self-Test ตรวจสอบความถูกต้องของสคริปต์ 100%

---

## 🛡️ ระบบความปลอดภัย (Safety Gate)

Safety Gate ทำหน้าที่เป็นด่านหน้าตรวจจับเครื่องมือ `run_command` ก่อนส่งไปรันในเทอร์มินัลจริง:

| ประเภทคำสั่ง | ตัวอย่างคำสั่ง | การตอบสนอง | เหตุผล |
|---|---|---|---|
| **Critical Destruction** | `rm -rf /`, `rm -rf ~`, `mkfs`, `dd of=/dev/sda` | **⛔ DENY (บล็อกทันที)** | ป้องกันการลบข้อมูลระบบหรือดิสก์เสียหาย |
| **High-Risk Operations** | `git reset --hard`, `git push --force`, `git clean -fd` | **⚠️ ASK (ถามยืนยัน)** | ป้องกันการทับโค้ดที่ยังไม่ได้คอมมิต |
| **Normal Operations** | `rtk ls`, `cargo test`, `npm test`, `git status` | **✅ ALLOW (อนุญาต)** | ทำงานตามปกติอย่างราบรื่น |

---

## 📱 Pocket Vibe Coding & Discord Notifications

คุณสามารถรับการแจ้งเตือนความคืบหน้าสดไปยัง Discord ได้ โดยตั้งค่าตัวแปรสภาพแวดล้อม:

```bash
export VIBE_DISCORD_WEBHOOK="https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
```

หรือสร้างไฟล์ `~/.gemini/vibe-env` เพื่อโหลดค่าอัตโนมัติ

### การติดตาม Log ภายในเครื่อง:
```bash
tail -f ~/.gemini/vibe-progress.log
```

---

## 🎓 สูตรงบ 0 บาทสำหรับนักศึกษาและมือใหม่

1. **ใช้สิทธิ์ Google Workspace for Education หรือ AI Studio Free Tier**
   - ดึงโทเค็น OAuth มาใส่ในระบบ ไม่ต้องเสียค่าสมาชิกรายเดือน
2. **ประหยัด Token ด้วย RTK**
   - ทุกคำสั่งในเทอร์มินัลจะถูกกรองข้อความขยะทิ้ง ทำให้บริบท 1 ล้านโทเค็นใช้งานได้นานขึ้นนับสิบเท่า
3. **เสกภาพประกอบฟรีด้วย Nano Banana 2**
   - ผ่าน 9Router ที่ `http://127.0.0.1:20128/v1` ใช้โมเดล `ag/gemini-3.1-flash-image` เจนภาพประกอบโปรเจกต์ได้ไม่จำกัด

---

## 🧪 การทดสอบระบบด้วยตนเอง (Self-Test)

ทดสอบสคริปต์ทั้งสองตัวได้ทุกเมื่อด้วยคำสั่ง:

```bash
# ทดสอบ Safety Gate
python3 scripts/safety-gate.py --test

# ทดสอบ Progress HUD
python3 scripts/vibe-progress.py --test
```

---

## 🤝 การใช้งานในโปรเจกต์ใหม่

เมื่อสร้างโปรเจกต์ใหม่ เพียงคัดลอกไฟล์กติกาเอเจนต์ไปวางที่รากของโปรเจกต์:

```bash
cp templates/AGENTS.md.template /path/to/my-project/AGENTS.md
cd /path/to/my-project
agy
```

ขอให้มีความสุขกับการเขียนโค้ดไร้ขีดจำกัด! 🦾✨
