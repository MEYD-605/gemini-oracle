# Architecture Analysis: Gathin23/cleanyourtv

> **Repository Provenance**: Analyzed from local clone at `/Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv` (formerly `tv-vibehack`).  
> **Target Scope**: Android TV / Google TV debloater and lightweight Apple TV-style native launcher.

---

## 1. System Overview & Architectural Model

`cleanyourtv` provides a non-root, wireless debloating toolchain and custom native home screen replacement for Android TV and Google TV devices. The system architecture is bifurcated into two distinct environments:
1. **Host-Side Automation & ADB Transport Layer (`tools/`)**: A pure-Python ADB-over-TCP client (`tools/tv.py`) and dual-platform shell scripts (`.sh` / `.ps1`) that interact directly with the TV's `system_server`, `PackageManager` (`pm`), and `ActivityManager` (`am`) over Wi-Fi without requiring the standalone Android platform-tools `adb` binary.
2. **Device-Side Native Leanback Launcher (`launcher/`)**: An ultra-lightweight (~250 KB shrunk APK, package `com.gathin.tvhome`) Android TV launcher written in clean Java targeting devices with constrained hardware (specifically 1 GB RAM). It incorporates a custom tvOS-like visual presentation, dynamic theme overlays (`themes/`), and an extensible, security-hardened module card framework (`docs/specs/card.md`).

