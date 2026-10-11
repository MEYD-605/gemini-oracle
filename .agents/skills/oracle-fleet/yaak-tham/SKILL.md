---
name: yaak-tham
display: อยากถาม
description: "Surface EVERYTHING Nat worked on today — across all sessions, repos, vault writes, commits, Discord. Use when user says 'อยากถาม', 'อยากดูทั้งหมด', 'what did we do today', 'show me today', 'what's the state', or when curiosity strikes mid-day."
triggers:
  - อยากถาม
  - อยากดู
  - what did we do today
  - show me today
  - today's state
  - where are we today
---

# /อยากถาม (yaak-tham) — "I Want to Ask"

> *"When the question is 'what have we been doing?', the answer should already be ready."*

Sibling of `/huginn`. Where Huginn flies **hourly** to capture a sliding window, **อยากถาม** sweeps the **whole day** in one shot — fired by Nat's curiosity, not the clock.

## Personality

อยากถาม is **conversational, not bureaucratic**. Reply like you're catching Nat up over coffee, not filing a status report. It's the moment of "wait, what did I actually do today?" — the answer should land warm and complete.

| Huginn | อยากถาม |
|---|---|
| hourly auto-fire | on-demand, human-typed |
| sliding window (1h, 3h) | whole day (00:00 → now) |
| structured panel (Shape B) | flowing summary + concrete artifacts |
| dispassionate (raven) | curious + warm (Nat asked) |

## CLI Guide

```
/yaak-tham                                # today, all topics, all repos
/yaak-tham <topic>                        # filter to a topic (free-text keyword)
/yaak-tham maw team                       # ← who worked on maw team today
/yaak-tham vector                         # ← anyone touching vector DB code
/yaak-tham discord                        # ← all Discord-related activity
/yaak-tham --yesterday                    # yesterday's whole day
/yaak-tham <topic> --yesterday            # topic-scoped, yesterday
/yaak-tham --since 6h                     # last 6 hours
/yaak-tham --repo <name>                  # scope to one repo (path filter)
/yaak-tham --oracle <name>                # scope to one oracle (slug filter)
/yaak-tham --themes-only                  # 3-line theme digest, no artifact list
/yaak-tham --thai                         # respond in Thai (default: bilingual)
/yaak-tham --who-best <topic>             # explicit "who is best at <topic>" — alias
                                          #   of /yaak-tham <topic> but forces the
                                          #   ranking section in output
```

### Topic argument — how filtering works

When a positional `<topic>` is provided (one or more words after the skill name, before any `--` flags), `/yaak-tham` filters every signal source by that keyword (case-insensitive, substring match unless quoted-exact):

1. **Sessions**: only jsonl entries whose content matches the topic
2. **Git commits**: only commits whose subject OR touched-file-paths match
3. **Vault writes**: only files mentioning the topic (text grep)
4. **Discord** (if up): only messages containing the topic

Then the OUTPUT shifts shape: instead of "3-5 themes about the whole day", it becomes a focused **2-axis ranking** (volume + velocity) showing **who's best at the topic today**, with concrete artifacts grouped by oracle.

Multi-word topics: `/yaak-tham maw team` → keyword = `maw team` (substring); `/yaak-tham "exact phrase"` → exact-match.

## Inputs to gather

For the window (default: today 00:00 → now in +07):

### 1. Sessions across all panes (Sleipnir-style)

```bash
find ~/.claude/projects -name "*.jsonl" -newermt "$(date +%Y-%m-%d)" 2>/dev/null
```

For each jsonl in window: extract Nat-typed messages (skip skill-body auto-fires, system reminders, tool results). Group by oracle slug.

### 2. Git commits across /opt/Code

```bash
find /opt/Code -maxdepth 4 -name ".git" -type d 2>/dev/null | while read g; do
  repo=$(dirname "$g")
  git -C "$repo" log --all --since="midnight" --pretty='%ai|%h|%an|%s' 2>/dev/null
done
```

Group by repo. Surface commit count + headline messages.

### 3. Vault writes today

```bash
find /opt/Code/github.com/Soul-Brews-Studio/*/ψ /opt/Code/github.com/laris-co/*/ψ \
  -type f -newermt "$(date +%Y-%m-%d)" \
  -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null
```

