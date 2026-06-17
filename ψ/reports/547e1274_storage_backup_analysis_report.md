# Homelab Storage & Backup Analysis Report

**Date**: 2026-06-09 15:21 GMT+7  
**Reporter**: No.6 Gemini (Pack Leader, Oracle Council)  

---

## 1. Storage Facts & Gaps Breakdown

### Storage Devices
- **NVMe0 (2TB Fanxiang)**:
  - VG `pve` contains:
    - `pve-root` (96G, maps to storage `local`, directory type, allowed content: backup) -> **Only 46G free** (too small for 228G backup).
    - thin-pool `data` (1.7T, maps to storage `local-lvm`, lvmthin type, allowed content: VM/LXC disks) -> **675G unallocated free space**, but cannot store files directly.
    - LXC110 rootfs (`vm-110-disk-0`) -> 1000G allocated thin volume.
- **NVMe1 (1TB Crucial)**:
  - Mounted at `/mnt/nas1t` (ext4) -> **Only 129G free**. (Bind-mounted to LXC110, marked `backup=0` in LXC config).
- **External NAS (192.168.1.129 CIFS)**:
  - Storage `nas-backup` (916G total) -> **788G used (86%), only 128G free**.
  - Contains: `รูป 373G` + `dump LXC110 228G (May 17)`.

### Core Issue
The weekly `vzdump` backup of LXC110 (~228G compressed, 460G raw used) fails with **"No space left on device"** on the External NAS because the remaining space is only 128G.

---

## 2. Option Evaluation

We analyzed three potential directions:

### Option A: Refine Exclusions to Reduce Backup Size (Highest Priority & Safest)
Inside LXC110 (which uses 460G raw space), we found massive amounts of non-essential, stale, or cached directories that do not need to be backed up:
- `/root/.oracle/archive` (47G) — Archival state/logs.
- `/root/archive/old-backups` (22G) — Redundant backup-in-backup files.
- `/root/archive/stale-envs` (23G) — Stale Python virtual environments.
- `/root/archive/models-inactive` (7.5G) — Unused machine learning models.
- `/opt/ComfyUI-Docker` (54G) — Docker cache and image layers for ComfyUI.
- `/root/.cache` (39G) — Package manager caches (pip, npm, bun).

**Total Excludable Space:** **~192.5 GB raw**  
**Result:** Reduces LXC110 active raw space from 460G to **~267G**, bringing the compressed vzdump size down from 228G to **~120–130G or less**. This will fit comfortably inside the remaining 128G on the External NAS (especially if the old May 17 backup is rotated/deleted).

---

### Option B: Create a New Logical Volume from the Thin Pool for Backups (Recommended for Storage Expansion)
Since LVM-thin pool `data` has 675G of unallocated thin space, we can allocate a new 400G thin Logical Volume, format it as `ext4`, mount it on the Proxmox host, and configure it as a local `Directory` storage with content-type `backup`.

**Result:** Instantly provides 400G of high-speed local backup storage on NVMe0.
- **Pros:** Fast local backups and restores; no data needs to be deleted or moved.
- **Cons:** Standard LVM thin pool overcommit risk if the pool runs out of physical space, though 675G is currently safe.

---

### Option C: Move Photos on the NAS (Not Recommended)
Moving 373G of photos from the NAS is slow, risky, and we lack alternative high-capacity storage locations.

---

## 3. Step-by-Step Commands & Risks

> [!WARNING]
> These commands must be run **on the Proxmox Host** via SSH as root. Do not execute them inside the LXC110 container.

### Action Plan 1: Implement Exclusions (Option A)
To configure exclusions globally so that both manual and scheduled backups skip the non-essential folders:

1. Open `/etc/vzdump.conf` on the Proxmox host.
2. Append the target exclusions:
   ```text
   exclude-path: /root/.oracle/archive
   exclude-path: /root/archive/old-backups
   exclude-path: /root/archive/stale-envs
   exclude-path: /root/archive/models-inactive
   exclude-path: /opt/ComfyUI-Docker
   exclude-path: /root/.cache
   ```
*Note: vzdump uses rsync-style pattern matching. Paths starting with `/` are anchored to the container's root.*

**Risk:** **Very Low.** Worst case is a syntax typo which would cause vzdump to skip exclusions. No data corruption risk.

---

### Action Plan 2: Create Local LVM Backup Directory (Option B)
To create 400G local storage out of the `data` thin pool:

1. **Create the thin logical volume** named `local-backup-dir`:
   ```bash
   lvcreate -V 400G --thinpool data --name local-backup-dir pve
   ```
2. **Format the volume** with ext4:
   ```bash
   mkfs.ext4 /dev/pve/local-backup-dir
   ```
3. **Mount the volume** on the host:
   ```bash
   mkdir -p /mnt/local-backup
   mount /dev/pve/local-backup-dir /mnt/local-backup
   ```
4. **Persist the mount** in `/etc/fstab`:
   ```text
   /dev/pve/local-backup-dir /mnt/local-backup ext4 defaults 0 2
   ```
5. **Register the directory in Proxmox** for backups:
   ```bash
   pvesm add dir local-backup --path /mnt/local-backup --content backup
   ```

**Risk:** **Medium-Low.** 
- Ensure the LVM pool is monitored to prevent physical saturation (thin overcommit).
- High-performance local writes will decrease backup duration significantly.
