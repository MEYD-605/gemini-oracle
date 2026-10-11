# Peer Survey Protocol for Fleet Operations

## Context & Signal
When working in a multi-agent environment (maclab fleet), different agents (`gmgrok`, `No.1`, `No.4`, `No.5`) carry out infrastructure maintenance, house cleanups, and file renames during their own turns.
A common failure mode is **Seat Isolation / Memory Tunneling**:
- User asks: "ทำไมเวลา agent ในทีมทำอะไรทำไมมันนายไม่รู้เรื่องว่ะ"
- Cause: An agent relies on its own old `ψ/focus.md` (e.g. from 15:47) or static memory, while a peer agent (`gmgrok`) already updated house structure, crontab, or links at 17:18 and left a detailed handoff in `gmgrok-oracle/ψ/inbox/handoff/`.

## Mandatory Peer Survey Steps

Before claiming "file is missing", "we need to copy X", "I don't know what changed", or answering questions about workspace/house layout:

1. **Check Peer Focus & Handoffs:**
   - Read `/Users/admin/Code/github.com/MEYD-605/gmgrok-oracle/ψ/focus.md`
   - Check latest handoffs in `/Users/admin/Code/github.com/MEYD-605/gmgrok-oracle/ψ/inbox/handoff/`
   - Read peer handoffs before making claims to the user.

2. **Verify Live Filesystem & Inodes:**
   - Run `stat -f 'path=%N inode=%i'` or `ls -ld` to confirm real directory inodes and symlink targets.
   - Example: `ClubS-Workspace` and `clubs-workspace` share inode `6693509` (case-insensitive APFS on macOS).

3. **Check Crontab & Live Daemon Pins:**
   - `crontab -l | grep -E 'ClubS-Workspace|maw-workspace'`
   - Verify where active crons are pointing before making path recommendations.

4. **Update Self Focus:**
   - Patch `lord-knight-oracle/ψ/focus.md` with verified facts from the peer survey so future turns don't regress.
