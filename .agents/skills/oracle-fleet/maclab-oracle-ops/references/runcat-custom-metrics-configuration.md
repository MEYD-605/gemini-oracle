# RunCat / Menu Bar Custom Metrics Configuration & Speed Scaling

## 1. Menubar Custom Metrics Configuration (`CUSTOM_METRICS_CONFIGURATION` & `METRICS_BAR_CONFIGURATION`)
- **JSON Schema Requirement**: RunCat Custom Metrics JSON *must* include `metricsBarValue` at the root object level (e.g. `"metricsBarValue": "44°C · 9r: $6,967"`). Without this property, RunCat cannot determine what string to render on the menubar strip, even if `metrics` list items are present.
- **UserDefaults Registration**: Adding a source to `CUSTOM_METRICS_CONFIGURATION` is not enough to show it on the menubar. The source UUID must also be included in `METRICS_BAR_CONFIGURATION` under `visibleCustomMetricsSourceIDs`:
  ```json
  {
    "showsCPU": true,
    "showsMemory": false,
    "showsStorage": false,
    "showsBattery": false,
    "showsNetwork": false,
    "visibleCustomMetricsSourceIDs": ["<SOURCE_UUID>"]
  }
  ```
- **Security-Scoped Bookmarks**: Custom Metrics JSON paths require valid macOS security-scoped bookmarks stored in base64 within the `bookmark` field of each source.

## 2. Cat Runner Speed Scaling (Intel / Custom Backports)
- **CPU Scaling Formula**: RunCat `percentage.value` is normalized `0.0...1.0`. Scaling must map CPU % (`0...100%`) smoothly to runner speed (`1.0...10.0`).
- **Standard Formula**:
  ```swift
  let cpuPct = Float((cpuInfo?.percentage.value ?? 0.0) * 100.0)
  let cpuValue = max(1.0, min(10.0, 1.0 + (cpuPct / 10.0)))
  ```
- Avoid dividing raw `percentage.value` (0.0...1.0) directly by 5.0 without scaling to 100% first, as `max(1.0, ...)` will clamp the result to 1.0 continuously, causing the cat animation speed to lock at minimum.
