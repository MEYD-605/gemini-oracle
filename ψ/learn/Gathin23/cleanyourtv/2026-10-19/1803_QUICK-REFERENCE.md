# Clean Your TV (`Gathin23/cleanyourtv`) — Quick Reference

> **Repository Note**: Formerly named `tv-vibehack` until 19 October 2026. Website: [cleanyour.tv](https://cleanyour.tv).  
> **Source Directory**: `/Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv`

---

## 1. What It Does

`cleanyourtv` strips bloatware, advertisements, sponsored recommendation rows, and vendor telemetry from Android TV and Google TV devices over Wi-Fi via ADB, replacing the default launcher with an Apple TV-inspired, ultra-lightweight custom home screen launcher.

### Core Architecture & Operating Principles
* **Non-Destructive Debloating**: Never uninstalls system packages. All package removals are performed using `pm disable-user --user 0`, keeping system partitions completely intact. All changes reside strictly within user data and can be reverted at any time.
* **No Root & Wireless Operation**: Operates over standard Android Debug Bridge (ADB over TCP on port 5555). No physical cables, custom recovery, or rooting required.
* **Lightweight Native Launcher (`com.gathin.tvhome`)**:
  * Written in pure Java using AndroidX `RecyclerView` and `DynamicAnimation`.
  * Footprint: ~250 KB installed size (compiled release APK).
  * Built specifically for budget hardware (devices with as little as 1 GB RAM): zero blur effects, no background video playback, no network polling, and no background resident services.
  * Visual design: Pitch-black background; 4-app persistent dock inside a lighter rounded band at screen bottom; top shelf displaying focused app name with ambient color glow sampled from app artwork; 4-column (or customizable) app grid scrolling upward on D-pad Down; unified floating glass focus highlight; frosted top pill buttons for TV Inputs (HDMI/AV/Tuner switcher), Wi-Fi/Ethernet status, and System Settings; typography rendered in [Outfit](https://fonts.google.com/specimen/Outfit).
  * Optional add-ons: Drift clock screensaver (`ClockDream`), input key remapper accessibility service (`InputKeyService` for `KEYCODE_TV`), Home button remapper (`HomeKeyService` for remotes sending `KEYCODE_ALL_APPS`), and external app module cards (`docs/modules.md`).

---

## 2. Installation & Usage Workflows

### Phase 1: Preparing the TV
1. On the TV, navigate to: `Settings` → `Device Preferences` → `About`.
2. Scroll to **Build** and press `OK` on the remote 7 times until Developer Mode is unlocked.
3. Return to the previous menu, enter **Developer options**, and turn on **USB debugging**. (If present, enable **Network debugging** / **ADB debugging** as well).
4. Keep the TV powered on and connected to the same Wi-Fi / local network as your computer.
   > **Hardware Warning**: On certain streaming boxes (e.g., Xiaomi Mi Box S), enabling USB debugging switches the USB port into peripheral device mode, cutting power to connected USB drives or USB speakers. Turn off USB debugging once setup is complete.

---

### Phase 2A: Automated Workflow via Coding Assistant (`PROMPT.md`)
The repository provides an orchestration prompt in `PROMPT.md` designed for shell-enabled coding assistants (such as Claude Code):

1. Ensure the host computer is on the same local network subnet as the TV.
2. Copy the text from `PROMPT.md`, fill in `<MODEL NAME HERE>` with the TV model name, and execute in your assistant.
3. Watch the TV screen and accept the **"Allow USB debugging?"** authorization dialog.
4. Answer the interactive checklist prompts:
   * Which streaming applications you actively use.
   * Which 4 applications should be placed in the bottom dock.
   * Whether to retain Google Assistant / voice services.
   * Whether to retain Chromecast built-in.
   * Whether to retain manufacturer OTA firmware update services.
5. The assistant performs backups, executes batch package disablers, builds the launcher, installs it over ADB, and validates the home screen state using screenshots pulled directly from the TV.

---

### Phase 2B: Manual Command-Line Workflow (`tools/`)
The toolchain requires Python 3 and Android build tools (JDK 17 + Android SDK 34).

#### 1. Setup Python Virtual Environment
```bash
python3 -m venv tools/venv
tools/venv/bin/pip install -r tools/requirements.txt
# Requirements: adb-shell, rsa, cryptography
```

#### 2. Set Target TV IP Address
```bash
export TV_HOST=192.168.1.50   # Replace with TV local IP address
```

#### 3. Probe and Interact via ADB Client (`tools/tv.py`)
`tools/tv.py` is a standalone Python ADB client using `adb-shell` that bypasses macOS Local Network privacy restrictions affecting the standard Google `adb` binary.
```bash
# Query TV hardware properties (model, manufacturer, Android SDK, build ID)
tools/venv/bin/python -I tools/tv.py --probe

# Run a single shell command on the TV
tools/venv/bin/python -I tools/tv.py 'pm list packages'

# Execute batch shell commands over a single TCP connection
printf 'pm list packages -d\ngetprop ro.build.version.release\n' | tools/venv/bin/python -I tools/tv.py --batch

# Push/pull small files
tools/venv/bin/python -I tools/tv.py --pull /sdcard/screenshot.png ./screenshot.png
```

#### 4. Apply a Debloat Package List
```bash
# Unix / macOS
tools/disable.sh examples/xiaomi-mi-tv-4a/debloat.txt

# Windows PowerShell (native, without WSL)
powershell -ExecutionPolicy Bypass -File tools\disable.ps1 -TvHost 192.168.1.50 examples\xiaomi-mi-tv-4a\debloat.txt
```

#### 5. Build and Install Launcher (`launcher/build-and-install.sh`)
Requires JDK 17 (`openjdk@17`) and Android SDK platform 34 (`build-tools;34.0.0`).
```bash
# Build APK, transfer via b64push, install, speed-compile, disable stock launcher, and set HOME
TV_HOST=192.168.1.50 launcher/build-and-install.sh

# Optional flags:
# INPUT_KEY_SERVICE=1 launcher/build-and-install.sh   # Enables KEYCODE_TV remote input switcher
# HOME_KEY_SERVICE=1 launcher/build-and-install.sh    # Maps KEYCODE_ALL_APPS to HOME
# STOCK_LAUNCHER=none launcher/build-and-install.sh   # Prevents disabling existing launcher
```

#### 6. Apply or Reset Themes (`tools/theme.sh`)
```bash
# Push theme configuration overlay and wallpaper
tools/theme.sh themes/aurora

# Revert to default built-in config.xml
tools/theme.sh --reset
```

---

## 3. Supported & Unsupported TV Types and Known Limits

### Supported Systems
* **Android TV** (versions 9, 10, 11, 12, 13, 14).
* **Google TV** (versions 11, 12, 14).
* Tested brands include: Xiaomi, Redmi, TCL, Hisense, Sony, OnePlus, Realme, NVIDIA Shield, BenQ, CHiQ, RCA, Philips, SANYO, Stellamore (projectors), XGIMI (projectors).

### Unsupported & Partially Supported Systems
* **Samsung (Tizen OS)**: Not supported. Completely different operating system without Android APK/ADB subsystem.
* **LG (webOS)**: Not supported by the Android toolchain. (A community webOS web app recreation exists in `SHOWCASE.md` by OmkarK97).
* **Amazon Fire TV (Fire OS 6 / 7 / Android 9)**: **Debloat only**. Fire OS strictly enforces Amazon's proprietary launcher and ignores attempts by third-party APKs to claim the `HOME` intent category without low-level interception services.
* **TCL China Firmware (Android TV 9 `ak30a5` & Android TV 11 `tcl_mt5879_cn` / Q10G Pro)**: **Debloat only**. Firmware blocks third-party launchers via OEM platform key signature enforcement on `android.intent.category.HOME` packages or blocks package installation.

### Known Edge Cases & Troubleshooting Gotchas
1. **Google TV Setup Wizard Conflict (`setupwraith`)**:
   * On Google TV sets (e.g., Xiaomi MiTV-MOOR2, Xiaomi TV A Pro 2026), disabling `com.google.android.apps.tv.launcherx` causes `com.google.android.tungsten.setupwraith` (`.MainActivity` priority 4, `.RecoveryActivity` priority 1) to seize HOME.
   * On Google TV 14, this causes `system_server` crash loops (`FATAL EXCEPTION IN SYSTEM PROCESS: android.display`), repeatedly cycling Wi-Fi.
   * **Fix**: The package `com.google.android.tungsten.setupwraith` must be included in `debloat.txt` and disabled. Re-enable it prior to any factory reset.
2. **macOS "No Route to Host" Bug**:
   * macOS Local Network Privacy blocks the Google platform-tools `adb` binary. `tools/tv.py` resolves this by using pure Python socket connections.
3. **Wireless Debugging Port Binding**:
   * Certain sets (e.g., Philips Skyworth sets) do not bind port 5555 automatically upon enabling USB debugging. Users must pair once using standard `adb pair <ip>:<port> <code>` and issue `adb tcpip 5555`.
4. **MediaTek Corrupted Screenshots**:
   * `screencap -p` directly over standard output outputs `Init wrapper sys mutex successful` onto stdout on MediaTek Xiaomi boards. Screenshots must be saved to `/data/local/tmp/s.png` first and pulled via ADB.
5. **DRM & Video Overlay Blanking**:
   * Capturing screenshots while Netflix, HDMI inputs, or Tuner feeds are active results in blank/black images due to hardware overlay protection.
6. **Missing On-Screen Keyboard**:
   * Xiaomi firmware may configure `com.baidu.input` as the default IME even if not installed. Reset using:
     `tools/tv.py 'ime set com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME'`

---

## 4. License Situation

### Exact Content of `LICENSE`
The `LICENSE` file located at the repository root contains standard MIT License terms followed by a font licensing attribution:

```text
MIT License

Copyright (c) 2026 Gathin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

The Outfit typeface in launcher/app/src/main/res/font/outfit.ttf is copyright
The Outfit Project Authors and licensed under the SIL Open Font License 1.1,
see launcher/FONT-LICENSE-OFL.txt.
```

### Explanation of GitHub `NOASSERTION` Metadata
* Automated GitHub license scanning tools expect standard license files to contain solely the canonical text of a recognized license.
* Because the author appended a markdown horizontal rule (`---`) and a multi-line attribution clause for the bundled Outfit font (SIL Open Font License 1.1) directly into `LICENSE`, automated SPDX license classifiers fail strict matching and output `NOASSERTION`.

### Legal Permissions Granted
* **Software Core (`cleanyourtv` codebase & launcher)**: Licensed under the **MIT License**. Permits free use, modification, copying, merging, publication, distribution, sublicensing, and **commercial use**, conditioned only upon preserving the copyright notice and permission text.
* **Bundled Typeface (`outfit.ttf`)**: Licensed under the **SIL Open Font License (OFL) 1.1** (`launcher/FONT-LICENSE-OFL.txt`). Permits free usage, bundling, and modification, with standard OFL restrictions (cannot be sold standalone).

---

## 5. Restoration Procedures

Restoring a TV returns disabled packages to service, restores the stock launcher, and resets system animation scales.

### Automatic Restore Command
```bash
# Android TV (Defaults to restoring com.google.android.tvlauncher)
TV_HOST=192.168.1.50 tools/restore.sh examples/<your-tv-folder>/debloat.txt

# Google TV (Pass stock launcher package explicitly)
TV_HOST=192.168.1.50 tools/restore.sh examples/<your-tv-folder>/debloat.txt com.google.android.apps.tv.launcherx

# Windows PowerShell equivalent
powershell -ExecutionPolicy Bypass -File tools\restore.ps1 -TvHost 192.168.1.50 examples\<your-tv-folder>\debloat.txt -Stock com.google.android.apps.tv.launcherx
```

### What `tools/restore.sh` Executes
1. Iterates through the provided `debloat.txt` list, stripping comments and executing `pm enable <package>` for every listed service.
2. Re-enables the specified stock launcher package (`pm enable $STOCK`).
3. Resolves and reinstates the stock launcher as default home:  
   `cmd package set-home-activity --user 0 $(cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME $STOCK | tail -n 1)`
4. Resets system UI animations:
   * `settings put global window_animation_scale 1.0`
   * `settings put global transition_animation_scale 1.0`
   * `settings put global animator_duration_scale 1.0`
5. Dumps the remaining disabled package list (`pm list packages -d`) to verify results.

### What Restore Does NOT Do
* **Does not uninstall `com.gathin.tvhome`**: The replacement launcher stays installed as a non-default app. To remove it completely, uninstall it through standard TV settings (`Settings` → `Apps` → `tvhome` → `Uninstall`).
* **Does not restore unlisted packages**: Any package disabled manually outside of the passed `debloat.txt` file is not tracked by the script.
* **Does not reset accessibility services or screensavers**: Accessibility remappers (`InputKeyService`, `HomeKeyService`) or `ClockDream` must be toggled off via TV settings or manual `settings put` commands.
* **Failsafe**: If network access is lost, packages can be re-enabled directly on the physical TV via `Settings` → `Apps` → `See all apps` → `Disabled apps`.

---

## 6. Contributing Guidelines & Example Lists Structure

Guidelines are defined in `CONTRIBUTING.md`.

### Contribution Categories
1. **Adding a TV Model (`examples/<brand>-<model>/debloat.txt`)**:
   * Gather hardware details via `tools/tv.py --probe` (model, Android version, build fingerprint).
   * Record packages disabled and verified over several days of real-world use.
   * Never include `pm uninstall` commands—only disable packages.
   * Add a row to `examples/README.md`.
2. **Improving the Launcher (`launcher/`)**:
   * Strict minimalism: Java, AndroidX `RecyclerView`, `DynamicAnimation`. No Kotlin, Jetpack Compose, background services, or network calls.
   * Hardware requirement: Must run smoothly on 1 GB RAM sets.
   * Brand-specific quirks must be configured in `res/values/config.xml`, never hardcoded into Java classes.
   * Navigation must remain strictly deterministic on D-pads.
   * Pull requests must include real hardware screenshots.
3. **Tool & Prompt Enhancements**:
   * Keep `PROMPT.md` brand-neutral; place brand specifics into `examples/`.
4. **Alternative Launchers & Large Add-ons (`SHOWCASE.md`)**:
   * Custom launchers, heavy add-ons, or alternative OS ports are kept out of the main codebase and indexed in `SHOWCASE.md`.

### Structure of `examples/`
Each device profile has a directory under `examples/<brand>-<model>/` containing a `debloat.txt` file:
* **Header Comments**: Model name, board codename, Android OS version, firmware build number, and explicit invocation examples (`tools/disable.sh` and `tools/restore.sh`).
* **Commented Sections**: Packages are categorized by functional groups (Telemetry, Content Recommendations, Background Services, Preloaded Bloat, Stock Launcher).
* **Trailing Comments**: Non-obvious packages include inline notes (e.g., `# needed for HDMI-CEC`, `# re-enable to check for firmware updates`).

---

## 7. Tested TV Models Registry (30 Sets)

Extracted from `examples/README.md` and verified against directory listings under `examples/`:

| Directory | Device Model & Hardware Details | Operating System | Critical Notes & Hardware Quirks |
|---|---|---|---|
| `benq-e55-735/` | BenQ E55-735 (Changhong AI PONT, DVB96BQ) | Google TV 14 | Homwee store/help, Anoki ACR; wireless pairing required; setupwraith handling |
| `chiq-ai-pont/` | CHiQ AI PONT (DVB93CQ) | Android TV 11 | Anoki ACR, FAST channels, AI PONT, Homwee services |
| `google-chromecast-gtv-4k/` | Chromecast with Google TV 4K (`sabrina`) | Google TV 14 | Google telemetry, ambient mode; launcherx + setupwraith; YouTube button remap |
| `hisense-smarttv-4k-ffm/` | Hisense SmartTV 4K FFM (`huangshan`, MediaTek) | Android TV 10 | ACR (`evservice`), VIDAA preloads; smartsense must stay enabled |
| `insignia-ns55f301na25/` | Insignia 55" F30 4K Fire TV (NS-55F301NA25, `duckie`) | Fire OS 7 / Android 9 | Debloat only; Amazon ACR, Alexa, shopping; AirPlay and TIF inputs kept |
| `nvidia-shield-tv-pro-2019/` | NVIDIA SHIELD TV Pro 2019 (P2897, `mdarcy`) | Android TV 11 | NVIDIA telemetry, GameStream remnants, sponsored rows |
| `oneplus-tv-dubai/` | OnePlus TV (D00, `Dubai`) | Google TV 14 | HeyTap/OnePlus services, OnePlus Connect, Smart Home |
| `philips-smart-4k-google-tv/` | Philips Smart 4K TV (Skyworth, `eleonas`, MediaTek), India | Google TV 14 | Skyworth recommendation trackers; wireless pairing required; setupwraith handling |
| `rca-ai-pont/` | RCA AI PONT SA (Changhong, `redwood`, ISDB92RC; realme 40") | Android 14 | Homwee store, Anoki ACR; 1 GB RAM profile |
| `sanyo-atv-r2/` | SANYO ATV R2 (SCBC, Realtek RTD285O) | Android TV 9 | S-Channels, E-SHOW demo, Vewd, SANYO OTA |
| `sony-bravia-4k-ur2/` | Sony BRAVIA 4K UR2 (`BRAVIA_UR2_4K`, MediaTek) | Android TV 10 | Samba TV ACR, Sony promos, demo modes |
| `sony-xbr-x900e/` | Sony BRAVIA XBR-65X900E (2017, `BRAVIA_ATV2`) | Android TV 9 | Samba TV ACR, Sony Select, Discover, device agents |
| `stellamore-t950s/` | Stellamore T950S projector (Droidlogic `be30a3`, Amlogic) | Android 13 | Zeasn store & launcher bundle Google DoubleClick ads; keystone correction must stay enabled |
| `tcl-65c725/` | TCL 65C725 (Smart TV Pro, `BeyondTV4`) | Android TV 11 | TCL analytics, promos, Google recommendation rows |
| `tcl-ak30a5/` | TCL ak30a5 (China, Amlogic) | Android TV 9 | **Debloat only**. No Google services; launcher APK installation blocked by OEM signature check |
| `tcl-beyondtv/` | TCL BeyondTV (India) | Android TV 9 | TCL analytics, content feeds, TCL app store |
| `tcl-g05-google-tv/` | TCL Smart TV Pro (G05, `G05_4K_US`, MediaTek MT5889) | Google TV 11 | TCL Channel, waterfall, ttvs BI; setupwraith re-asserts after reboot; launcher unverified |
| `tcl-g10-google-tv/` | TCL 55" 4K Google TV, 2023 (G10, `G10_4K_US_NF`) | Google TV 12 | TCL TV+, TCL Live, store demo, smartlink installer |
| `tcl-q10g-pro/` | TCL 55Q10G Pro (China, `tcl_mt5879_cn`, MediaTek MT9952) | Android TV 11 | **Debloat only**. ADB enabled via D-pad code; stock launcher cannot be replaced (OEM key check) |
| `tcl-qm6k-google-tv/` | TCL QM6K Pro, 2025 (G08, MediaTek `tcl9618`) | Google TV 14 | Samba TV ACR (`ttvs`), TCL TV+, TCL Live; setupwraith removal required |
| `toshiba-fire-tv-aftha004/` | Toshiba Fire TV (AFTHA004, `hazel`) | Fire OS 7 / Android 9 | **Debloat only**. Amazon ACR, shopping, metrics |
| `xgimi-horizon-s-pro/` | XGIMI Horizon S Pro projector (XK03H, `xgimigalileo`) | Android TV 11 | Projector profile; keystone, autofocus, HDMI player kept; HDMI switching needs `input_action` |
| `xiaomi-mi-box-s/` | Xiaomi Mi Box S (MIBOX4, `oneday`), streaming box | Android TV 9 | PatchWall, Mi analytics, Alphonso tracking; USB port powers down when USB debugging active |
| `xiaomi-mi-tv-4a/` | Xiaomi Mi TV 4A (`MiTV-MOOQ1`, `tarzan`) | Android TV 10 | PatchWall, Mi analytics, SmartShare; Baidu keyboard fallback bug |
| `xiaomi-mitv-aesp0/` | Xiaomi MiTV-AESP0 stick (`aquaman`, 1 GB) | Android TV 9 | Stick form factor (no HDMI inputs); Home button sends `ALL_APPS`, requires `HOME_KEY_SERVICE=1` |
| `xiaomi-mitv-axso0/` | Xiaomi MiTV-AXSO0 (`dangal`; Mi TV 4C Pro / 4A Pro) | Android TV 9 | PatchWall, Glance ads, Mi TV+, Sensara, Mi analytics |
| `xiaomi-mitv-mooq0/` | Xiaomi Mi TV (`MiTV-MOOQ0`, `croods`) | Android TV 10 | PatchWall, Mi analytics, TV Manager; factory test app also claims HOME intent |
| `xiaomi-mitv-moor2/` | Xiaomi MiTV-MOOR2 (`venom`, MediaTek) | Google TV 11 | PatchWall, Mi analytics; setupwraith wizard must be disabled to release HOME |
| `xiaomi-mitv-mssp3/` | Xiaomi MiTV-MSSP3 (`machuca`, MediaTek) | Android TV 11 | PatchWall, Mi analytics, Netflix observer |
| `xiaomi-tv-a-pro-2026/` | Xiaomi TV A Pro 75" 2026 (`MiTV-MZTU0`, `river`, MTK) | Google TV 14 | PatchWall/Mi Home, Mi analytics; setupwraith recovery crash-loop mitigation required |
