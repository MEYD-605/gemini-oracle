# arra-oracle-v3 Upstream Update Reference (2026-08-12)

## Problem: No Common Ancestor

`MEYD-605/arra-oracle-v3` was initialized independently — **not forked via GitHub** from Soul-Brews-Studio. Git history has no shared commits.

```
git merge FETCH_HEAD
# fatal: refusing to merge unrelated histories
```

## Safe Update Procedure (zero downtime)

```bash
cd ~/Code/github.com/MEYD-605/arra-oracle-v3

# 1. Save any local patches
git show <fix-commit> -- <file> > /tmp/my-fix.patch

# 2. Stash local uncommitted changes
git stash push -m "local-changes-before-upstream-merge"

# 3. Point origin at Soul-Brews upstream
git remote set-url origin https://github.com/Soul-Brews-Studio/arra-oracle-v3.git
git fetch origin alpha

# 4. Reset hard to upstream (bypasses unrelated-history check)
git reset --hard FETCH_HEAD

# 5. Install deps
bun install

# 6. Re-apply local patches
git apply /tmp/my-fix.patch

# 7. Kill old server — launchd restarts automatically
kill $(ps aux | grep "MEYD-605/arra-oracle-v3/src/server.ts" | grep -v grep | awk '{print $2}')
sleep 6
curl -s http://127.0.0.1:47778/api/health | grep -o '"version":"[^"]*"'
```

## Server Management

- **LaunchAgent:** `~/Library/LaunchAgents/com.maclab.arra-cf.plist`
- **Script:** `~/.local/bin/oracle-cf-serve.sh`
- **Entry point:** `bun src/ensure-server.ts` → runs in `~/Code/github.com/MEYD-605/arra-oracle-v3`
- **Data dir:** `~/.arra-oracle-v2/`

## Local Patches to Preserve

### CF Vectorize vector count fix
File: `src/vector/adapters/cloudflare-vectorize.ts`
Commit: `e8131761 fix(vectorize): use /info endpoint for accurate vector count in getStats`

CF Vectorize v2 index `GET` returns metadata only (no `vectorCount`). The `/info` sub-endpoint exposes it. Without this patch, vector count shows 0 in health/stats.

## Post-Update Expected State

After reset to Soul-Brews upstream alpha + restart:
- `version`: `26.7.26-alpha.227` (or newer)
- `oracle`: `connected`
- `db`: `connected`, `fts`: healthy (24k+ docs)
- `vectorStatus`: `degraded` — **this is EXPECTED** — ollama embedder not configured locally; CF Vectorize still serves vectors via its own pipeline. FTS5 fallback active for real-time embedding.
- `mcpToolCount`: 32 tools
- `pluginCount`: 11 plugins

`vectorStatus: degraded` ≠ vector search broken. CF Vectorize collections show `connectionStatus: connected` — cloud-side vectors still work.

## Hermes Support (coming)

Branch `copilot/add-hermes-agent-support` in `Soul-Brews-Studio/arra-oracle-skills-cli`:
- `d6e137f feat: add Hermes Agent as supported install target`

Will enable: `oracle-skills install <skill-name>` targeting Hermes profiles directly, same as it works for Claude Code / Codex / Cursor today.
