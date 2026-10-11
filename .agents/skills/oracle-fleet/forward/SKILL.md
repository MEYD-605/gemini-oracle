---
installer: arra-oracle-skills-cli v26.5.16
origin: Nat Weerawan's brain, digitized — how one human works with AI, captured as code — Soul Brews Studio
name: forward
description: 'Use when user says "forward" / "handoff" / "wrap up" / before ending session — create cross-node handoff in ψ/inbox/handoff/ + next-session plan. [standard] v26.5.16 L-SKLL'
argument-hint: "[asap | --only]"
---

# /forward - Handoff to Next Session

Create context for next session, then show the plan for what comes next.

## Why this still exists on Hermes

Hermes already keeps history: `/new` does **not** delete anything (state.db
holds 200+ sessions, `archived=0`), and `session_search` does FTS5 recall.
So `/forward` is **NOT** needed to avoid amnesia inside this seat.

It IS still needed for **one** reason: `ψ/inbox/handoff/*.md` is the only
cross-node artifact. `state.db` belongs to this maclab seat alone — no1, no4,
no5, note20, bigboy-vps cannot read it. The handoff markdown is the fleet
contract, and it is committed by the nightly `ψ/` git-sweep so peers see it.

**Rule of thumb**
- Context pressure only, work stays local → `/compress here 10`, skip /forward
- Anything a peer node must pick up, or end of a real work block → `/forward`

## Usage

```
/forward              # Create handoff, show plan
/forward asap         # Create handoff, skip plan (closing fast)
/forward --only       # Create handoff only
```

## Steps

1. **Git status**: Check uncommitted work
2. **Detect session**: Current session ID for traceability
3. **Session summary**: What we did (from memory)
4. **Pending items**: What's left
5. **Next steps**: Specific actions

### Session Detection (Hermes — state.db)

gmgrok runs on **Hermes**, not Claude Code. There is no
`~/.claude/projects/*.jsonl` for this repo (verified empty) — session state
lives in `$HERMES_HOME/state.db`. Use the bundled helper:

```bash
/usr/bin/python3 "$HOME/.hermes-gmgrok/skills/oracle-fleet/forward/scripts/session-id.py" \
  --cwd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
```

Include in handoff header if it prints anything:
```markdown
📡 SESSION: be9fd26d | session title | msgs=207 | cc/claude-opus-5
```
Skip silently if it prints nothing (exit 0 always — never blocks /forward).

## Output

Resolve vault path first:
```bash
ORACLE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -n "$ORACLE_ROOT" ] && [ -f "$ORACLE_ROOT/CLAUDE.md" ] && { [ -d "$ORACLE_ROOT/ψ" ] || [ -L "$ORACLE_ROOT/ψ" ]; }; then
  PSI=$(readlink -f "$ORACLE_ROOT/ψ" 2>/dev/null || echo "$ORACLE_ROOT/ψ")
else
  PSI=$(readlink -f ψ 2>/dev/null || echo "ψ")
fi
```

Write to: `$PSI/inbox/handoff/YYYY-MM-DD_HH-MM_slug.md`

**IMPORTANT**: Always use the resolved `$PSI` path, never the `ψ/` symlink directly.
This ensures handoffs go to the project's vault (wherever ψ points).

**Do NOT `git add` / commit vault files.** On gmgrok-oracle `ψ/` IS tracked
(5,743 files) but a nightly `auto: nightly git-sweep ψ/ save` cron owns those
commits — manual commits race the sweep. Write the file and stop.

```markdown
# Handoff: [Session Focus]

**Date**: YYYY-MM-DD HH:MM
**Context**: [%]

## What We Did
- [Accomplishment 1]
- [Accomplishment 2]

## Pending
- [ ] Item 1
- [ ] Item 2

## Next Session
- [ ] Specific action 1
- [ ] Specific action 2

## Key Files
- [Important file 1]
- [Important file 2]
```

### Confirm handoff write (announce-mode — absolute paths required)

# announce-mode → absolute path (no ψ/, no ~/, no $VAR, no ...).
# Use:  echo "marker: $RESOLVED_PATH"  — bash substitutes. See CONVENTIONS.md.

```bash
HANDOFF_FILE="$PSI/inbox/handoff/$(date +%Y-%m-%d_%H-%M)_${SLUG}.md"
echo "📤 Handoff: $HANDOFF_FILE"
```

## Then: Create Issues from Pending Items

After writing the handoff file, extract actionable items and offer to create GitHub issues.

### Step 1: Extract Items

From the handoff you just wrote, collect all `- [ ]` items from **Pending** and **Next Session** sections.

### Step 2: Filter Actionable Items

Skip items that are NOT actionable:
- Items containing "monitor", "watch", "track", "deferred", "maybe", "consider"
- Items that are vague (less than 4 words after the checkbox)

### Step 3: Check for Duplicates

```bash
# For each item, check if an issue already exists with a similar title
gh issue list --state open --search "ITEM_TITLE" --json title --jq '.[].title' 2>/dev/null
```

Skip items that already have a matching open issue (case-insensitive title match).

### Step 4: Show and Confirm

Display the list of new issues to create:

