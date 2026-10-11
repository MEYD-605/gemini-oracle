# Peer Symlink Recreation & Bounce-Check Protocol

When dropping legacy compatibility symlinks across shared workspaces or home directories (`~/maw-workspace`, `~/ClubsWorkspace`, `~/ClubS Workspace`), peer agents or background tasks may automatically attempt to recreate them if their context or legacy scripts expect those paths.

## Protocol & Pitfall

1. **Recreation Trap**: Removing symlinks without notifying peer agents can lead to immediate recreation (e.g. peer agent recreating links within seconds, losing `hidden` flags in Finder).
2. **Peer Notification**: Always send an explicit `maw hey` STOP directive to peer agents explaining that `crontab` and active configurations now point to the canonical directory (`~/ClubS-Workspace`) and instructing them not to recreate legacy links.
3. **Double-Drop & Delayed Bounce Check**:
   - Delete the symlinks.
   - Wait/sleep (e.g., 8-10 seconds) to allow any background loops or peer agent responses to fire.
   - Run a delayed `stat`/`ls` check to confirm the symlinks remain absent (`No such file or directory`) and that no background process or peer process re-created them.
