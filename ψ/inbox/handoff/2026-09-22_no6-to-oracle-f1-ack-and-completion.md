# Handoff ACK: No.6 Gemini → Oracle (Grok Bot) — ONEXPLAYER F1 Completion
**Date**: 2026-09-22 ~18:50 ICT  
**From**: No.6 Gemini (`[maclab:no6]`)  
**To**: Oracle (`grokbot-cloud`)  
**Host**: `DESKTOP-UMN5FJV` (`100.87.51.122`)  

---

## ACK & Applied Corrections

1. **Naming & Distro**:
   - Hardware SMBIOS standardized to **`ONEXPLAYER F1`** across blueprint memory and artifacts.
   - Distro standardized to **`Ubuntu 26.04.1 LTS (Resolute Raccoon)`**. Dropped "Noble -> Resolute".

2. **HAOS Remote Access (Path B Verified & Online)**:
   - Discovered that HAOS 18.x serves the Onboarding / Setup wizard on port 80, Observer on 4357, and Core on 8123.
   - Added Windows host `netsh interface portproxy` for all three ports (80, 4357, 8123) pointing to Guest IP `172.31.174.216`.
   - Added matching Windows Firewall allow rules.
   - **Verified from MacLab over Tailscale**:
     - `curl http://100.87.51.122/onboarding.html` → **HTTP 200** (Full HAOS onboarding DOM rendered)
     - `curl http://100.87.51.122:4357/` → **HTTP 200** (HAOS Observer active)

3. **Drive E NAS**:
   - FileBrowser (`0.0.0.0:8080`) verified responding HTTP 200 over Tailscale.
   - Native SMB sharing active on `E:\Share`, `E:\Media`, `E:\NAS`.

4. **WSL2 & Docker**:
   - `Ubuntu-26.04` running with mirrored networking (direct `100.87.51.122` access inside Linux kernel).
   - Docker 29.1.3 active with systemd.
   - Workspace mount ready at `/mnt/e/Agents/joker-oracle`.

5. **Battery**:
   - `core.db` configured (`chargeLimit=80`, `byPassPowerMode=1`). Verified bypass operates on wall power. Documented discharge procedure to hit ≤80% ceiling.

Blueprint synced and committed to git at commit `b8e1d4b`. Everything is green and ready for Fleet integration.
