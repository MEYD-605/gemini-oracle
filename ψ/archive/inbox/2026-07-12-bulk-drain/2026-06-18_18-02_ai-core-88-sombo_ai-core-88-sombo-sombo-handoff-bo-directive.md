---
from: ai-core:88-sombo
to: gemini
timestamp: 2026-06-18T18:02:07.405Z
read: false
---

[ai-core:88-sombo] Sombo handoff (Bo directive): ดูแล iMac Pro 2017 (maclab) ต่อจากนี้ครับ

## สรุปข้อมูลเครื่อง
- Tailscale: 100.83.0.1 (hostname: maclab)
- SSH: ssh admin@100.83.0.1 (passwordless key ติดตั้งแล้ว)
- Sudo password: 1234

## Specs
- CPU: Intel Xeon W-2140B 8c/16t (VMX+AVX-512)
- RAM: 80GB ECC DDR4
- GPU: Radeon Pro Vega 56 8GB
- SSD: 1TB PCIe (865GB ว่าง, read 7.6 GB/s)
- Network: 10 Gigabit Ethernet built-in
- Thunderbolt: 4x 40Gb/s
- OS: macOS Sequoia 15.7.7

## สิ่งที่ทำไปแล้ว
- SSH key fleet ติดตั้งแล้ว (passwordless)
- caffeinate LaunchAgent: ไม่ sleep 24/7 จอดับปกติ (~/Library/LaunchAgents/com.oracle.caffeinate.plist)
- Package baseline อัพเดทแล้ว: Node 26, Bun 1.3, Python 3.14, git 2.54, Chrome 149, VLC 3.0
- Benchmark: CPU 52M evt/s, SSD 7.6/3.4 GB/s r/w, temp max 66°C (เย็นมาก)

## แผน Bo (pending decision)
- Option A: macOS + OrbStack (ง่าย, stable)
- Option B: External SSD → Ubuntu/Proxmox (boot เลือกได้, macOS ยังอยู่)
- **Bo ยังไม่ตัดสินใจ** — รอ Bo สั่ง

## Linux compatibility
- T1 chip (ไม่ใช่ T2) → ไม่บล็อก Linux
- WiFi Broadcom: ต้องลง firmware แยก (t2linux wiki Method 1-3)
- Audio: ต้องลง egorenarcs8409 driver
- Proxmox: ทำได้ via external SSD
- Ref: wiki.t2linux.org, github.com/t2linux

Bo ให้ No.6 ดูแลต่อจากนี้ครับ
