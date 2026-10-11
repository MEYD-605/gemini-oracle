# maclab dig-run preference

Use this when the user asks for `/dig deep`, their own timeline, or a merged view across Claude / Grok / Hermes / Discord sessions.

## Preferred miner

- `~/.grok/skills/dig/scripts/dig-run.sh` is the unified miner.
- Plain `dig.py` only covers Claude project sessions.
- Include Hermes with `HERMES_HOME=~/.hermes-no5` when the question is about the full maclab timeline.

## Practical rule

- Use the unified miner for broad session discovery or cross-engine timeline questions.
- Use raw `session_search` only for targeted Hermes history lookups when the user wants one thread or one topic.

## Output shape

Keep the final summary short:
- top sessions / timestamps
- which engine(s) they came from
- one-line takeaway
