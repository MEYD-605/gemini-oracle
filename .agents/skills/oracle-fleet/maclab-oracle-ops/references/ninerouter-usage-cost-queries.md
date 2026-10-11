# 9router Usage & Cost Queries (verified 2026-07-29)

## Why this exists

Bo asked "ตอนนี้เราใช้ 9router อะไรไปเท่าไหร่แล้ว" (how much have we spent on
9router so far) and later narrowed to a single model ("sonnet5 อย่างเดียว").
9router tracks every request with real token counts and cost in a local
SQLite DB — no need to guess or check a web dashboard.

## Where the data lives

```
/Users/admin/.9router/db/data.sqlite
```
(On remote host `black`: `/home/meyd/.9router/db/data.sqlite`)

Key tables (`sqlite3 /Users/admin/.9router/db/data.sqlite ".tables"`):
- `usageHistory` — one row per request: `provider`, `model`, `promptTokens`,
  `completionTokens`, `cost`, `timestamp`, `status`.
- `usageDaily` — daily rollups (JSON blob per `dateKey`), less convenient
  than querying `usageHistory` directly with `date(timestamp)`.
- `apiKeys`, `providerConnections`, `providerNodes` — routing/auth config,
  not usage data.

## Core queries

**Total spend + request count + token count (all-time):**
```bash
sqlite3 /Users/admin/.9router/db/data.sqlite "
SELECT COUNT(*) as total_requests,
       SUM(promptTokens) as total_prompt_tok,
       SUM(completionTokens) as total_completion_tok,
       SUM(cost) as total_cost,
       MIN(timestamp) as first_ts,
       MAX(timestamp) as last_ts
FROM usageHistory;"
```

**Spend broken down by provider:**
```bash
sqlite3 -header -column /Users/admin/.9router/db/data.sqlite "
SELECT provider, COUNT(*) as reqs, SUM(promptTokens+completionTokens) as tokens, SUM(cost) as cost
FROM usageHistory GROUP BY provider ORDER BY cost DESC;"
```

**Spend by day (recent trend / spot a spike day):**
```bash
sqlite3 -header -column /Users/admin/.9router/db/data.sqlite "
SELECT date(timestamp) as day, COUNT(*) as reqs, SUM(cost) as cost
FROM usageHistory GROUP BY day ORDER BY day DESC LIMIT 10;"
```

**Spend for ONE specific model (not provider — a provider can host multiple
models, e.g. `claude` provider covers both `claude-sonnet-5` and
`claude-sonnet-4-6`):**
```bash
sqlite3 -header -column /Users/admin/.9router/db/data.sqlite "
SELECT model, COUNT(*) as reqs, SUM(promptTokens+completionTokens) as tokens, SUM(cost) as cost
FROM usageHistory WHERE model LIKE '%sonnet%' GROUP BY model ORDER BY cost DESC;"
```

## Adding / Provisioning API Keys Directly in 9router SQLite

When inserting API keys directly into 9router DB without using the web UI (e.g., adding Zhipu/GLM API keys on a headless host like `black`):
- Connection records live in `providerConnections` table.
- JSON structure for `data` column:
  ```json
  {
    "apiKey": "KEY_HERE",
    "testStatus": "active",
    "providerSpecificData": {
      "connectionProxyEnabled": false,
      "connectionProxyUrl": "",
      "connectionNoProxy": ""
    },
    "lastError": null,
    "lastErrorAt": null
  }
  ```
- Important: Launching 9router via background shell script requires using `--tray` or `--no-browser` flags (`nohup 9router --tray > ~/.9router/logs/service.log 2>&1 &`). Running `9router` without flags in background output mode will trigger non-interactive terminal exit.

## Pitfall: provider-level rollup hides per-model cost

`GROUP BY provider` gives a coarser number than Bo may be asking for. If Bo
names a specific model ("sonnet5", "grok-4.5", "glm-5.2"), always re-query
`GROUP BY model` with a `LIKE` filter on that model name — do not just quote
the provider-level total and assume it answers the question. In this session
the `claude` provider total ($493.59) was actually the SUM of
`claude-sonnet-5` ($547.52) minus overlap accounting quirks with
`claude-sonnet-4-6` — the two numbers do not trivially match, so when Bo asks
about "one model only", always run the `model`-scoped query fresh rather than
subtracting from a provider total.

## Reporting style

Bo's DM style rule applies here too: give the headline number first (total
cost / cost for the named model), short table only if useful, not a wall of
provider internals unless asked for an audit/inventory.
