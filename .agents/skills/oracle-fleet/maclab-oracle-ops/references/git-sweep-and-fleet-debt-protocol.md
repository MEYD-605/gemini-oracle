# Git Sweep & Fleet Multi-Repo Debt Clearance Protocol

When performing large-scale multi-repo git debt audits, syncs, or backup sweeps across fleet seats on MacLab/shared hosts (e.g. 40+ repos, thousands of unpushed commits):

## 1. Safety & Hierarchy of Action

1. **Classify Repos Before Batch Action:**
   - **Clean & Fast-Path:** `ahead > 0, behind == 0`, valid GitHub credentials (MEYD-605), no big binary blobs -> push directly.
   - **Credential Mismatch (e.g. `Soul-Brews-Studio` org vs `MEYD-605` PAT / SSH vs HTTPS):** Push will 403 or fail SSH. Do NOT attempt blind force-pushes or credential overwrites. Create a local `.bundle` backup immediately, record in inventory, and request user GO.
   - **Big Blobs / Firmware History:** Large binary assets (>100MB, e.g. Android Magisk patched firmware tars) will fail GitHub push limits regardless of network time. Do NOT hang on long push timeouts. Kill push, bundle `.bundle` to external drive (`/Volumes/Club S/`), and defer repo rewrite to seat owner (Seat Autonomy).
   - **Identity-Diverged Repos:** Merges involving seat identity changes (e.g. `no10-oracle` local rehome vs origin revert) are governance/identity decisions. HOLD and defer to Master Bo / Seat Owner. Never blindly resolve with `--ours` or `--theirs`.

## 2. Fast Backup via Git Bundle

When remote push is blocked or requires approval, bundle history to prevent data loss without mutating git state:

```bash
# Verify destination mount and directory
mkdir -p "/Volumes/Club S/gitsweep-backup-$(date +%Y%m%d)"

# Create full standalone bundle (all refs)
git -C "$REPO_DIR" bundle create "/Volumes/Club S/gitsweep-backup-$(date +%Y%m%d)/${REPO_NAME}.bundle" --all
```

## 3. Remote URL Correction (SSH -> HTTPS)

When git remote uses SSH (`git@github.com:...`) on a machine where SSH keys lack write access but HTTPS credentials (`gh` auth / credential helper) are active:

```bash
git -C "$REPO_DIR" remote set-url origin "https://github.com/MEYD-605/${REPO_NAME}.git"
git -C "$REPO_DIR" push origin "$BRANCH"
```

## 4. Resolving Conflicts on House-Managed Repos (e.g. mac1, gmgrub)

- Inspect untracked files colliding with incoming pull/merge (`.agents/AGENTS.md`). Back up or move conflicting untracked files before merging.
- In `ψ/` state files (`focus.md`, `activity.log`), local nightly saves represent the latest machine-specific execution state. When resolving merge conflicts on local machine state, retain local additions or cleanly combine entries rather than dropping local log history.

## 5. Machine Health & Resource Discipline

- Always monitor load (`sysctl -n vm.loadavg` < 8.0) and avoid spawning multiple parallel `git pack-objects` or multi-gigabyte uploads simultaneously.
- Run multi-GB pushes or heavy bundle operations serially or in background with timeout tracking (`nettop -p <PID>` to verify active data transfer).
