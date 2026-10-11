# Handoff: OneXFly Thermal & Power Tuning for 24/7 Headless Node

📡 Session: dab06142 | gemini-oracle | 2026-09-22 14:43:00 +0700  
**Context**: ~5%  
**Node**: OneXFly (`desktop-umn5fjv` at `100.87.51.122`)  
**Operator**: No.6 Gemini (`[maclab:no6]`)  

---

## What We Did
- **Modern Standby Decoupling**: Reconfigured Windows power scheme on OneXFly (`monitor-timeout-ac 2`, `monitor-timeout-dc 2`, `standby-timeout-ac 0`, `standby-timeout-dc 0`). Decoupled screen-off from S0 DRIPS sleep, ensuring 24/7 headless SSH and Tailscale connectivity without Wi-Fi drop.
- **Hardware Sensor Remote Monitoring**: Diagnosed why standard Windows WMI (`MSAcpi_ThermalZoneTemperature`) returned `unavailable` (AMD Ryzen handheld BIOS does not expose ACPI thermal zones). Leveraged `LibreHardwareMonitorLib.dll` in PowerShell to read AMD SMU (System Management Unit) directly.
- **Thermal Spike Remediation**: Discovered CPU idling at 95.1°C / 25.5W Package Power due to Windows default `PERFBOOSTMODE` = Aggressive (5.1GHz boost even at 10% load). Disabled boost (`PERFBOOSTMODE 0`) across AC and DC:
  - CPU Core Temp: Plunged from **95.1°C -> 47.1°C** (-48°C drop).
  - CPU Package Power: Dropped from **25.5W -> 8.6W** (-66% reduction).
  - GPU VR SoC: Dropped to **45.0°C**.
  - NVMe SSD (ONEXPLAYER Q3): Stable at **44.0°C**.
  - Fan Noise: Hardware EC fan ramped down to near-silent cooldown.
- **Tooling Deployment**: Upgraded `temp-check-win.ps1` and `hw-check-win.ps1` on OneXFly (backed up originals with `.bak.20260922_1415`). Deployed global CLI shortcut `get-temp` (`C:\Windows\System32\get-temp.bat`) accessible via SSH.
- **Discord Communications**: Verified and answered Master Bo (`borde9902`) on Discord (chat_id: `1511429347863433438`) confirming connectivity, explaining fan hysteresis, and reporting live thermals.

---

## Pending
- [ ] Configure battery charge threshold limit (70-80%) via OneXConsole or EC register to prevent battery swelling on 24/7 AC power
- [ ] Set up a lightweight background HTTP/WMI telemetry daemon or cron for pushing hardware metrics to Hermes/HAOS

---

## Next Session
- [ ] Inspect OneXConsole settings or EC registers to lock battery charge limit
- [ ] Coordinate with No.4 (`04-mimo`) on Home Assistant OS (HAOS) container / VM deployment on OneXFly

---

## Key Files
- `C:\Users\noone\temp-check-win.ps1` (OneXFly remote)
- `C:\Users\noone\hw-check-win.ps1` (OneXFly remote)
- `C:\Windows\System32\get-temp.bat` (OneXFly remote)
- `/Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/activity.log`
- `/Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ/learnings/2026-09-21_onexfly-8840u-handheld-24-7-home-server-feasibility-research.md`
