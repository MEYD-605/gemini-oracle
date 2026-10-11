# RunCat Neo Custom Metrics & Intel Porting Guide

## Background & Architecture
RunCat Neo (`com.Kyome22.RunCatNeo`) is an open-source macOS menu bar app (Swift 6.2 / SwiftUI) supporting custom metrics cards loaded from local JSON files.

- **App Binary**: Universal binary (`x86_64` + `arm64`), compatible with Intel Macs.
- **Minimum OS**: macOS 26+ (Tahoe). Intel Mac support is limited to 2019+ models officially supported by macOS 26.
- **Replica Location (maclab)**: `~/runcat-replica/` (`scripts/`, `launchd/`, `docs/`).

---

## JSON Feed Contract
RunCat Neo watches configured JSON files via `DispatchSource` and redraws on file update.

```json
{
  "title": "AI Machine · white",
  "symbol": "thermometer.medium",
  "metricsBarValue": "2/2 agy",
  "metrics": [
    {"title": "Agents", "formattedValue": "2/2 online"},
    {"title": "CPU temp", "formattedValue": "54°C", "normalizedValue": 0.60},
    {"title": "CPU", "formattedValue": "18%", "normalizedValue": 0.18},
    {"title": "RAM", "formattedValue": "14.2 / 32 GB", "normalizedValue": 0.44}
  ],
  "lastUpdatedDate": "2026-08-16T12:00:00Z"
}
```

### Fields:
- `title` (String): Card title shown in settings and dropdown.
- `symbol` (String): SF Symbol identifier (e.g. `thermometer.medium`, `staroflife`).
- `metricsBarValue` (String, optional): Short summary text displayed in the menu bar item.
- `metrics` (Array):
  - `title` (String): Metric label.
  - `formattedValue` (String): Display value string (verbatim formatting).
  - `normalizedValue` (Float 0.0–1.0, optional): Progress bar fill fraction.
- `lastUpdatedDate` (String): UTC ISO 8601 timestamp (`YYYY-MM-DDTHH:MM:SSZ`).

---

## Hardware Telemetry & Intel Porting Pitfalls

### 1. Apple Silicon vs Intel Temp/Power Monitoring
- **Apple Silicon (`white` / M4)**: Uses `macmon` (`macmon pipe -s 1 -i 700`) for sudoless CPU/GPU temperature (`cpu_temp_avg`, `gpu_temp_avg`) and total package power (`all_power`).
- **Intel Macs (`uses-imac` / Core i5/i7/i9)**: `macmon` is NOT supported.
  - **Replacements for Intel**:
    - Temperature: `osx-cpu-temp` (Brew: `brew install osx-cpu-temp`) or SMC reads.
    - Load / RAM: `sysctl -n vm.loadavg`, `sysctl -n hw.memsize`, `vm_stat`.
    - Power / Throttling: `sudo powermetrics --samplers smc` or `sysctl -n machdep.xcpm.cpu_thermal_level`.

### 2. Service Automation (launchd)
- Scheduled via LaunchAgent (`~/Library/LaunchAgents/com.b3.runcat-metrics.plist`).
- `StartInterval`: `60` seconds.
- Environment MUST include explicit PATH: `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`.

### 3. App Configuration & Setup
- Custom metric source registration is saved in `UserDefaults` (`com.Kyome22.RunCatNeo` domain, `CUSTOM_METRICS_CONFIGURATION` key).
- Can be pre-configured via AppleScript UI automation or `defaults write`.

---

## SPM Backporting & Compiling on macOS 15 Intel (No Xcode / CLT Only)

When porting Swift 6.2 / macOS 26 open-source apps (like RunCatNeo) to macOS 15 Intel machines with Command Line Tools (Swift 6.1.2):

### 1. Toolchain & Target Floor
- **swift-tools-version**: Downgrade `Package.swift` from `6.2` to `6.0` to build with Swift 6.1.x CLT.
- **OS Floor**: Must set `platforms: [.macOS(.v15)]` minimum. Codebase reliance on the `Observation` framework (`@Observable`) blocks macOS 13/Ventura unless UI is completely rewritten.

### 2. Dependency Shims & Vendoring
- **SystemInfoKit**: Pin to `6.8.0` (last release supporting tools 6.1). Add local extension shims for 7.x APIs (`BatteryInfo.simulated`, `NetworkInfo.masked`).
- **AllocatedUnfairLock**: Vendor locally. Replace macOS 15+ `Mutex` with `OSAllocatedUnfairLock` to work with older concurrency runtimes.
- **Task.immediate / SE-0421 Backport**: Replace Swift 6.2 immediate task execution with `@Sendable @MainActor` `Task {}` / `TaskGroup.addTask` wrappers.
- **CLT Macro Workarounds**: `@Entry` macro may fail under CLT if macro plugins are absent; expand manually into `EnvironmentKey` conforming structs.

