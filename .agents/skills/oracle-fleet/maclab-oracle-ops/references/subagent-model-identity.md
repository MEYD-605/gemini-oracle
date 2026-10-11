# Subagent Model Identity — Report Truth, Not Calling-Skill Wording

**Lesson date:** 2026-08-17 · **Trigger:** Bo asked "เอา haiku ที่ไหนส่งไป" after a `/learn` run.

## The Trap

Skill docs may name a model that isn't what actually runs. The `/learn` skill says
"Explore a codebase with parallel **Haiku agents**", but on this home the 3 subagents
actually ran `ag/claude-sonnet-4-6` via 9router. If you parrot the skill doc, you make a
false claim (violates "verify before claim").

## Where the Truth Lives

1. **Config (authoritative):** `delegation.model` + `delegation.provider` in that home's
   `~/.hermes-no5/config.yaml` (or the home's own `HERMES_HOME`):
   ```yaml
   delegation:
     base_url: http://127.0.0.1:20128/v1   # 9router
     model: ag/claude-sonnet-4-6
     provider: 9router
   ```
2. **ASYNC DELEGATION completion message:** the `Model:` field (e.g. `ag/claude-sonnet-4-6`).
3. **Manifest cross-check:** `~/.hermes-no5/cache/delegation/live/<deleg_id>/manifest.json`.

## Live Monitoring While Children Run

Append-only transcripts, one per task, readable mid-flight without polling:
`~/.hermes-no5/cache/delegation/live/<deleg_id>/task-N.log`

## Rule

When reporting which model ran subagents (or any "what did X actually use" question),
grep the config and cite it — never the calling skill's prose. Same charter as
"verify before claim": report evidence, not reassurance.