```
📋 Create GitHub issues from pending items?

  1. Fix awaken git push auth
  2. /rrr --deep time-based

Create these 2 issues? [y/N]
```

**NEVER auto-create issues without user approval.**

If user declines, skip issue creation and continue to the plan section.

### Step 5: Create Issues

If user approves:

```bash
# Detect repo for issue creation
REMOTE=$(git remote get-url origin 2>/dev/null)
# Extract owner/repo from remote URL
REPO=$(echo "$REMOTE" | sed -E 's|.*[:/]([^/]+/[^/]+?)(\.git)?$|\1|')

# For each actionable item:
gh issue create --repo "$REPO" --title "ITEM_TITLE" --body "From /forward handoff on YYYY-MM-DD"
```

Show results:
```
Created #115: Fix awaken git push auth
Created #116: /rrr --deep time-based
```

### Step 6: Write to Outbox

Regardless of whether issues were created, write items to the outbox:

```bash
ORACLE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -n "$ORACLE_ROOT" ] && [ -f "$ORACLE_ROOT/CLAUDE.md" ] && { [ -d "$ORACLE_ROOT/ψ" ] || [ -L "$ORACLE_ROOT/ψ" ]; }; then
  PSI=$(readlink -f "$ORACLE_ROOT/ψ" 2>/dev/null || echo "$ORACLE_ROOT/ψ")
else
  PSI=$(readlink -f ψ 2>/dev/null || echo "ψ")
fi
OUTBOX_DIR="$PSI/outbox"
mkdir -p "$OUTBOX_DIR"
```

Write to: `$PSI/outbox/YYYY-MM-DD_pending.md`

```markdown
# Pending Items — YYYY-MM-DD

## From: [repo-name] /forward

- [ ] Item 1 (issue #115)
- [ ] Item 2 (issue #116)
- [ ] Item 3 (no issue — skipped: vague)
```

### Confirm outbox write (announce-mode — absolute paths required)

# announce-mode → absolute path (no ψ/, no ~/, no $VAR, no ...).
# Use:  echo "marker: $RESOLVED_PATH"  — bash substitutes. See CONVENTIONS.md.

```bash
OUTBOX_FILE="$OUTBOX_DIR/$(date +%Y-%m-%d)_pending.md"
echo "📋 Outbox: $OUTBOX_FILE"
```

### Silent Failures

- If `gh` is not available: write to outbox only, skip issue creation silently
- If repo has no GitHub remote: skip issue creation silently, write to outbox only
- If `gh auth status` fails: skip issue creation silently, write to outbox only

---

## Then: Show the Next-Session Plan (Hermes — no plan mode)

**`EnterPlanMode` / `ExitPlanMode` DO NOT EXIST on Hermes.** They are Claude
Code tools; on this seat they resolve to "currently unavailable". Any older
instruction to call them is dead — ignore it.

On Hermes, print the plan **directly in the reply**. That IS the approval
surface: Bo reads it and answers in chat.

**Do NOT commit the handoff file yourself** — `ψ/` is tracked, but a nightly
`auto: nightly git-sweep ψ/ save` cron commits it. Manual commits race the sweep.

First gather cleanup context:

```bash
git status --short
git branch --list | grep -v '^\* main$' | grep -v '^  main$'
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title) (\(.headRefName))"' 2>/dev/null
gh issue list --state open --limit 5 --json number,title --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null
```

Then print:
- What we accomplished this session
- Pending items carried forward
- Cleanup needed (stale branches, open PRs, uncommitted files)
- Next session goals and scope
- Absolute path to the handoff file
- **Always end with the choice table:**

```markdown
## Next Session: Pick Your Path

| Option | Command | What It Does |
|--------|---------|--------------|
| **Keep going, trim context** | `/compress here 10` | Stay in session, keep last 10 turns |
| **Continue fresh** | `/new` then `/recap` | New session ID; history stays in state.db |
| **Reopen an old thread** | `/sessions` or `/resume <name>` | Browse / resume by name |

### Cleanup Checklist (if any)
- [ ] [Open PR to merge]
- [ ] [Stale branch to delete]
- [ ] [Issue to close]
- [ ] [Uncommitted work to commit or stash]
```

If user calls `/forward` again — just re-show the plan, do not re-create the handoff file.

## Wizard v2 Context in Handoff

If CLAUDE.md contains demographics from `/awaken` wizard v2, include in handoff:

```markdown
## Context
**Oracle**: [name] ([pronouns]) | **Human**: [name] ([pronouns])
**Mode**: [Fast/Full Soul Sync] | **Memory**: [auto/manual]
**Team**: [solo/team context]
```

This helps the next session orient faster. If demographics not present, skip.

---

## ASAP Mode

If user says `/forward asap` or `/forward now`:
- Write handoff file
- Skip the plan section
- Do NOT commit — the nightly `ψ/` git-sweep cron handles it
- User wants to close fast

## Skip the Plan Section

If user says `/forward --only`:
- Skip the plan section
- Just tell user: "💡 handoff written — `/compress here 10` to keep going, or `/new` for a fresh session"

ARGUMENTS: $ARGUMENTS
