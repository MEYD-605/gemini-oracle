# herdr ห้องทีม (team room) สูตรโกง

> ทั้งทีมอยู่หน้าเดียว ส่งใครออกไป space ของตัวเอง แล้วดึงกลับ — `herdr-room` บน herdr, ใช้จริง 2026-10-05 (ทีม pulse-team = Pulse + athena)

---

## 🗺️ ห้องที่มีอยู่

```bash
herdr-room list
```
```
homekeeper   war-room     cols  OPEN  kvmbox-oracle · gateway-oracle · petkeeper · homelab
laris-co     creative     fib   OPEN  pigment-oracle · calliope-oracle
laris-co     office       fib   out   transcriber-oracle · pigment-oracle · nexus-oracle · calliope-oracle
laris-co     pulse-team   fib   OPEN  pulse · athena-oracle
```
`OPEN` = space ของห้องเปิดอยู่ · `out` = ทุกคนออกไปแล้ว แต่ state ยังจำสมาชิกกับ layout ไว้

## 🏠 สร้างห้องจาก space ของเรา (ตัวเองไม่ย้าย)

```bash
herdr-room in pulse wA:p1 athena-oracle --session laris-co --dry
herdr-room in pulse wA:p1 athena-oracle --session laris-co
```
```
room 'pulse' · session laris-co · layout fib · 2 members: pulse, athena-oracle
  run   herdr --session laris-co pane move w1R:p1 --new-tab --workspace wA --label scratch --no-focus
  run   herdr --session laris-co pane move wA:p3 --tab wA:t1 --target-pane wA:p1 --split right --ratio 0.5 --no-focus
  name  wA:p1 = pulse
  name  wA:p3 = athena-oracle
```
ห้องชื่อเดียวกับ space ที่สมาชิกคนแรกนั่งอยู่ → คนแรกไม่ต้องย้าย · `--dry` ก่อนทุกครั้ง

## 🏷️ ตั้งชื่อทีม

```bash
herdr-room rename pulse pulse-team --session laris-co
```
```
  space wA and its tab(s): 'pulse' -> 'pulse-team'
  saved state: laris-co__pulse.json -> laris-co__pulse-team.json
```

## 🔁 ส่งออก / ดึงกลับ

```bash
herdr-room out pulse-team athena-oracle --session laris-co
herdr-room in  pulse-team --session laris-co
```
`out` + ชื่อ = ออกเฉพาะคนนั้น ไป space ที่ label เป็นชื่อตัวเอง · `in` ไม่ใส่ชื่อ = ดึงทุกคนกลับจาก state ที่ save ไว้ (หาเจอจาก folder แม้ pane id เปลี่ยน)

## 🎨 ทีมจาก 2 oracle ที่อยู่คนละ space (ทีม creative)

```bash
herdr-room in pigment-calliope pigment-oracle calliope-oracle --session laris-co --dry
herdr-room in pigment-calliope pigment-oracle calliope-oracle --session laris-co
herdr-room rename pigment-calliope creative --session laris-co
```
ไม่มี space ชื่อห้อง → คนแรกเปิด space ใหม่ให้ · ชื่อ agent หรือชื่อ folder ใช้ได้ทั้งคู่

## 🧩 เพิ่มสมาชิก / จัดใหม่

```bash
herdr-room in demo-room /tmp/hr-demo/delta --session laris-co
herdr-room in demo-room --layout cols --session laris-co
```
สมาชิกใหม่ต่อท้าย spiral (fib 4 คน: 88x44 | 88x22 / 44x22 · 44x22) · `--layout` จัดห้องที่เปิดอยู่ใหม่

## 📐 layout

| layout | หน้าตา |
|--------|--------|
| `fib` (default) | คนแรกครึ่งซ้าย คนถัดไปเอาครึ่งของที่เหลือ หมุนขวา/ลง (2 คน = 50/50 · 3 คน = ซ้าย · ขวาบน · ขวาล่าง) |
| `cols` / `rows` | คอลัมน์ / แถว เท่ากันตามลำดับสมาชิก |
| `main --ratio 0.6` | คนแรกคอลัมน์ซ้ายกว้าง 0.6 ที่เหลือซ้อนขวา |

## 🧠 มันย้ายยังไง (ทำไมรันจาก pane ไหนก็ได้)

- คนแรกเปิดห้อง: `pane move --new-workspace --label <room>` (หรือนั่งอยู่ในห้องแล้ว)
- คนอื่นไปพัก tab `scratch` ใน space ของห้องก่อน — ใน space เดียวกัน pane id ไม่เปลี่ยน
- แล้วย้ายเข้า tab หลักด้วย `--split` + `--ratio` (= ส่วนที่ pane เป้าหมาย **เก็บไว้**) ไม่ต้อง resize ทีหลัง
- ตั้งชื่อ agent ใหม่ทุกครั้งหลังย้าย (herdr ทิ้งชื่อเวลาย้าย) · space ไหนว่างก็ปิดตัวเอง

## ⚙️ ที่เก็บ

| อะไร | ที่ไหน |
|------|--------|
| state ของห้อง | `~/.local/state/herdr-room/<session>__<room>.json` (สมาชิก: path, pane ล่าสุด, ชื่อ · layout · เวลา) |
| script | `~/.local/bin/herdr-room` (python3 → `herdr --session S pane move` ด้วย pane id ตรง ๆ) |
| skill | `/herdr-room` |

## ⚡ ลัด

| ทำอะไร | คำสั่ง |
|--------|--------|
| ดูทุกห้อง | `herdr-room list` |
| สร้างห้อง | `herdr-room in pulse wA:p1 athena-oracle --session laris-co` |
| ตั้งชื่อ | `herdr-room rename pulse pulse-team --session laris-co` |
| ส่งคนเดียวออก | `herdr-room out pulse-team athena-oracle --session laris-co` |
| ดึงทุกคนกลับ | `herdr-room in pulse-team --session laris-co` |
| จัดใหม่ | `herdr-room in demo-room --layout cols --session laris-co` |

## ⚠️ trap ที่เจอจริง

| trap | วิธีเลี่ยง |
|------|-----------|
| `herdr-room out <room>` ไม่ใส่ชื่อ | ทุกคนออก รวมตัวเราด้วย → ใส่ชื่อคนที่จะออกเสมอ |
| pane id เปลี่ยนทุกครั้งที่ย้าย (`w1R:p1` → `wA:p3` → `w1T:p1` → `wA:p4`) | อ้างด้วยชื่อ agent หรือ folder ไม่ใช่ pane id |
| oracle เดียวมีหลายร่าง (pulse มี 4) → path กำกวม ถูกปฏิเสธ | ใส่ pane id ของร่างที่ต้องการ (`wA:p1`) |
| pane id ซ้ำข้าม session (`w8:p2` อยู่ทั้ง office และ war-room) | ใส่ `--session` เสมอ |
| สมาชิกอยู่อีก session | ย้ายข้าม session ไม่ได้ → ใช้ /herdr-bring ก่อน แล้วค่อยเข้าห้อง |
| `maw herdr join` จาก session อื่น: "pane … not found" | มันเติม tab ของ pane ที่รันมัน → herdr-room ไม่พึ่ง "pane ที่ฉันรันอยู่" |
| ย้ายเข้า tab ที่ zoom อยู่ → `changed:false` เงียบ ๆ | unzoom ก่อน |
| ออกบางคนแล้วขึ้น "closed itself once empty" ทั้งที่ห้องยังเปิด | แก้แล้ว: บอก "stays open with N pane(s)" |

---

🤖 ตอบโดย Pulse (Oracle AI) จาก Nat → laris-co/pulse
