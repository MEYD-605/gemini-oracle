# maclab Google Drive (ai.no.1bro@gmail.com) Streaming Setup & Storage Strategy

## Configuration & Mount (VERIFIED live 2026-08-15)
- **Account:** `ai.no.1bro@gmail.com` (5TB Workspace quota)
- **App:** Google Drive for Desktop (DriveFS v129.0.1.0)
- **Mount Location:** `~/Library/CloudStorage/GoogleDrive-ai.no.1bro@gmail.com/`
- **Thai System Paths:**
  - `ไดรฟ์ของฉัน` (My Drive)
  - `คอมพิวเตอร์เครื่องอื่นๆ` (Other computers)
- **Symlink:** `~/Google Drive` -> `~/Library/CloudStorage/GoogleDrive-ai.no.1bro@gmail.com` (0-byte symlink, does not consume local disk)

## Streaming Mode vs Local Mirroring
- **Mode:** macOS FileProvider Streaming Mode. Files reside in the cloud and materialize on-demand when accessed by agents or OS.
- **Disk Footprint:** `content_cache` (~60K), 0 bytes local disk used for unaccessed files.
- **Rule:** Never configure local folder mirror paths in DriveFS settings. Keep streaming-only to protect maclab internal SSD space (513G free).

## Customer Photo Auto-Share Workflow (Bo's Pattern)
1. Copy target customer media folder to `~/Library/CloudStorage/GoogleDrive-ai.no.1bro@gmail.com/ไดรฟ์ของฉัน/Customers/<name-date>/`.
2. File uploads automatically via DriveFS streaming engine.
3. Generate share link via `rclone link` (if rclone remote configured) or Drive web UI right-click share.
4. Send public link to Bo / customer via Discord DM without storing heavy media on local SSD.

## 3-2-1 Storage Architecture for Fleet
- **Tier 1 (Internal Hot):** maclab internal NVMe (1TB, ~513GB free)
- **Tier 2 (External Hot/Temp):** 2TB External SSD (Club S / replacement)
- **Tier 3 (Cloud Cold/Archive):** Google Drive 5TB (`ai.no.1bro@gmail.com`)

## Maintenance & Pipeline Alert
- **Stale Backup Warning:** `maclab-backups/` on Drive contained `maclab-nightly-20260630-1610.tar.zst` (stale since 2026-06-30 because original cron ran on `ai-core` which was sunset). Nightly backup script must be scheduled on maclab local cron.
