---
title: "herdr ⌘K / ⌘J Keybindings & WezTerm F-Key Translation Architecture"
date: "2026-09-20"
author: "No.6 Gemini (Research Specialist & Pack Leader)"
source: "https://gist.github.com/nazt/594440a154b69793affbf538e5cd6300"
tags: ["herdr", "wezterm", "keybindings", "f-keys", "tui", "popup", "terminal", "cheat-sheet"]
---

# ⌘K / ⌘J ใน herdr สูตรโกง (Knowledge Synthesis)

> สรุปองค์ความรู้จาก Gist ของอาจารย์ P'Nat (`nazt_`) บันทึกจาก session `eec833dd` โดย neo (Claude, Fable 5.1) บน `laris-co/neo-oracle`

---

## 1. Core Architecture — Cmd to F-Key Translation

**ปัญหาหลัก:** herdr เป็น TUI ที่รันใน WezTerm โดย**ไม่ได้เปิด kitty keyboard protocol** บน host terminal ทำให้ macOS Cmd chord ไม่สามารถส่งตรงเข้า herdr ได้ (ไม่มี byte ให้ decode)
**ทางออก:** WezTerm ทำหน้าที่ดักจับ Cmd chord แล้วแปลงเป็น F-key ธรรมดาส่งให้ herdr

```
⌘K ──► WezTerm SendKey F12 ──► herdr keys.goto = ["prefix+g","f12"] ──► pane search
⌘J ──► WezTerm SendKey F11 ──► herdr [[keys.command]] key="f11"    ──► popup herdr-ask --layout
```

### Mapping Matrix
| คำสั่ง | WezTerm (`~/.wezterm.lua`) | herdr (`~/.config/herdr/config.toml`) | การทำงาน |
|---|---|---|---|
| **⌘K** | `CMD+k` → `act.SendKey { key = 'F12' }` | `keys.goto = ["prefix+g", "f12"]` | เปิด built-in pane search |
| **⌘J** | `CMD+j` → `act.SendKey { key = 'F11' }` | `[[keys.command]] key="f11", type="popup"` | กล่องพิมพ์ broadcast หา agent ทุกตัวในแท็บ |

*Note: F-keys ที่จองแล้ว: `f7-f10` (LinearMouse), `f11` (⌘J), `f12` (⌘K goto)*

---

## 2. Interactive Broadcast Box (`herdr-ask` & `herdr-layout`)

- **`herdr-ask --layout`**: Popup ขนาด 60% width x 9 rows แสดง layout pane พร้อมลูกศร `▶` ชี้เป้า
  - `Enter`: ส่งข้อความหาทุก agent ในแท็บที่มีสัญลักษณ์ `▶`
  - `→` / `←`: สลับโหมดเป้าหมาย (all → pane1 → pane2 → ... → all)
  - `Esc`: ปิดโดยไม่ส่งอะไร
  - สัญลักษณ์: `▶` = เป้าหมายส่ง, `●` = pane ปัจจุบัน, `shell` = ไม่มี agent (ข้าม)
  - Dispatch จริงใช้ `herdr agent prompt <pane_id> "<msg>"` (มี gate ตรวจสถานะ agent ไม่ใช้ `pane run` ที่ยิง raw ลง shell)
- **`herdr-layout`**: วาด ASCII box diagram จาก API จริง (`herdr pane layout --current` และ `herdr pane list`)

---

## 3. Critical Traps & Engineering Wisdom

1. **Popup TTY vs `plugin_action`**: `type = "plugin_action"` ไม่เคย trigger จาก client (v0.9.0) ต้องใช้ `type = "popup"` เท่านั้น เพราะ popup เป็นเจ้าของ TTY จึงอ่าน stdin ได้
2. **Client Reload Requirement**: การ reload config หลังแก้ `keys.command` แค่ `herdr server reload-config` ไม่พอ (server ตอบ applied แต่ client ไม่ bind) ต้องกด `prefix+shift+r` ฝั่ง client หรือ detach/attach ใหม่
3. **`tput cols` Trap**: ภายใน popup `tput cols` จะ fallback ได้ 80 เสมอแม้หน้าจอจะกว้าง 107 ให้ใช้ `read -r rows cols < <(stty size </dev/tty 2>/dev/null)` แทน
4. **Esc vs Arrow Key Ambiguity**: ทั้งสองขึ้นต้นด้วย `\e` เหมือนกัน ต้องแยกด้วย peek 50ms (`read -rsn1 -t 0.05`) หลังรับ `\e`
5. **Effective Usable Height**: Popup ที่ตั้ง `height = 5` จะมีพื้นที่ใช้จริงเพียง 3 แถวหลังหักขอบ ห้ามมี `\n` นำหน้ามิฉะนั้นบรรทัดแรกจะหลุดจอ
6. **Per-Pane Delivery Status**: เวลาส่ง broadcast ห้ามทำ all-or-nothing ให้ loop ส่งทีละ pane และรายงานผลลัพธ์แยกกัน (`ok`, `FAIL`, `skip`)
