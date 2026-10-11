# 9router Service Operations & Target Disambiguation

## Target Disambiguation Rules
- When the user asks to open or start a service ("เปิด 9router ให้ที", "เปิด service X"), the default target is ALWAYS **maclab (local machine / "เครื่องเรา")**, NOT remote fleet nodes (e.g. `black`).
- **NEVER** assume a remote host or perform SSH actions on other machines unless the user explicitly names the remote node.
- **"เปิด [service]" Meaning:** Often refers to user interaction with the GUI / Web Dashboard (e.g. opening `http://localhost:20128` for adding credentials/logins), not merely verifying that the background process is running or launching remote instances.

## 9router Status Check & Dashboard Access
- **Local Dashboard URL:** `http://localhost:20128` (or via Tailscale IP `http://100.83.0.1:20128`)
- **MacLab Service Name:** `ai.hermes.9router` (managed via launchd / `launchctl print gui/$(id -u)/ai.hermes.9router`)
- **Process Check:** `ps aux | grep 9router` (runs on port 20128)
