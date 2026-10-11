# Master Architecture Blueprint: ONEXPLAYER F1 All-in-One Server (2026-09-22)

**Hardware**: ONEXPLAYER F1 (ONE-NETBOOK) — AMD Ryzen 7 7840U (8C/16T), 32GB LPDDR5x, 2TB NVMe SSD, Killer Wi-Fi 6E AX1675w, Battery 48Wh.  
**Host OS**: Windows 11 Pro (Build 22631).  
**Role**: 24/7 Mobile Home Server + WSL2 Fleet Node + NAS + HAOS + Portable Creative Workstation.

---

## 4 Core Pillars & Live Implementation Status

### 1. WSL2 Linux Environment (Ubuntu 26.04.1 LTS)
- **Distribution**: `Ubuntu-26.04` (Ubuntu 26.04.1 LTS Resolute Raccoon) [VERIFIED RUNNING]
- **Engine & Kernel**: WSL2 Linux 6.18.33.2-microsoft-standard-WSL2 (16 threads, 15 GB RAM dynamic pool)
- **Configuration (`C:\Users\noone\.wslconfig`)**:
  - `networkingMode=mirrored`: Exposes host Tailscale IP (`100.87.51.122`) and LAN IP (`192.168.1.159`) directly to Linux processes.
  - `autoMemoryReclaim=gradual`: Frees unused Linux pagecache/RAM back to Windows host.
  - `dnsTunneling=true`, `firewall=true`, `autoProxy=true`.
- **System Services & Systemd**: `systemd=true` enabled in `/etc/wsl.conf` [VERIFIED ACTIVE].
- **Containers & Runtime**: Native `docker.io` (29.1.3), `docker-compose-v2` (2.40.3), git, tmux, python3 installed [VERIFIED ACTIVE].
- **Agent Mount**: Workspace mapped to `/mnt/e/Agents/joker-oracle` on dedicated NVMe NAS drive.

### 2. Home Assistant OS (HAOS 18.3)
- **Hypervisor**: Windows Hyper-V Generation 2 VM (`HomeAssistant`) [VERIFIED RUNNING]
- **Compute & RAM**: 2 vCPUs, 4096 MB Static Memory (Dynamic Memory OFF)
- **Storage**: `E:\VMs\haos.vhdx` (Master: `haos_ova-18.3.vhdx`)
- **Firmware**: Secure Boot = Off
- **Networking Topology**:
  - Attached to Hyper-V `Default Switch` (Internal NAT, Guest IPv4: `172.31.174.216`).
  - Safe for RJ45-less handheld (avoids Wi-Fi MAC bridge drops).
  - Portproxy published on host `0.0.0.0`:
    - Port 80 -> `172.31.174.216:80` (Onboarding / Web Frontend)
    - Port 8123 -> `172.31.174.216:8123` (Core HA Web UI)
    - Port 4357 -> `172.31.174.216:4357` (HAOS Observer)
  - Reachable from MacLab/Tailnet via host portproxy:
    - `http://100.87.51.122:8123` and `http://desktop-umn5fjv:8123` [VERIFIED HTTP 307 / 200]
    - `http://100.87.51.122/onboarding.html` [VERIFIED HTTP 200]
    - `http://100.87.51.122:4357/` [VERIFIED HTTP 200]
  - *Note*: Exposure path is strictly **Default Switch + Windows host portproxy** (no External Wi-Fi vSwitch needed). Tailscale add-on inside HAOS remains an optional future enhancement for direct MagicDNS mesh.

### 3. Dedicated 1 TB High-Speed NVMe NAS (Drive E:)
- **Storage Partition**: Dedicated Volume E: (999.1 GB NTFS, Label: `NAS`)
- **Folder Structure**: `E:\Share`, `E:\Media`, `E:\Backup`, `E:\VMs`, `E:\Agents`, `E:\Tools`.
- **SMB Shares & Multi-Path Access**:
  - **Triple-Path Connectivity**:
    1. **Direct USB4 P2P Cable (20 Gbps)**: `smb://169.254.19.228/Share` (Latency ~0.3 ms, ~2,000 MB/s transfer speed) [VERIFIED LIVE].
    2. **Local Wi-Fi 6E (1.2 Gbps)**: `smb://192.168.1.159/Share` (Latency ~3 ms, wireless freedom within home/lab) [VERIFIED LIVE].
    3. **Tailscale Mesh (Remote)**: `smb://100.87.51.122/Share` (Secure access from any authorized device globally) [VERIFIED LIVE].
  - **Credentials**: User: `nas` | Pass: `NasUser2026!` (or Guest access enabled).
  - **Desktop Integration on MacLab**: Persistent symlinks created at `/Users/admin/Desktop/F1-NAS` and `/Users/admin/Desktop/F1-Share` pointing to `/Volumes/NAS` and `/Volumes/Share`.
- **Web NAS (FileBrowser)**:
  - Binary deployed to `E:\Tools\FileBrowser\filebrowser.exe`
  - Registered as Windows Scheduled Task `FileBrowserNAS` (Runs at startup under SYSTEM) [VERIFIED RUNNING]
  - Bound to `0.0.0.0:8080`, root `E:\`
  - Web UI: `http://100.87.51.122:8080` [VERIFIED HTTP 200]

### 4. Hardware Health, Power & Lightroom Acceleration
- **VRAM Allocation**: Set to 512 MB UMA via OneXConsole DB (`vramSize=512`). Total visible host RAM: **31.23 GB** (~20-22 GB free with HAOS and WSL2 active).
- **Battery Preservation**:
  - Configured in `C:\Program Files\OneXConsole\core.db`: `chargeLimit=80`, `byPassPowerMode=1`.
  - Bypass power powers system directly from wall adapter, protecting battery from degradation.
  - Note: SoC currently holds at wall power level; running on battery briefly until ≤80% before locking bypass ensures target 80% ceiling.
- **Display & Sleep Policies (24/7 Server Hardening)**:
  - **Power Button Action**: Changed from Sleep (1) to **Turn off the display only (4)** via `PBUTTONACTION` (`4f971e89-eebd-4455-a8de-9e59040e7347\7648efa3-dd9c-4e3e-b566-50f929386280`). Tapping power button turns off screen while CPU, Wi-Fi, and VMs stay 100% active.
  - **Standby & Monitor Timeouts**: All idle timeouts set to 0 (Never) for both AC and DC (`VIDEOIDLE=0`, `STANDBYIDLE=0`, `HIBERNATEIDLE=0`).
  - **Console Lock Display Timeout**: Hidden GUID `8ec4b3a5-6868-48c2-be75-4f3044be88a7` set to 0 (prevents Windows 60-second lock screen display sleep).
  - **Connected Standby Network Policy**: Group Policy registry key `HKLM:\SOFTWARE\Policies\Microsoft\Power\PowerSettings\f15576e8-98b7-4186-b944-eafa664402d9` set to 1 (Always allow network connectivity during standby).
  - **Wi-Fi Power Saving**: Killer Wi-Fi 6E AX1675w `PnPCapabilities=24`, `*DeviceSleepOnDisconnect=0`.
  - **ServerKeepAlive Task**: Windows Scheduled Task running `C:\Tools\KeepAlive\keepalive.ps1` at startup calling Win32 `SetThreadExecutionState(0x80000041)` (`ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED`).
  - **Hibernation disabled**: `powercfg -h off` (reclaimed 13.4 GB disk space on C:).
- **Native GPU Workflows**: Windows 11 host retains full native AMD Radeon 780M drivers for Adobe Lightroom Classic and video exports with zero virtualization overhead.
