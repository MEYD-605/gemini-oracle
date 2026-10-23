# Handoff: Handheld PCs, Smart Monitors & Fleet Hardware Diagnosis

**Date**: 2026-10-14 18:25
**Context**: ~85k tokens
📡 Session: 3da66555 | cartographer-oracle

## Context
**Oracle**: No.5 GM Forge (`[maclab:05-gmforge]`) | **Human**: Master Bo (`borde9902`)
**Role**: MacLab GM & Blueprint Truth | **Channel**: Discord DM (`1470628889826037840`)

## What We Did
- **Hardware & Market Research (Requested by Bo)**:
  - **Handheld PCs**: Evaluated 64GB RAM & detachable controller options (OneXPlayer X1 Mini/Pro, Legion Go 2, Ayaneo 3, GPD Win Max 2/Win 5). Identified AMD Strix Halo (Ryzen AI Max+ 395/385) 256-bit bus (~256 GB/s) as the true generational leap for 30B/32B LLMs (20+ t/s) and MiniMax H3 33B local video generation vs 128-bit chips (7840U/8840U/HX 370).
  - **Smart Monitors**: Analyzed Samsung Smart Monitor (M5/M7/M8 Tizen OS) vs LG MyView (webOS). Highlighted Samsung DeX, Moonlight Tizen Sideload (low latency 4K), and Home Assistant integration. Advised Bo on Samsung M8 (M80D 2024, 4K, 400 nits, SlimFit Cam) deal at ฿8,500 with warranty until late 2027.
  - **USB-C Docking Monitors**: Contrasted Dell "E" series (P2723DE, 90W PD, RJ-45 LAN, 2K IPS) with Lenovo ThinkVision T27h and HP E27u.
  - **Mobile Linux & Tablets**: Explored Xiaomi Pad 6 / Pad 5 Linux feasibility. Identified LightCraft (open-source Rust Lightroom clean-room clone for Linux aarch64) as a viable portable darkroom rig with 8BitDo Micro gamepad. Clarified Pad 5 Windows 11 ARM bootloader unlock requirements.
  - **AI Trading & Media**: Deconstructed viral MT5-MCP claims (marketing vs technical reality), reviewed SOTA AI trading frameworks (TradingAgents, ai-hedge-fund, FinRL), and detailed upcoming Apple TV 4K (A17/A18, 8GB RAM, pyatv remote control architecture).
- **Live Fleet Diagnostics & Remediations**:
  - **iMac 27" 5K Late 2015 (`imac--sujit` / `100.69.197.66`)**:
    - Connected via passwordless SSH (`clubsmacdata`).
    - Diagnosed Chrome crash/logout issue via `/Library/Logs/DiagnosticReports/Google Chrome...diag` as GPU WindowServer crash on AMD Radeon R9 M395X under macOS 12.7.6.
    - Fixed permanently by disabling Chrome Hardware Acceleration via `defaults write com.google.Chrome HardwareAccelerationModeEnabled -bool false` and purged corrupted `GPUCache`.
    - Verified hardware health (32GB RAM OK, PCIe NVMe SMART Verified, fan 1,201 RPM, CPU/GPU 53-54°C).
  - **ClubSGame (OneXPlayer 7840U)**:
    - Resolved display calibration drop: Re-injected Apple D65 3D LUT gamma ramp (`SetDeviceGammaRamp: True`).
    - Upgraded `Apply-Color-Profile` scheduled task to include `SessionUnlock` trigger, 10s boot delay, and 15-minute repetition to lock color profile permanently against OneXConsole/DirectX resets.
    - Diagnosed USB-C direct connection fallback to `Apple Billboard Device (VID: 05AC)` due to charge-only cable wiring.

## Pending
- [ ] Test long-term stability of Chrome on `imac--sujit` under heavy tab load
- [ ] Verify Bo's inspection of Samsung M80D (฿8,500) if purchased
- [ ] Monitor ClubSGame `Apply-Color-Profile` persistence over sleep cycles

## Next Session
- [ ] Run `python3 /Users/admin/Code/github.com/MEYD-605/sombo-oracle/scripts/fleet-drift-check.py` to audit fleet alignment
- [ ] Check if `imac--sujit` needs additional maintenance or monitoring hooks
- [ ] Prototype One-Click Inbound Tunnel (NetBird / Tailscale headless) script for client onboarding

## Key Files
- `/Users/admin/.claude-no5/projects/-Users-admin-Code-github-com-MEYD-605-cartographer-oracle/memory/imac-sujit-specs-and-setup.md`
- `/Users/admin/.claude-no5/projects/-Users-admin-Code-github-com-MEYD-605-cartographer-oracle/memory/clubsgame-display-calibration-persistence.md`
- `C:\Users\ClubSGame\bin\apply-calibrated-profile.ps1` (ClubSGame)
- `C:\Users\ClubSGame\bin\Apply-Color-Profile-Updated.xml` (ClubSGame)
