# 2026-09-22: Handheld Server Architecture (HAOS + Oracle Fleet + Lightroom)

**Device**: ONEXPLAYER F1 (`DESKTOP-UMN5FJV` / `100.87.51.122`)  
**Hardware**: AMD Ryzen 7 7840U (8C/16T), 32 GB LPDDR5x, 2 TB NVMe SSD, Wi-Fi 6E (No RJ45), 48 Wh Battery.  
**RAM State**: 31.23 GB visible in Windows (512 MB UMA VRAM), ~20-25 GB free.

## Architectural Decision: Windows 11 Pro + Hyper-V + WSL2

### Why Proxmox / Bare-metal Linux Fails on F1
1. **Network**: Handheld has no RJ45 Ethernet port. Proxmox installer and host management require wired Ethernet; Wi-Fi under Proxmox is unstable without external USB-C dock.
2. **Battery Swelling Hazard (24/7 plugged in)**:
   - OneXConsole provides proprietary **Bypass Power Supply** and **Charge Limit (80%)** via Windows ACPI services.
   - On bare-metal Linux/Proxmox, this service does not exist. Battery remains locked at 100% at ~50°C, causing dangerous swelling over time.
3. **Fan Control**: F1 uses a proprietary Embedded Controller (EC). Fan curves on Linux require unsupported community patches or default to loud 100% blast.
4. **Lightroom**: Adobe CC does not run on Linux. GPU passthrough of Radeon 780M (Phoenix APU) to a Windows VM in Proxmox triggers APU reset bugs and host freezes.

### Optimal Hybrid Architecture
- **Host**: Windows 11 Pro (manages battery bypass, fan curves, sleep, and Lightroom).
- **HAOS**: Runs inside **Hyper-V Generation 2 VM** (official `haos_ova` VHDX, 2 vCPU, 4 GB RAM, auto-start, Default Switch + Windows portproxy 8123/80).
- **Oracle Fleet**: Runs inside **WSL2 (Ubuntu 26.04.1 LTS Resolute Raccoon)** with Docker, Python, Node, Tailscale mesh.
- **Resource Distribution (31.2 GB Total RAM)**:
  - HAOS: 4 GB
  - WSL2: 6 GB (dynamic pool)
  - Windows 11 + Lightroom: 21+ GB
- **Smart Home Protocol**: Recommended network coordinator (SLZB-06 over Wi-Fi/LAN) or `usbipd-win` for USB dongles.