```
+----------------------------------------------------------------------------------------------------+
|                                HOST MACHINE (macOS / Linux / Windows)                              |
|                                                                                                    |
|   +-----------------------+     +------------------------+     +-------------------------------+   |
|   |   tools/disable.sh    |     | tools/restore.sh       |     | launcher/build-and-install.sh |   |
|   |   tools/disable.ps1   |     | tools/restore.ps1      |     | launcher/build-and-install.ps1|   |
|   +-----------+-----------+     +-----------+------------+     +---------------+---------------+   |
|               |                             |                                  |                   |
|               +----------------------+      |      +---------------------------+                   |
|                                      |      |      |                                               |
|                               +------v------v------v-------+                                       |
|                               |       tools/tv.py          |                                       |
|                               | (Python adb_shell TCP/5555)|                                       |
|                               +--------------+-------------+                                       |
|                                              |                                                     |
|                               +--------------v-------------+                                       |
|                               |      tools/b64push.py      |                                       |
|                               | (Base64 Chunk File Upload) |                                       |
|                               +--------------+-------------+                                       |
+----------------------------------------------|-----------------------------------------------------+
                                               | ADB over Wi-Fi (Port 5555)
+----------------------------------------------v-----------------------------------------------------+
|                                 TARGET DEVICE (Android TV / Google TV)                             |
|                                                                                                    |
|  [Android OS Framework: Package Manager (pm), Activity Manager (am), Settings Provider, TV Inputs] |
|                                              ^                                                     |
|  +-------------------------------------------|--------------------------------------------------+  |
|  | Native Launcher (com.gathin.tvhome)       |                                                  |  |
|  |                                           |                                                  |  |
|  |  +--------------------+        +----------v-----------+        +--------------------------+  |  |
|  |  |    MainActivity    | <----> |      AppAdapter      | <----> |       DockDecoration     |  |  |
|  |  | (Spring Animation, |        | (Pinned Dock + Grid) |        |   (tvOS Pinned Dock Row) |  |  |
|  |  |  Top Shelf Glow)   |        +----------------------+        +--------------------------+  |  |
|  |  +---------+----------+                                                                      |  |
|  |            |                   +----------------------+        +--------------------------+  |  |
|  |            +-----------------> |      GlassView       |        |        Config.java       |  |  |
|  |            |                   | (Shared Spring Slab) |        | (config.xml + JSON layer)|  |  |
|  |            |                   +----------------------+        +-------------+------------+  |  |
|  |            |                                                                 ^               |  |
|  |            |                   +----------------------+                      |               |  |
|  |            +-----------------> | Cards / CardFeature  |                      |               |  |
|  |                                | (Spec 1 Module Cards)|                      |               |  |
|  |                                +----------------------+                      |               |  |
|  |  +--------------------+        +----------------------+                      |               |  |
|  |  |   InputKeyService  |        |    HomeKeyService    |                      |               |  |
|  |  |  (KEYCODE_TV hook) |        | (KEYCODE_ALL_APPS)   |                      |               |  |
|  |  +--------------------+        +----------------------+                      |               |  |
|  |  +--------------------+                                                      |               |  |
|  |  |     ClockDream     | (DreamService Screensaver)                           |               |  |
|  |  +--------------------+                                                      |               |  |
|  +------------------------------------------------------------------------------|---------------+  |
|                                                                                 |                  |
|  +------------------------------------------------------------------------------v---------------+  |
|  | External Storage Overlay: /sdcard/Android/data/com.gathin.tvhome/files/config.json           |  |
|  | (Pushed via tools/theme.sh from themes/aurora, themes/six-columns, etc.)                     |  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Directory Structure & Organization

The repository layout is organized by functional domain:

```
cleanyourtv/
├── .github/
│   └── FUNDING.yml                  # GitHub sponsorship links (no CI workflow present)
├── docs/                            # Developer specifications and screenshots
│   ├── modules.md                   # Guide for authoring Leanback module cards
│   ├── specs/
│   │   └── card.md                  # Formal specification for Module Card Spec 1
│   └── *.png / *.jpg                # UI showcase, comparison, and focus screenshots
├── examples/                        # Device-specific debloat definitions
│   ├── README.md                    # Index of 23+ tested TVs, OS firmware levels, hardware notes
│   ├── benq-e55-735/debloat.txt
│   ├── chiq-ai-pont/debloat.txt
│   ├── google-chromecast-gtv-4k/debloat.txt
│   ├── hisense-smarttv-4k-ffm/debloat.txt
│   ├── insignia-ns55f301na25/debloat.txt
│   ├── nvidia-shield-tv-pro-2019/debloat.txt
│   ├── oneplus-tv-dubai/debloat.txt
│   ├── philips-smart-4k-google-tv/debloat.txt
│   ├── rca-ai-pont/debloat.txt
│   ├── sanyo-atv-r2/debloat.txt
│   ├── sony-bravia-4k-ur2/debloat.txt
│   ├── sony-xbr-x900e/debloat.txt
│   ├── stellamore-t950s/debloat.txt
│   ├── tcl-*/ (6 variations)
│   ├── toshiba-fire-tv-aftha004/debloat.txt
│   ├── xgimi-horizon-s-pro/debloat.txt
│   └── xiaomi-*/ (8 variations)
├── launcher/                        # Native Android TV launcher Gradle project (root: 'tvhome')
│   ├── app/                         # Application module ('com.gathin.tvhome')
│   │   ├── build.gradle             # Android build config (minSdk 26, targetSdk 34, R8 shrink)
│   │   ├── proguard-rules.pro       # R8 rules for resource shrinking and optimization
│   │   └── src/
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml # Declares Activities, Services, package queries, permissions
│   │       │   ├── java/com/gathin/tvhome/ # Java source files (13 classes)
│   │       │   └── res/             # Layouts, anims, drawables, fonts, and i18n strings (ca, de, es, fr, ru, th, zh)
│   │       └── test/java/com/gathin/tvhome/ # JVM unit tests (CardFeatureTest.java, CardsTest.java)
│   ├── gradle/wrapper/              # Gradle wrapper runtime (8.9)
│   ├── build.gradle                 # Root Gradle build file (AGP 8.5.2)
│   ├── settings.gradle              # Project settings ('tvhome', includes ':app')
│   ├── gradle.properties            # JVM memory arguments and AndroidX flags
│   ├── gradlew / gradlew.bat        # Gradle wrapper CLI launchers
│   ├── build-and-install.sh         # Linux / macOS launcher compilation and installation pipeline
│   ├── build-and-install.ps1        # Windows PowerShell build & install counterpart
│   └── FONT-LICENSE-OFL.txt         # SIL Open Font License for res/font/outfit.ttf
├── themes/                          # Modular design configurations pushed over ADB
│   ├── README.md                    # Documentation of supported config keys and wallpaper specifications
│   ├── default/config.json          # Reference JSON default settings
│   ├── aurora/                      # Theme with dark aurora wallpaper (wallpaper.jpg + config.json)
│   └── six-columns/config.json      # 6-column density preset
├── tools/                           # Host-side ADB automation scripts
│   ├── requirements.txt             # Python dependencies (adb-shell, rsa, cryptography)
│   ├── tv.py                        # Standalone pure-Python TCP ADB client
│   ├── b64push.py                   # Robust fallback file uploader via base64 chunking
│   ├── disable.sh / disable.ps1     # Debloat package disabler
│   ├── restore.sh / restore.ps1     # Debloat package restorer and stock home re-enabler
│   └── theme.sh / theme.ps1         # Theme deployer to app external files directory
├── CONTRIBUTING.md                  # Guidelines for contributing debloat lists and themes
├── LICENSE                          # Apache License 2.0
├── PROMPT.md                        # Master LLM prompt for conversational end-to-end debloating
├── README.md                        # Main documentation, quick start, and troubleshooting guide
└── SHOWCASE.md                      # Community user-submitted installations and hardware logs
```

---

## 3. Entry Points & Component Lifecycle

### A. Host-Side Script Entry Points

| File | Parameters & Environment | Execution Role |
| :--- | :--- | :--- |
| [`tools/tv.py`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/tv.py) | Env: `TV_HOST`, `TV_PORT` (default `5555`).<br>Flags: `--probe`, `--push`, `--pull`, `--batch`, `<command...>` | Core transport client. Connects directly to TV over TCP using `adb_shell.adb_device.AdbDeviceTcp`. Generates or reuses RSA keys (`~/.android/adbkey` or `tools/adbkey/adbkey`) without external `adb`. |
| [`tools/b64push.py`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/b64push.py) | Args: `<local file> <remote path>` | Workaround for ADB socket/sync stalls on large files. Splits files into 48 KB binary chunks, base64 encodes them, pushes via `echo '...' >> remote.b64`, executes `base64 -d`, and validates `md5sum`. |
| [`tools/disable.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/disable.sh)<br>[`tools/disable.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/disable.ps1) | Arg: `<debloat-list-path>`<br>Env/Param: `TV_HOST` | Reads package lists (ignoring `#` comments), generates `pm disable-user --user 0 <pkg>` lines, and pipes them to `tv.py --batch`. Concludes with `pm list packages -d`. |
| [`tools/restore.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/restore.sh)<br>[`tools/restore.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/restore.ps1) | Args: `<debloat-list-path> [stock-launcher-pkg]` (default: `com.google.android.tvlauncher`) | Re-enables all packages via `pm enable <pkg>`, restores stock launcher, resets home activity via `cmd package set-home-activity`, and restores standard animation scales (`1.0`). |
| [`launcher/build-and-install.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/build-and-install.sh)<br>[`launcher/build-and-install.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/build-and-install.ps1) | Env/Params: `TV_HOST`, `STOCK_LAUNCHER`, `INPUT_KEY_SERVICE=1`, `HOME_KEY_SERVICE=1` | Orchestrates the end-to-end launcher build with Gradle, probes the active home package, pushes APK via `b64push.py`, installs via `pm install -r`, starts `MainActivity`, disables the stock launcher, and sets default home activity with safety rollback. |
| [`tools/theme.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/theme.sh)<br>[`tools/theme.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/theme.ps1) | Arg: `<theme-folder>` or `--reset` / `-Reset` | Pushes `config.json` and optional `wallpaper.jpg` into `/sdcard/Android/data/com.gathin.tvhome/files/`, restarts `MainActivity` via `am force-stop` and `am start`. |

### B. Android Device-Side Components (`launcher/app/src/main/AndroidManifest.xml`)

| Component Class | Type & Exported | Intent Filters / Permissions | Architectural Role |
| :--- | :--- | :--- | :--- |
| [`MainActivity`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/MainActivity.java) | `Activity`<br>`android:exported="true"` | `<category android:name="android.intent.category.HOME" />`<br>`<category android:name="android.intent.category.DEFAULT" />`<br>`<category android:name="android.intent.category.LEANBACK_LAUNCHER" />` | Main launcher UI. Configured as `singleTask`, `stateNotNeeded="true"`, `excludeFromRecents="true"`, `screenOrientation="landscape"`. Hosts the `RecyclerView` app grid, spring-driven `GlassView`, top buttons, ambient glow, and package change receivers. |
| [`HomeSettingsActivity`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/HomeSettingsActivity.java) | `Activity`<br>`android:exported="false"` | Theme: `@android:style/Theme.NoDisplay`<br>`taskAffinity=""` | Trampoline activity invoked from the "Default home" app tile. Dispatches `Settings.ACTION_HOME_SETTINGS` to open the system home picker without requiring privileged shell access. |
| [`HomeKeyService`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/HomeKeyService.java) | `AccessibilityService`<br>`android:exported="true"` | `android.permission.BIND_ACCESSIBILITY_SERVICE`<br>Meta: `@xml/home_key_service` | Remaps `KeyEvent.KEYCODE_ALL_APPS` to `Intent.CATEGORY_HOME` (`com.gathin.tvhome`). Solves the issue on Xiaomi devices where Android TV 9 only routes the remote's home key to the stock launcher. |
| [`InputKeyService`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/InputKeyService.java) | `AccessibilityService`<br>`android:exported="false"` | `android.permission.BIND_ACCESSIBILITY_SERVICE`<br>Meta: `@xml/input_key_service` | Global key interceptor for `KeyEvent.KEYCODE_TV`. Dispatches `com.android.tv.action.VIEW_INPUTS` to launch the hardware source switcher from any foreground app on Google TV remotes (e.g., Chromecast Voice Remote). |
| [`ClockDream`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/ClockDream.java) | `DreamService`<br>`android:exported="true"` | `android.permission.BIND_DREAM_SERVICE`<br>`android.service.dreams.DreamService` | Burn-in-safe screensaver. Displays minimalist time/date on pure black with a slow, shifting radial ambient glow (`PALETTE` across blue, teal, violet, orange, rose). Drifts position every 60 seconds (`MOVE_MS`). |

---

## 4. Core Abstractions & End-to-End Orchestration Flow

The complete operation of `cleanyourtv` follows a strictly sequenced 5-stage lifecycle:

```
  [1. CONNECT]      tools/tv.py connects via TCP/5555; probes device props (getprop)
         │
         ▼
  [2. BACKUP]       Captures package list, disabled state, and settings before modification
         │
         ▼
  [3. DEBLOAT]      tools/disable.sh runs 'pm disable-user --user 0' using examples/*/debloat.txt
         │
         ▼
  [4. INSTALL]      launcher/build-and-install.sh:
                    ├── Gradle assembleRelease (R8 Proguard optimization)
                    ├── b64push.py -> /data/local/tmp/tvhome.apk
                    ├── pm install -r & pm grant ACCESS_FINE_LOCATION
                    ├── cmd package compile -m speed -f com.gathin.tvhome
                    ├── am start -W com.gathin.tvhome/.MainActivity
                    ├── pm disable-user --user 0 $STOCK_LAUNCHER
                    ├── cmd package set-home-activity com.gathin.tvhome/.MainActivity
                    └── Safety Check: verifies resolve-activity; rolls back if failed
         │
         ▼
  [5. RESTORE]      tools/restore.sh: re-enables disabled pkgs, restores stock launcher & anim scales
```

### Stage 1: Connection & Transport Abstraction
- Implemented in [`tools/tv.py`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/tv.py).
- Resolves macOS Local Network Privacy restrictions where native `/usr/local/bin/adb` fails with `No route to host`.
- Uses `adb_shell.adb_device.AdbDeviceTcp(HOST, PORT)`.
- Key discovery: Checks `KEY = tools/adbkey/adbkey`. If missing, but standard Android SDK keys exist (`~/.android/adbkey` and `.pub`), it reuses them directly (`ADB_KEY`), preventing duplicate authorization prompts on the TV screen. Otherwise, it invokes `keygen(KEY)` and loads keys into `PythonRSASigner`.

### Stage 2: Backup
- Documented in [`PROMPT.md`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/PROMPT.md#L30-L35).
- Dumps installed packages (`pm list packages -f`), disabled packages (`pm list packages -d`), system properties (`getprop`), and secure/global settings before executing changes.

### Stage 3: Debloating Pipeline
- Implemented in [`tools/disable.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/disable.sh#L13-L16) and [`tools/disable.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/disable.ps1#L20-L22).
- Debloat lists (`examples/*/debloat.txt`) are plain text files containing package names with `#` comments.
- Uses `pm disable-user --user 0 <package>`. Crucially, packages are never uninstalled (`pm uninstall`), ensuring that system partition integrity is preserved and changes can be completely reverted without factory resets.
- Piped into `tools/tv.py --batch` over a single TCP socket stream to minimize connection overhead.

### Stage 4: Launcher Build, Installation, and Home Assignment
- Implemented in [`launcher/build-and-install.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/build-and-install.sh) and [`launcher/build-and-install.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/build-and-install.ps1).
- **Stock Launcher Auto-Detection**:
  Queries the TV via `cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME` to detect the currently active home package. Only known stock packages (`com.google.android.tvlauncher`, `com.google.android.apps.tv.launcherx`, `com.google.android.leanbacklauncher`) are targeted. If an unrecognized package or setup wizard (`setupwraith`) is returned, the script halts to prevent bricking navigation.
- **Reliable Binary Transfer**:
  Uses `tools/b64push.py` to upload the 250 KB release APK to `/data/local/tmp/tvhome.apk`, streaming 48 KB base64 chunks through shell `echo` and decoding on device with `base64 -d`, verified with `md5sum`.
- **Atomic Home Handover Sequence**:
  The installation command sequence is executed in a strict order:
  1. `pm install -r /data/local/tmp/tvhome.apk`
  2. `pm grant com.gathin.tvhome android.permission.ACCESS_FINE_LOCATION` (grants permission to read Wi-Fi SSID on Android 10+).
  3. `cmd package compile -m speed -f com.gathin.tvhome` (triggers Ahead-of-Time ART compilation so low-end CPUs don't stutter on JIT during initial launch).
  4. `am start -W -n com.gathin.tvhome/.MainActivity` (launches new launcher into the foreground).
  5. `pm disable-user --user 0 $STOCK_LAUNCHER` (disables the stock launcher).
  6. `cmd package set-home-activity --user 0 com.gathin.tvhome/.MainActivity` (sets new launcher as system default).
- **Safety Verification & Automatic Rollback**:
  The script re-resolves the home activity (`resolve-activity`). If `com.gathin.tvhome/*` is not returned, the script immediately re-enables the stock launcher (`pm enable --user 0 $STOCK_LAUNCHER`), outputs diagnostic error details (e.g. regarding `setupwraith` on Google TV 14), and exits with code 1.

### Stage 5: Restoration Pipeline
- Implemented in [`tools/restore.sh`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/restore.sh) and [`tools/restore.ps1`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/restore.ps1).
- Re-enables all packages specified in the debloat list using `pm enable <pkg>`.
- Re-enables the stock launcher package and binds it as default home (`cmd package set-home-activity`).
- Resets global window, transition, and animator animation scales to standard values:
  `settings put global window_animation_scale 1.0`  
  `settings put global transition_animation_scale 1.0`  
  `settings put global animator_duration_scale 1.0`

---

## 5. Device-Side Launcher Internal Abstractions

### A. Layered Configuration Engine ([`Config.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/Config.java))
The launcher employs a two-tier configuration system:
1. **Compile-Time Defaults**: Read from XML resources in [`res/values/config.xml`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/res/values/config.xml) (`dock_apps`, `hidden_apps`, `columns`, `rows_below_dock`, `live_tv_package`, `module_cards`, `shamsi_date`, `vpn_app`).
2. **Runtime File Overlay**: Loaded during `MainActivity.onCreate()` from external storage:
   `/sdcard/Android/data/com.gathin.tvhome/files/config.json` (and `wallpaper.jpg`).
   Parsed with strict type checking and range clamps (e.g., `columns` clamped between 1 and 8; `rows_below_dock` clamped between 0 and 3). Malformed JSON or invalid keys are silently ignored, preventing configuration crashes.

### B. View Structure & Motion Physics
- **Grid & Dock Hierarchy**:
  Uses an AndroidX `RecyclerView` with a `GridLayoutManager` ([`MainActivity.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/MainActivity.java#L216-L240)).
  - Pinned Dock: The first row of tiles (`COLUMNS`, default 4) represents the dock.
  - Dock Band Background: Drawn dynamically by [`DockDecoration.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/DockDecoration.java) as a single rounded rectangle (`0xFF141416` fill, `0x1FFFFFFF` stroke) enclosing all children in row 0.
- **Glass Highlight (`GlassView.java`)**:
  Rather than each app tile rendering individual borders or focus drawables, the layout contains a single floating [`GlassView`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/GlassView.java) placed on a top canvas plane. It draws a multi-layer gradient with an outer specular rim, soft fill, and triple-stroke glow.
- **Physics Springs**:
  Driven by AndroidX DynamicAnimation (`SpringAnimation`, `SpringForce`). When tile focus changes, `springX` and `springY` spring the `GlassView` to the target coordinates. `MainActivity` listens to `RecyclerView` scroll events (`addOnScrollListener`) and offsets `glassScrollShift` and `translationY` directly so the glass locks seamlessly with vertical scrolling without jitter.
- **Ambient Glow Sampling**:
  When a dock item is focused, [`AppAdapter.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/AppAdapter.java#L225-L240) samples pixels from the application's banner or icon bitmap to extract a dominant hue, dynamically updating the radial gradient of the background `ambient` view behind the top shelf hero text.

### C. Module Card Architecture ([`Cards.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/Cards.java), [`CardFeature.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/CardFeature.java), [`docs/specs/card.md`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/docs/specs/card.md))
An extensible IPC/manifest contract allowing external Android TV apps to declare custom cards on the home screen:
- **Contract Declaration**:
  An external app declares an `<activity>` containing both `android.intent.category.LEANBACK_LAUNCHER` and `com.gathin.tvhome.category.DOCK_CARD`, along with `<meta-data android:name="com.gathin.tvhome.card" android:resource="@xml/module_card" />`.
- **XML Card Schema (Spec 1)**:
  `<card spec="1" label="..." caption="..." accent="#RRGGBB" />`.
- **Security Boundaries & Cryptographic Pinning**:
  1. *Resource Limit Enforcement*: Maximum 32 cards scanned per resume; maximum 8 cards promoted as tiles; maximum 128 decision records retained; max label length 24 chars; max caption length 32 chars.
  2. *Single-Signer Enforcement*: On Android 9+, reads `SigningInfo.getApkContentsSigners()`; on Android 8, reads `PackageInfo.signatures`. The package MUST be signed by exactly one certificate. The SHA-256 digest of the DER certificate is computed and pinned in `files/cards.json` (format version 2).
  3. *User Authorization*: Unverified cards trigger a native modal prompt (`cardPrompt`) showing the application label, package name, and the first 12 hex characters of the certificate digest. The user must explicitly choose "Show card" or "Keep hidden".
  4. *Name Collision Guarding*: Labels matching built-in UI names (`Home`, `Settings`, `Inputs`, `Wi-Fi`, `Live TV`), input prefixes (`HDMI`, `AV`), endorsement tokens (`verified`, `official`), or conflicting with existing installed app labels are rejected.
  5. *Fail-Safe Isolation (`CardFeature.java`)*: All invocations into `Cards` are wrapped in `CardFeature.run(Step<T>, fallback)`. If any exception or `LinkageError` occurs (e.g., runtime bytecode incompatibility on custom OEM ROMs), cards are disabled for the entire process session with a single logcat warning (`TvHomeCards`), preventing launcher crashes.

### D. System Integrations
- **Network & VPN Status Tracking**:
  Registers network callbacks on `ConnectivityManager` to dynamically detect Wi-Fi connection, Ethernet links, and active VPN interfaces ([`MainActivity.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/MainActivity.java#L122-L156)).
  [`VpnBadge.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/VpnBadge.java) implements a custom `ReplacementSpan` rendering a green lock badge inside the network pill when a VPN is established, or an alert-style red capsule when a configured VPN app (`vpn_app`) is disconnected.
- **TV Inputs & Live TV Switching**:
  Utilizes `TvInputManager` to enumerate hardware inputs (`TvInputInfo.TYPE_HDMI`, `TYPE_TUNER`, `TYPE_DVI`). Clicking an input launches the appropriate `TvContract.buildChannelUriForPassthroughInput(inputId)` URI intent, falling back to OEM actions (e.g. `com.xgimi.action.hdmiPlayer`).
- **Solar Hijri (Shamsi) Calendar**:
  [`Shamsi.java`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/src/main/java/com/gathin/tvhome/Shamsi.java) implements an embedded 33-year cycle Jalali conversion algorithm in pure Java arithmetic, eliminating heavy ICU calendar dependencies.

---

## 6. Build Tooling & Dependencies

### A. Android & Java Build Environment
Declared in [`launcher/build.gradle`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/build.gradle), [`launcher/app/build.gradle`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/app/build.gradle), and [`launcher/gradle/wrapper/gradle-wrapper.properties`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/launcher/gradle/wrapper/gradle-wrapper.properties):

| Dimension | Version / Configuration | File Citation |
| :--- | :--- | :--- |
| **Gradle** | `8.9` (`gradle-8.9-bin.zip`) | `launcher/gradle/wrapper/gradle-wrapper.properties#L3` |
| **Android Gradle Plugin** | `8.5.2` (`com.android.application:8.5.2`) | `launcher/build.gradle#L2` |
| **Java Compatibility** | Java 17 (`JavaVersion.VERSION_17`) | `launcher/app/build.gradle#L29-L30` |
| **Compile SDK** | `compileSdk 34` (Android 14) | `launcher/app/build.gradle#L7` |
| **Target SDK** | `targetSdk 34` (Android 14) | `launcher/app/build.gradle#L12` |
| **Minimum SDK** | `minSdk 26` (Android 8.0 Oreo) | `launcher/app/build.gradle#L11` |
| **Application ID** | `com.gathin.tvhome` | `launcher/app/build.gradle#L10` |
| **Version Code / Name** | `versionCode 2`, `versionName '2.0'` | `launcher/app/build.gradle#L13-L14` |
| **R8 / ProGuard** | `minifyEnabled true`, `shrinkResources true` | `launcher/app/build.gradle#L20-L21` |
| **Signing** | Debug key (`signingConfig signingConfigs.debug`) | `launcher/app/build.gradle#L24` |

### B. Runtime & Test Dependencies

| Artifact | Scope | Version | Justification |
| :--- | :--- | :--- | :--- |
| `androidx.recyclerview:recyclerview` | `implementation` | `1.3.2` | Core app grid and focus layout |
| `androidx.dynamicanimation:dynamicanimation` | `implementation` | `1.0.0` | Physics-based spring animations for `GlassView` |
| `junit:junit` | `testImplementation` | `4.13.2` | JVM unit tests for module card parsing and validation rules |

### C. Host Python Dependencies
Specified in [`tools/requirements.txt`](file:///Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv/tools/requirements.txt):
- `adb-shell`: Pure-Python implementation of the ADB communication protocol over TCP/USB.
- `rsa`: Python-RSA for generating and decoding Android ADB authentication keys.
- `cryptography`: Cryptographic backend for `adb-shell` authentication handshakes.

---

## 7. Architectural Decisions & Design Trade-offs

1. **No Binary `adb` Dependency**:
   By using `adb-shell` in Python, the toolchain bypasses host platform-tools installation requirements and overcomes macOS Local Network privacy sandbox limitations where system `adb` fails to discover devices on the local subnet.
2. **`pm disable-user` vs `pm uninstall`**:
   Disabling packages at user scope (`--user 0`) leaves the underlying APK untouched in the system read-only partition (`/system/app`, `/system/priv-app`), allowing instant, 100% reversible rollbacks via `pm enable` without risk of bricking.
3. **Ahead-of-Time (AOT) Compilation Step**:
   The installer explicitly triggers `cmd package compile -m speed -f com.gathin.tvhome`. On low-end TV chipsets (MediaTek, Realtek, Amlogic with 1 GB RAM), this eliminates JIT compiler thread spikes during the initial launch, ensuring immediate 60fps focus animations.
4. **Decoupled Theme Overlays via JSON**:
   Rather than requiring users to recompile the launcher APK to alter the wallpaper, column layout, or dock app ordering, `Config.java` reads an overlay from `/sdcard/Android/data/com.gathin.tvhome/files/config.json`. The host pushes this file via ADB and restarts the activity in under 2 seconds.
5. **Cryptographically Pinned Module Cards**:
   Instead of supporting uncontrolled dynamic plugins or code loading (which would present an attack vector on TV home screens), Module Card Spec 1 only permits declared metadata pointing to an existing Leanback Activity. The user's grant is pinned to the single certificate digest of the APK, and any signer modification immediately revokes card visibility until re-approved.
