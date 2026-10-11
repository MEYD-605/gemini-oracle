# Rock Pi 4C+ (`rockpi-edge`) VNC & Cloudflare Tunnel Ops

**IP:** `100.80.0.4` (Tailscale) | `192.168.1.159` (LAN)
**OS:** Armbian Debian 13 aarch64
**Mapped User:** `oracle` (Display `:1`)

## Cloudflare Tunnel Setup
- Domain: `rockpi.clubsxai.com`
- Ingress: `http://localhost:6080` (noVNC via websockify)
- Config: `/etc/cloudflared/config.yml`
- Credentials: `/root/.cloudflared/<tunnel-id>.json`
- System Service: `systemctl status cloudflared`

## VNC Password & Server Management Pitfall
- **User Mapping:** TigerVNC user mapping is defined in `/etc/tigervnc/vncserver.users` (`:1=oracle`).
- **Passwd Location:** Do NOT write `/root/.vnc/passwd` if VNC process runs as `oracle`. Password must be updated in `/home/oracle/.config/tigervnc/passwd`:
  ```bash
  su - oracle -c "mkdir -p /home/oracle/.config/tigervnc && vncpasswd -f <<< 'PASSWORD' > /home/oracle/.config/tigervnc/passwd && chmod 600 /home/oracle/.config/tigervnc/passwd"
  ```
- **Restarting VNC Session for `oracle`:**
  `tigervncserver@1.service` will fail if triggered directly via `systemctl restart` without proper display configuration for root. Restart via `su - oracle`:
  ```bash
  su - oracle -c "vncserver -kill :1 2>&1"
  su - oracle -c "vncserver :1 -geometry 1920x1080 -depth 24 -localhost no -SecurityTypes VncAuth -AlwaysShared 2>&1"
  ```
- **Verify Access:** Access via noVNC (port 6080) routed through Cloudflare Tunnel at `https://rockpi.clubsxai.com`.

## VNC Screen Resolution & Display Scaling Fix
- **Odd Screen Resolution Issue (e.g. 820x741):**
  When noVNC resizes the virtual display according to browser dimensions, `VNC-0` may drop to non-standard resolutions (e.g., 820x741), distorting desktop elements and wallpaper scaling.
- **Fixing Resolution via `xrandr`:**
  ```bash
  su - oracle -c "DISPLAY=:1 xrandr --output VNC-0 --mode 1920x1080"
  ```
- **Persisting 1080p Resolution in `xstartup`:**
  Add background `xrandr` hook into `/home/oracle/.vnc/xstartup` before launching `startxfce4`:
  ```sh
  (sleep 2 && xrandr --output VNC-0 --mode 1920x1080 2>/dev/null) &
  ```
- **Fixing Desktop Wallpaper Scaling:**
  ```bash
  su - oracle -c "DISPLAY=:1 xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitorVNC-0/workspace0/image-style -s 5"
  ```
- **Client-Side (noVNC):** In the noVNC side menu (gear icon), set **Scaling Mode** to `Remote Resizing` or `Local Scaling` so the client window maintains 1080p layout.

## Resource Management & System Freeze (Firefox-ESR on 4GB SBC)
- **High Memory Bloat:** Firefox-ESR running in VNC with multiple tabs can consume 1GB+ RAM and cause system freezing on 4GB RAM boards like Rock Pi 4C+.
- **Quick Recovery:** Check and terminate hung browser processes:
  ```bash
  pkill -f firefox-esr
  ```

## SSH Cloudflare ProxyCommand Path on MacLab
- **Cloudflared Binary Path:** On MacLab (macOS), `cloudflared` binary is located at `/usr/local/bin/cloudflared` (not `/opt/homebrew/bin/cloudflared`). Ensure SSH config `ProxyCommand` uses `/usr/local/bin/cloudflared access ssh --hostname %h`.

## XFCE Desktop Theme & Icon Customization (via CLI)
- **Check Theme & Icons:**
  ```bash
  su - oracle -c "DISPLAY=:1 xfconf-query -c xsettings -p /Net/ThemeName"
  su - oracle -c "DISPLAY=:1 xfconf-query -c xsettings -p /Net/IconThemeName"
  su - oracle -c "DISPLAY=:1 xfconf-query -c xfwm4 -p /general/theme"
  ```
- **Fix Titlebar Mismatch & Set Dark Theme:**
  ```bash
  su - oracle -c "DISPLAY=:1 xfconf-query -c xfwm4 -p /general/theme -s Arc-Dark"
  su - oracle -c "DISPLAY=:1 xfconf-query -c xsettings -p /Net/IconThemeName -s Papirus-Dark"
  ```
- **Install Extra Icon Packs (Debian/Armbian):**
  ```bash
  apt-get install -y elementary-icon-theme numix-icon-theme
  su - oracle -c "DISPLAY=:1 xfconf-query -c xsettings -p /Net/IconThemeName -s elementary"
  ```

## Installing Apps on Armbian/Debian ARM64 Desktop & Architecture Differences
- **Architecture Trap (x86_64 vs ARM64/aarch64):**
  Official `google-chrome-stable_current_amd64.deb` and official Discord `.deb` are compiled ONLY for x86_64 (amd64). Attempting to install them on ARM64 boards like Rock Pi 4C+ will fail or be unavailable. VPS / x86_64 servers (`ai-core`) can run official debs directly, but ARM64 requires ARM64 builds:
- **Web Browsers (Google Chrome Engine on ARM64):**
  Use `chromium` (same OpenSource engine as Chrome, 99% identical features & extensions):
  ```bash
  apt-get update && apt-get install -y chromium chromium-l10n
  ```
- **Discord Desktop App (Native Electron App via Flatpak on ARM64):**
  For a full native Discord Desktop App (supporting Vencord, voice chat, screen share, desktop notifications) on ARM64:
  Use **Vesktop** via **Flatpak**:
  ```bash
  flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
  flatpak install -y flathub dev.vencord.Vesktop
  # Copy desktop launcher to oracle user Desktop
  cp /var/lib/flatpak/exports/share/applications/dev.vencord.Vesktop.desktop /home/oracle/Desktop/
  chown oracle:oracle /home/oracle/Desktop/dev.vencord.Vesktop.desktop
  chmod +x /home/oracle/Desktop/dev.vencord.Vesktop.desktop
  ```
- **Alternative Lightweight Discord (WebCord .deb):**
  ```bash
  curl -L -o /tmp/webcord_arm64.deb https://github.com/SpacingBat3/WebCord/releases/download/v4.14.0/webcord_4.14.0_arm64.deb
  dpkg -i /tmp/webcord_arm64.deb || apt-get install -f -y
  ```
- **Desktop Shortcuts Setup:**
  ```bash
  cp /usr/share/applications/chromium.desktop /home/oracle/Desktop/
  chown -R oracle:oracle /home/oracle/Desktop
  chmod +x /home/oracle/Desktop/*.desktop
  ```
