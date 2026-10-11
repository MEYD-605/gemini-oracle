# Handheld control (DESKTOP-UMN5FJV / OneXPlayer)

Golf asked Oracle (Grok Bot) to finish parity so no6/no4 can drive this box nearly as well as Oracle.

## Paths of control (pick the lightest)

### 1) SSH from MacLab (always — Hermes path)
```bash
ssh desktop-umn5fjv
# aliases: ssh game | ssh clubsgame | ssh desktop-umn5fjv | umn5fjv
ssh game "hostname; whoami"
```
- Gaming Handheld ClubSGame, user `ClubSGame` (Password: `123121`, AutoLogon enabled), profile `C:\Users\noone` (junction at `C:\Users\ClubSGame`)
- Tailscale SSH already keyed. This is enough for scripts, installs, sensors, power plan.
- Windows RDP (port 3389): enabled for `ClubSGame` (`123121`), `LimitBlankPasswordUse=0` unlocked.
- Oracle also has Grok Bot Computers when the Grok Bot app is open there — that privilege cannot be granted to Hermes/agy.

### 2) Antigravity Remote Control (daemon on the handheld)
- CLI installed: `Google.AntigravityCLI` 1.2.7
- Binary: `C:\Users\noone\AppData\Local\Microsoft\WinGet\Packages\Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe\agy.exe`
- Wrapper: `C:\Users\noone\bin\agy.cmd` (on User PATH)
- **Daemon: RUNNING** as Windows task `\AntigravityCliDaemon`
- **Instance name: `desktop-umn5fjv`**
- Open https://antigravity.google.com and look for **desktop-umn5fjv** in Remote Control list
- From an `agy` seat (no6/no8), attach/control that instance the same way you attach other remote machines in Antigravity — then you get a native AGY session on the handheld, not only SSH shell
- Check from MacLab:
```bash
ssh desktop-umn5fjv "powershell -NoProfile -Command \"& 'C:\\Users\\noone\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Google.AntigravityCLI_Microsoft.Winget.Source_8wekyb3d8bbwe\\agy.exe' remote-control status\""
```
- Restart if needed:
```bash
ssh desktop-umn5fjv "powershell -NoProfile -Command \"& '...\\agy.exe' remote-control start --name desktop-umn5fjv\""
```

## Already done on the box (2026-09-22)

- LibreHardwareMonitor installed (winget); use it — do **not** claim a custom AMD SMU kernel library.
- Scripts under `C:\Users\noone\`:
  - `get_sensors.ps1`
  - `hw-check-win.ps1` (LibreHardwareMonitor; ACPI alone unavailable on Ryzen 7840U)
  - Desktop shortcut: `hw-check.cmd`
- Processor performance boost mode = **Disabled** (AC+DC).

Quick check:
```bash
ssh desktop-umn5fjv 'powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\noone\get_sensors.ps1'
```

## Tone / honesty

When reporting thermal work: say LibreHardwareMonitor + Boost Disabled. Do not oversell "kernel SMU library".

## Contact

Oracle reaches you with `maw hey 06-gemini "…"`. Prefer confirming SSH + Remote Control list before more tuning.

## Helpers on MacLab (no6)

```bash
handheld / hh / umn5fjv
handheld status
f1-fastcopy <src> <dst> [workers]   # 500+ MB/s parallel copy to F1
```

## High-Speed Data & NAS (Live Ports)

- **Direct USB4 P2P (20 Gbps)**: `169.254.19.228` (MacLab `bridge0` -> F1)
  - `f1-fastcopy`: transfers 300+ files / 6+ GB in ~11s (533 MB/s)
- **SMB Shares (NVMe Drive E:)**:
  - `smb://169.254.19.228/Media` (or `/Share` or `/NAS`)
  - User: `nas` / `NasUser2026!` (or Guest)
  - MacLab Desktop mounts: `/Volumes/NAS`, `/Volumes/Share`, `/Volumes/Media`
- **Web Services**:
  - FileBrowser Web NAS: `http://100.87.51.122:8080` (HTTP 200)
  - Home Assistant OS: `http://100.87.51.122:8123` (HTTP 200/307)

