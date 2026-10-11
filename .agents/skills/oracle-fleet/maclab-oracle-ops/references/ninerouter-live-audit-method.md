# 9router live-config audit method (no dashboard login needed)

When Bo asks "9router มันมีอะไรให้ตั้งค่าเพิ่มอีกไหม" or "ตั้งค่าครบยัง" — audit the
**live instance** directly instead of guessing from memory or the README alone.
The dashboard requires a password login that isn't always known/available; all
of the following works without it.

## 1. Read config straight from SQLite

```bash
sqlite3 ~/.9router/db/data.sqlite \
  "SELECT provider, authType, name, priority, isActive FROM providerConnections;"
sqlite3 ~/.9router/db/data.sqlite "SELECT name, models FROM combos;"      # fallback chains — usually empty, worth flagging
sqlite3 ~/.9router/db/data.sqlite "SELECT name, isActive FROM apiKeys;"
sqlite3 ~/.9router/db/data.sqlite "SELECT * FROM _meta;"                  # schemaVersion, appVersion, totalRequestsLifetime
sqlite3 ~/.9router/db/data.sqlite "SELECT * FROM kv WHERE scope NOT LIKE 'customModels%';"  # non-model settings, usually empty
```

`combos` empty is the single most common finding — it means the core "auto
fallback across tiers" feature (the whole point of 9router) is unused; every
call goes to one provider with zero failover on quota/error.

## 2. Compare installed vs latest version

```bash
9router --version                       # installed
npm view 9router version                # latest on npm
```

The launchd plist (`~/Library/LaunchAgents/ai.hermes.9router.plist`) usually
passes `--skip-update`, which means the service will NEVER self-update — a
version gap found this way is real and requires a manual
`npm install -g 9router` + service restart, not just time passing.

## 3. Verify the auth boundary live (don't assume)

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:20128/v1/models
curl -s -o /dev/null -w "%{http_code}\n" http://<tailscale-ip>:20128/v1/models
```

Expected/sane result: loopback (`127.0.0.1`) returns `200` with no Bearer
token needed (local trust bypass); the Tailscale-mesh IP returns `401`
without a valid API key. If both return `200`, the instance is unexpectedly
open on the mesh — flag it. Confirm the dashboard password isn't the shipped
default by deliberately POSTing a wrong/well-known guess to
`/api/auth/login` and reading the error (`401 Invalid password. N attempts
left` = password already rotated off default; do NOT try to read/crack the
bcrypt hash in `settings.data`, a live failed-login probe is enough signal).

## 4. Cross-check against upstream docs for what's available but unused

Pull the current official feature list before reporting gaps, since 9router
adds providers/features between versions:

```bash
curl -s https://api.github.com/repos/decolua/9router/readme \
  | python3 -c "import json,sys,base64; print(base64.b64decode(json.load(sys.stdin)['content']).decode())"