Notable: ψ/ralph/* (new wikis), ψ/memory/learnings/, ψ/memory/retrospectives/, ψ/inbox/.

### 4. Discord activity (if MCP reachable)

If `mcp__plugin_discord_discord__*` tools are loaded, fetch today's messages from priority channels (#nat-s-preps, #timeline, #huggin). Tally Nat-typed messages + bot replies.

If MCP disconnected: skip silently, note in friction.

### 5. Cron + scheduled fires

```bash
maw schedule logs huginn -n 24 2>&1
maw schedule logs sleipnir-6h -n 8 2>&1
```

Did cron fire successfully? Were any flights missed?

## Output shape

Default mode is **conversational + structured**. Open with prose, then 3-5 themes, then concrete artifacts table, then open threads. No bureaucratic frontmatter inside the reply — that's for the saved file only.

### Saved file

Path:
- default (no topic): `ψ/memory/yaak-tham/YYYY-MM-DD/HHMM_today.md`
- topic-scoped: `ψ/memory/yaak-tham/YYYY-MM-DD/HHMM_<topic-slug>.md`
  (slug = topic lowercased, spaces → `-`, special chars stripped)
  e.g. `/yaak-tham maw team` → `1735_maw-team.md`

```markdown
---
yaak-tham: daily
date: YYYY-MM-DD
asked_at: HH:MM
scope: today | yesterday | since-Nh
oracles_touched: [list]
repos_touched: [list]
commits: N
vault_writes: N
discord_msgs: N (or null if MCP off)
---

# อยากถาม — YYYY-MM-DD asked at HH:MM

> [one-line warm summary: "วันนี้ Nat ทำเรื่อง X, Y, Z" / "Today you worked on..."]

## Themes (3-5)

1. [theme name] — [1-2 line description]
2. [...]

## Concrete artifacts

| Type | What | Where |
|---|---|---|
| commit | <subject> | <repo>/<sha> |
| PR | #<num> <title> | <url> |
| wiki | <title> | ψ/ralph/<file>.md |
| retro | <slug> | ψ/memory/retrospectives/<file>.md |
| learning | <pattern> | ψ/memory/learnings/<file>.md |
| memory | <name> | ~/.claude/projects/<...>/memory/<file>.md |

## Open threads

- [ ] [thread] (since HH:MM)
- [ ] [...]

## Cross-pane heat (Sleipnir-flavor)

[which oracles had most typed activity today, what they're stuck on]

## Friction

[reachability of each signal source — file/git/sessions/Discord/maw]
**Score**: 0.0-1.0
```

### Live reply (Discord/CLI)

Conversational opener (1-3 sentences), then markdown structure. Match the user's language (Thai → reply in Thai, English → English, mixed → mixed). Use inline backticks for `paths`, `commit-shas`, `oracle-names`.

## Step-by-step

### Step 1 — date detection

```bash
TODAY=$(date +%Y-%m-%d)
NOW=$(date +%H:%M)
WINDOW_START="$TODAY 00:00:00"
```

If `--yesterday`: `TODAY=$(date -v-1d +%Y-%m-%d)` and use 00:00 → 23:59 of that day.

If `--since Nh`: compute back from now.

### Step 2 — parallel scan (one process, threaded)

Run sessions + git + vault scans in parallel (Python threading or just `&`-backgrounded shells). Avoid spawning subagents — for daily scope, single-process scan is sufficient. (Same rule as `/huginn`: file scans don't need /team-agents.)

### Step 3 — synthesize themes

Cluster commits + sessions + vault writes by topic. Heuristics:
- repos with 10+ commits → likely a major theme
- vault writes with shared frontmatter tags → topic cluster
- session events naming the same oracle → that oracle's day-arc

Pick 3-5 themes. Name them in Nat's voice (project names, not generic descriptions).

### Step 4 — write file + reply

Write to `ψ/memory/yaak-tham/$TODAY/$(date +%H%M)_today.md`. Then echo the conversational reply.

### Step 5 — Discord (best-effort)

If Discord MCP reachable AND user invoked from Discord channel: post conversational version. Otherwise skip silently.

## Examples

### `อยากถาม` (default, today)

```
นัทถามตอนนี้ว่าวันนี้ทำอะไรไปบ้าง — รวมเร็วๆ:

วันนี้คุณวิ่ง 3 เรื่องใหญ่ขนานกัน:
1. maw-rs port — 131 commits ในวันนี้ (Codex paired) ทำ coverage gate ก่อนขยาย port slices
2. maw-js coverage push — 88 commits ปิด gap ก่อน 100% ship
3. digger workstreams — spawn 3 worktrees ใหม่ (maw-team-mesh, buddy-team, cc-workshop-skills)

Concrete artifacts:
| ... |

Open: thor handoff (ralph #52), cron PATH ยังบล็อก
```

### `/อยากถาม --themes-only`

```
3 lanes today:
- maw-rs: Rust port coverage discipline (131 commits)
- maw-js: alpha → 100% coverage gate (88 commits)
- digger: 3 new worktrees + team-tile.ts
```

### `/อยากถาม --yesterday`

Same shape, scoped to yesterday's whole day. Useful as a morning "what was the last thing I touched before sleep" check.

### `/yaak-tham maw team` (topic-scoped)

When a topic is given, output shifts from "3-5 themes of the day" to "who's best at the topic today" — 2-axis ranking (sessions volume + git velocity) + concrete artifacts grouped by oracle.

```
อยากถาม "maw team" — 2026-05-21 17:35

วันนี้ทีมเรื่อง maw team เคลื่อนหนัก — mawjs-oracle ทำเยอะที่สุด
(132 events) ตามด้วย digger-oracle (46 events).

SESSIONS (typed events mentioning "team")
  mawjs-oracle        132  ← #1
  digger-oracle        46
  subagents             3
  odin-oracle           3
  mawui-oracle          2

GIT (commits touching team* files)
  maw-js          5 commits   (XDG state migration)
  digger-oracle   1 commit    (team-tile.ts)

Verdict: mawjs-oracle เก่งสุดวันนี้ (Codex-paired).
Digger ทำของแปลกใหม่ — spawn worktrees มาทดลอง pattern.
```

### `/yaak-tham --who-best <topic>` (explicit ranking)

Alias of `/yaak-tham <topic>` that forces the ranking section even when activity is low. Useful for "who SHOULD I ask about X" routing decisions.

## Anti-rationalization

Before saving the file, scan your draft:

| Excuse | Reality |
|---|---|
| "Quiet day, not much to report" | Did you actually scan? Every typed message + commit + vault write counts. |
| "I can't see Discord today" | Note it explicitly under friction. Don't pretend you scanned what you couldn't. |
| "These themes overlap" | Good — that's the actual shape of the day. Don't force them apart. |

If the day was genuinely quiet (no sessions, no commits, no vault), say "อยากถาม — แต่วันนี้เงียบจริงๆ" explicitly. Don't fabricate.

## Mechanism notes

- Same source data as `/huginn` and `/sleipnir`, just daily-scoped + conversational
- Does NOT use /team-agents fan-out (per `feedback_huginn_no_subagents`)
- Reuses `maw peek` / `maw capture` for cross-pane reads (per `feedback_use_maw_peek_not_raw_tmux`)
- Splits 👤 Nat-typed from 🤖 AI auto-activity (per `feedback_huginn_split_human_ai`) — but inside one prose paragraph, not two separate sections
- If Discord MCP is up and Nat asked from Discord, posts iter-5 Shape B summary back to the channel — but FILE WRITE IS REQUIRED, Discord is best-effort (per `feedback_discord_code_blocks` lessons)

## When to fire

| Trigger | What to do |
|---|---|
| Nat types "อยากถาม" or `/yaak-tham` alone | run with defaults (today) |
| "อยากถามเรื่อง X" / `/yaak-tham X` | topic-scoped (X = positional arg) |
| "อยากถามว่าใครเก่ง X" / "who's best at X today" | topic-scoped, force ranking section |
| "อยากดูทั้งหมด" / "show me today" / "what have we done" | run with defaults |
| Morning standup | suggest `/yaak-tham --yesterday` to recap |
| Mid-day "where are we?" | run with defaults; same as `/recap --now` but day-scoped |
| "who should I ask about X?" | run `/yaak-tham --who-best X` (routing decision) |

## Philosophy

Huginn flies because the clock said so. **อยากถาม fires because Nat is curious.** The two cover different rhythms: scheduled rear-mirror vs on-demand wide-angle. Both write to ψ. Both speak truth about what was actually done — never about what was planned.

> *"ของจริงคือสิ่งที่เกิดขึ้น ไม่ใช่สิ่งที่ตั้งใจ"* — the real thing is what happened, not what was intended.
