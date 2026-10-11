# High-Speed Agent Migration Scripting (The Nat Ferrying Pattern)

*Captured 2026-07-26 from live scripts on black.alchemycat.org (`forward-to-nat.sh`, `place-mawrs.sh`, `restore-place.sh`).*

## The Problem with Manual Migration
Copying an agent manually via simple `cp -r` or `rsync` leaves broken session states:
1. Session histories (`.jsonl` files in `~/.claude/projects/` or `~/.hermes/`) contain embedded working directory paths (e.g., `"cwd": "/opt/Code/..."` or `"cwd": "/home/noah-oracle/Code/..."`).
2. Directories inside `~/.claude/projects/` carry encoded root names (e.g., `-home-noah-oracle-Code-github-com-...`).
3. Running `/resume` or loading session context on the new machine fails because the agent attempts to access non-existent paths.

---

## The 4-Step High-Speed Automated Ferrying Solution

### Step 1: Parallel I/O Transfer with Low-Priority Scheduling (`rsync` + `ionice`)
Use `ionice -c3` (idle priority) to copy tens of gigabytes and tens of thousands of session files without locking up system disk I/O or freezing active services:

```bash
SRC_CODE=/home/source_user/Code
SRC_PROJ=/home/source_user/.claude/projects
DST_CODE=/home/target_user/Code
DST_PROJ=/home/target_user/.claude/projects

# Copy Git repositories gently
sudo ionice -c3 rsync -a "$SRC_CODE/" "$DST_CODE/"
```

### Step 2: Encoded-Directory Rename Loop
Claude and Hermes encode path roots in session project directory names. Automatically rewrite directory names during transfer:

```bash
OLD_PREFIX="-home-source_user-Code-"
NEW_PREFIX="-home-target_user-Code-"

# Note: Use -- with mv because project directory names start with leading dash '-'
for d in $(sudo ls -1 "$SRC_PROJ"); do
  case "$d" in
    ${OLD_PREFIX}*) nb="${NEW_PREFIX}${d#${OLD_PREFIX}}" ;;
    *)              nb="$d" ;;   # preserve foreign/archive dirs
  esac
  sudo mv -- "$SRC_PROJ/$d" "$DST_PROJ/$nb" 2>/dev/null || sudo ionice -c3 rsync -a "$SRC_PROJ/$d/" "$DST_PROJ/$nb/"
done
```

### Step 3: In-File Deep Path Rewriting via Null-Terminated `sed`
Mass-rewrite all embedded paths inside `.jsonl`, `.json`, `.md`, `.yaml`, and `.js` files using `find -print0 | xargs -0 -r sed -i`:

```bash
OLD_ROOT="/home/source_user/Code"
NEW_ROOT="/home/target_user/Code"

sudo bash -c "
  shopt -s nullglob
  for dir in $DST_PROJ/${NEW_PREFIX}*; do
    find \"\$dir\" -type f \( -name '*.jsonl' -o -name '*.json' -o -name '*.txt' -o -name '*.md' -o -name '*.yaml' \) -print0 \
      | xargs -0 -r sed -i -e 's|$OLD_ROOT/|$NEW_ROOT/|g'
  done
"
```

### Step 4: Ownership Normalization & Multi-Lock Verification
Fix ownership and verify complete migration integrity:

```bash
# Normalize permissions
sudo chown -R target_user:target_user "$DST_CODE" "$DST_PROJ"

# 6-Point Verification Gate
echo "1. Repos count:     $(find $DST_CODE/github.com -maxdepth 3 -name .git 2>/dev/null | wc -l)"
echo "2. Session JSONL:   $(find $DST_PROJ -name '*.jsonl' 2>/dev/null | wc -l)"
echo "3. Project Dirs:    $(ls -1 $DST_PROJ | wc -l)"
echo "4. Stray Old Paths: $(grep -rl "$OLD_ROOT/" $DST_PROJ/${NEW_PREFIX}* 2>/dev/null | wc -l) (must be 0)"
echo "5. Mis-owned Files: $(find $DST_PROJ $DST_CODE ! -user target_user 2>/dev/null | wc -l) (must be 0)"
echo "6. Disk Free:       $(df -h /home | tail -1 | awk '{print $4}')"
```

---

## Why This Works Instantly
- **Zero manual editing:** Automates thousands of file edits in seconds.
- **Immediate Context Resume:** `/resume` works instantly on the new machine as if the agent was born there.
- **Non-destructive:** Operates safely without destroying original source sessions.

---

## Converting Legacy CLI Agents to Hermes Agent (9router)

When converting an agent from a legacy CLI (e.g. AGY CLI / Antigravity CLI or Claude CLI) to **Hermes Agent** using 9router:

1. **Extract Auth Tokens**: Copy xAI / OAuth / Antigravity tokens (`auth.json`, `antigravity-oauth-token`, or 9router JWT) directly into `~/.hermes-<agent>/`.
2. **Configure 9router Provider**: In `~/.hermes-<agent>/config.yaml`:
   ```yaml
   model:
     provider: 9router
     model: ag/gemini-3.6-flash-high
   ```
3. **Isolate User & Environment**: Run under a dedicated Linux user (`useradd -m -s /bin/bash <agent>`) and start Hermes Gateway or daemon inside a dedicated tmux session (`MAW_SENDER=node:agent hermes gateway run`).

