# House Structure Audit & Name Drift Safety

## Principles
1. **Legal House Name:** `~/ClubS-Workspace` is the canonical home directory for tooling & human workspace on maclab.
2. **Leftover Directory:** `~/Oracle` is a separate directory/inode for legacy/migrated files (ferry artifacts). NEVER collapse or merge `~/Oracle` into `~/ClubS-Workspace` without explicit Bo / No.1 approval.

## Safe Cleanup Protocol for Reappearing Legacy Symlinks
When old symlinks like `~/ClubsWorkspace` or `~/maw-workspace` reappear (causing confusion about duplicate home directories):

1. **Verify crontab & config paths first:**
   ```bash
   crontab -l | grep -E 'ClubsWorkspace|maw-workspace|ClubS Workspace'
   ```
   Ensure all active scheduled jobs point directly to `~/ClubS-Workspace` (count should be 0 for old names).

2. **Verify process locks:**
   ```bash
   lsof +D /Users/admin/ClubsWorkspace
   ps aux | grep -i ClubsWorkspace
   ```
   Confirm no active process or open file handle is tied to the symlink.

3. **Atomic Symlink Removal:**
   - Remove ONLY the symlink itself (`rm /Users/admin/ClubsWorkspace`).
   - NEVER touch `~/ClubS-Workspace` or `~/Oracle`.
   - Re-check that `~/ClubS-Workspace` and `SHARED_KNOWLEDGE.md` remain intact.

4. **Update Map & Report to No.1:**
   - Patch `แผนที่-Oracle-leftover-<date>.md` and `ψ/focus.md`.
   - Dispatch status update via `maw hey 01-lord-knight`.
