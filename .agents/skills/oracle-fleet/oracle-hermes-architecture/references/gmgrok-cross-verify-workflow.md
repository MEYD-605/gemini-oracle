# GmGrok Cross-Verify Workflow

Pattern established 2026-08-12 during arra-oracle-v3 CF auth fixes.

## The Pattern

GmGrok acts as independent verifier for critical fleet infra changes. "Measure twice, cut once."

### Workflow
1. **GmGrok finds root cause** — digs into source, proves with curl/sqlite, stores patch at `~/.arra-oracle-v2/patches/<fix-name>.patch`
2. **No.1 reviews patch** — reads patch, understands what it changes, decides to accept
3. **No.1 applies via git**:
   ```bash
   git apply --check ~/.arra-oracle-v2/patches/cf-auth-fix.patch  # dry-run first
   git apply ~/.arra-oracle-v2/patches/cf-auth-fix.patch
   ```
4. **GmGrok re-verifies** — uses same measurement method pre-fix and post-fix, reports at **code level** (not just "it works"):
   - `grep -c "Bearer" src/file.ts` → 0 (was 9)
   - `bun test src/...` → 4 pass, 0 fail
   - Live search: `source=vector, content=1220 chars` (was 0)
5. **No.1 commits and restarts server**

### GmGrok Server Isolation Pattern

GmGrok separates the production server from the working repo using git worktree:
```bash
# GmGrok creates isolated server environment
git worktree add ~/.arra-oracle-v2/runtime <commit-sha>
# Server runs from worktree → No.1 can reset/checkout freely without downtime
```
This means: No.1 can `git reset --hard FETCH_HEAD` or `git checkout` without killing the live server.

### What GmGrok Reports (good signal quality)

- Exact line numbers of root cause
- Curl proof (HTTP 200 vs 401)
- grep counts before/after fix
- Test file and pass counts
- Whether `git apply --check` passes against current HEAD (prevents surprise conflicts)

### Communication Channel

GmGrok messages arrive via `[maclab:job/arra-oracle-v3]` prefix in the TUI pane.
Response via: `maw hey 00-gmgrok "<message>"`

### When GmGrok Says "I Didn't Touch Your Repo"

Respect this. GmGrok's rule is to not commit to repos owned by other seats. GmGrok prepares patches, No.1 applies. This keeps git history clean and seat boundaries clear.

## Lessons

- **Trust but verify**: GmGrok's patches are tested but No.1 should still read them before applying
- **Metrics over assertions**: "Bearer count = 0" is better evidence than "auth is fixed"
- **Safe ID discovery**: GmGrok spotted the safe_id bug BEFORE No.1 even noticed content was empty — proactive scanning beats reactive debugging
- **Test coverage first**: GmGrok includes test files with patches. Always run them.
