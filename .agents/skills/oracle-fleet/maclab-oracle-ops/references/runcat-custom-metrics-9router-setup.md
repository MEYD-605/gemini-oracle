# RunCat / Menubar Custom Metrics Integration (macOS Intel + 9router)

## Overview
RunCatNeo (and RunCat variants) supports reading custom JSON metrics via standard `CUSTOM_METRICS_CONFIGURATION` in `io.github.maclab.runcatneo-intel` (or `com.kyome.RunCat`) defaults plist with security-scoped bookmarks.

## Components & Data Sources

### 1. CPU Temperature (Intel macOS)
- `macmon` only works on Apple Silicon.
- On Intel Macs, use `osx-cpu-temp` (sudoless):
  ```bash
  osx-cpu-temp
  # Output: 44.5°C
  ```

### 2. 9router Model Usage (SQLite / Weekly per Model)
Query 9router's SQLite database directly (e.g. `~/.9router/9router.db` or active log database) to compute 7-day trailing request count, total cost, and breakdown by model:
```sql
SELECT model, count(*), sum(cost) 
FROM request_logs 
WHERE created_at >= datetime('now', '-7 days') 
GROUP BY model 
ORDER BY count(*) DESC;
```

### 3. Custom Metrics JSON Schema
Output structure saved to `~/.claude/runcat-machine.json` or `~/.hermes-no5/runcat-machine.json`:
```json
{
  "title": "AI Machine · maclab",
  "items": [
    { "label": "CPU Temp", "value": "44.5°C" },
    { "label": "RAM", "value": "42.6 / 80 GB" },
    { "label": "9router 7d", "value": "18.6k reqs ($7,221)" },
    { "label": "Top Model", "value": "opus-5 ($2,822)" }
  ]
}
```

### 4. Injecting into RunCat Defaults with Security Bookmark
RunCat requires a security-scoped bookmark to read files outside its sandbox/bundle scope:
- Generate bookmark via Swift inline script (`URL.bookmarkData(options: .withSecurityScope)`).
- Write `CUSTOM_METRICS_CONFIGURATION` plist array into `defaults write io.github.maclab.runcatneo-intel`.
- Set `SHOWS_METRICS_BAR -bool true`.
- Restart RunCat binary (`pkill -f RunCatNeo` && `open /Users/admin/Applications/RunCatNeo-Intel.app`).

### 5. LaunchAgent Persistence
Deploy `com.maclab.runcat-machine` LaunchAgent running the update script every 300s (5 min).
