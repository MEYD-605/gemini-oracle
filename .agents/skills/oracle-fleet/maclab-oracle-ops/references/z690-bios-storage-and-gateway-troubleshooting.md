# Hardware & Storage Troubleshooting & BIOS Recovery — Black Machine (Z690)

## 1. Gigabyte Z690 Gaming X Storage Dropouts
- **Symptom:** SATA SSD (e.g., Samsung 870 QVO 8TB) and secondary M.2 NVMe (WD Blue SN550 1TB) intermittently disappear on boot or cause I/O stalls / kernel freezes.
- **Root Cause:** Early BIOS releases (`F7`) on Gigabyte Z690 GAMING X DDR4 have PCIe Lane Training initialization bugs for the Z690 chipset PCH bus (`00:1b.4`).
- **Fix:** Update BIOS to **F34** (or latest official non-beta release).
- **Format Requirements:** USB Flash Drive must be formatted as **FAT32 (vfat)**. Placed files (`Z690GAMINGX.F34`) will be auto-detected by Q-Flash. For Q-Flash Plus (rear button method), rename the BIOS file to `GIGABYTE.BIN`.

## 2. Hermes Gateway Model Configuration Stale Override (`state.db`)
- **Symptom:** Gateway log reports `HTTP 404: No active credentials for provider: claude` or falls back repeatedly to unwanted models, even after `config.yaml` is updated to `glm/glm-5.2` or `custom` 9router endpoints.
- **Root Cause:** Active session records in `state.db` store a JSON string in `sessions.model_config` (e.g. `{"gateway_runtime": {"model": "cc/claude-sonnet-5"}}`), which overrides `config.yaml` for continuing conversations.
- **Fix:**
  ```bash
  python3 -c "
  import sqlite3
  conn = sqlite3.connect('/home/meyd/agents/no10/.hermes-no10/state.db')
  cursor = conn.cursor()
  cursor.execute(\"UPDATE sessions SET model='glm/glm-5.2', billing_provider='custom', billing_base_url='http://127.0.0.1:20128/v1', model_config=NULL\")
  conn.commit()
  "
  ```
- **Restart Protection:** If Hermes Gateway trips the restart-loop breaker (3 restarts within 60s), remove `/path/to/.hermes/gateway/restart_loop.json` before relaunching.

## 3. Remote Proxmox & VM Access Identification
- **Identification:** Check Proxmox VM config via API (`/nodes/<node>/qemu/<vmid>/config`). Look at `sshkeys` field (e.g. `golfservera@MacminiGolf.local`) to identify who provisioned the VM.
- **Access Modes:**
  1. **Web Console:** `https://143.14.4.1:8006` -> select VM -> Console (noVNC).
  2. **SSH Key:** Check if `PasswordAuthentication` is disabled in `sshd_config` (requires owner's Public Key in `~/.ssh/authorized_keys`).