```

Common unused-but-available items worth flagging: free-tier providers never
connected (`kr/` Kiro AI ~50 free credits/mo, `oc/` OpenCode Free, `vertex/`
$300 GCP credit/90d) as a zero-cost bottom rung for a combo; RTK Token Saver
/ Ponytail / Caveman toggle state; dead/inactive provider connections sitting
in the DB (`isActive=0` rows) that should be reconnected or removed.

**Correction (verified live 2026-08-11): `oc/` OpenCode Free is NO LONGER
zero-auth.** 9router's bundled provider registry still ships `noAuth:!0` /
`authType:"none"` for `id:"opencode"` in its build chunks, and the README
still describes it as no-signup — but a live test against
`https://opencode.ai/zen/v1/chat/completions` (bypassing 9router entirely)
returned `401 Missing API key`, and `opencode.ai/docs/zen` now states
"login to OpenCode Zen and get your API key" (still free, just not
frictionless-anonymous anymore). Adding a `providerConnections` row with
`authType='none'` for `opencode` will accept in the DB but every real call
still 401s — don't leave that connection sitting there, delete it
(`DELETE FROM providerConnections WHERE provider='opencode'`) rather than
report the provider as "connected." Kiro AI and Vertex AI were NOT
connectable via any DB/API trick either — both require **interactive human
auth** (Kiro: browser OAuth via AWS Builder ID/Google/GitHub through the
dashboard; Vertex: a GCP Service Account JSON that must be generated in
Bo's own Google Cloud console) — report these as "needs Bo to do N short
steps," don't fabricate a working connection.

## 5. Update 9router to latest (safe, tested procedure)

```bash
9router --version                                  # confirm current
npm install -g 9router@latest                      # updates the binary
# npm may warn "install scripts blocked" (allowScripts) — inspect before allowing:
cat /usr/local/lib/node_modules/9router/hooks/postinstall.js
# if it only warms up SQLite/tray runtime deps (no network/credential writes), run it directly:
node /usr/local/lib/node_modules/9router/hooks/postinstall.js
launchctl kickstart -k gui/$(id -u)/ai.hermes.9router   # restart the launchd service
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:20128/v1/models   # expect 200
sqlite3 ~/.9router/db/data.sqlite "SELECT * FROM _meta WHERE key='appVersion';"  # confirms new version took
```

Verified safe 2026-08-11 (0.5.40 → 0.5.50): provider connections and API
keys in `data.sqlite` are untouched by the binary update — only the
launchd-managed process restarts. Model count returned by `/v1/models` can
legitimately go UP after an update (new providers added upstream); that's
expected, not a bug.

## 6. Verify RTK Token Saver is actually ON — empirically, not by guessing

Don't just report "RTK should default to ON per docs, couldn't confirm via
dashboard" — it's directly measurable via an A/B token-count test, no
dashboard login needed:

```bash
# build a realistic tool_result payload (git-diff shaped — RTK's primary target)
python3 -c "
import json
diff = 'diff --git a/f b/f\n' + '\n'.join(f'+line {i}' for i in range(200))
payload = {'model':'glm/glm-5.2','messages':[
  {'role':'user','content':'Review this diff'},
  {'role':'assistant','content':'ok','tool_calls':[{'id':'c1','type':'function','function':{'name':'git_diff','arguments':'{}'}}]},
  {'role':'tool','tool_call_id':'c1','content':diff},
  {'role':'user','content':'Summarize in one word'}],'max_tokens':10}
json.dump(payload, open('/tmp/rtk-test.json','w'))
"
API_KEY=$(python3 -c "import yaml; print(yaml.safe_load(open('$HOME/.hermes-no5/config.yaml'))['providers']['9router']['api_key'])")

# A: default (RTK on if enabled)
curl -s -X POST http://127.0.0.1:20128/v1/chat/completions -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" -d @/tmp/rtk-test.json | python3 -c "import json,sys; print(json.load(sys.stdin)['usage']['prompt_tokens'])"

# B: force off
curl -s -X POST http://127.0.0.1:20128/v1/chat/completions -H "Authorization: Bearer $API_KEY" \
  -H "X-9Router-Token-Saver: off" -H "Content-Type: application/json" -d @/tmp/rtk-test.json | python3 -c "import json,sys; print(json.load(sys.stdin)['usage']['prompt_tokens'])"
```

Compare `prompt_tokens` A vs B. Verified 2026-08-11: A=2,779 vs B=5,287 —
**47.4% reduction**, confirming RTK is live and working, exceeding the
20-40% the docs claim (diff-heavy payloads are RTK's best case). This test
needs a real unmasked API key — pull it from
`~/.hermes-no5/config.yaml` → `providers.9router.api_key` (stored
unmasked there for Hermes' own use), not from the SQLite `apiKeys` table
(always masked on every read path, see the API-key-creation reference).

Full worked example (maclab, 2026-08-11): `gmforge-oracle/ψ/learn/decolua/9router/2026-08-11/1827_MACLAB-AUDIT.md`.
