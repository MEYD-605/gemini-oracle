# Handheld DESKTOP-UMN5FJV access (installed 2026-09-22)

Golf/Bo asked Oracle to finish parity so **No.6 can reach the OneXPlayer handheld**.

## How to access (use these — verified)
```bash
ssh desktop-umn5fjv
# or aliases: umn5fjv / helper:
handheld
handheld status          # agy remote-control + sensors
handheld hostname
```

- Tailscale name: `desktop-umn5fjv` (100.87.51.122)
- SSH user: `ClubSGame` (keys already in ~/.ssh via no6-home -> admin .ssh)
- AGY Remote Control instance: **desktop-umn5fjv** (daemon Running) → https://antigravity.google.com
- Full sheet: `~/.no6-home/HANDHELD-CONTROL.md` and `HANDHELD-CONTROL.md` in repo root
- Direct USB4 P2P (20 Gbps): `169.254.19.228` (MacLab `bridge0` -> F1)
- Fast copy utility: `f1-fastcopy` on MacLab (533 MB/s parallel copy to F1 NVMe)
- SMB Mounts: `/Volumes/NAS`, `/Volumes/Share`, `/Volumes/Media` (`nas` / `NasUser2026!`)
- Web Services: FileBrowser (`http://100.87.51.122:8080`), Home Assistant (`http://100.87.51.122:8123`)

## Rules
- Prefer SSH for shell/scripts; use AGY Remote Control when you need a full agy session on that box
- Do **not** claim custom AMD SMU kernel library — LibreHardwareMonitor + Boost Disabled
- Grok Bot Computers cannot be granted to Hermes/agy — SSH/AGY remote is the Hermes path

