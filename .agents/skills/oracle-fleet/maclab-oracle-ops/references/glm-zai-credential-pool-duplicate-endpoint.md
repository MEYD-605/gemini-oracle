# "GLM เป็นไรวะ" — duplicate credential_pool entry with a stale/wrong base_url (2026-08-12)

Symptom: Bo asks "glm เป็นไรวะ" (what's wrong with GLM) after some earlier
session activity. Direct API tests against both 9router (`/v1/chat/completions`
with model `glm/glm-5.2`) and z.ai directly return clean HTTP 200 — the model
itself is not broken. The real fault is invisible to a simple "does it answer"
test because it depends on which pooled credential entry gets tried.

## Root cause

`~/.hermes-<profile>/auth.json` → `credential_pool.zai` can hold **more than
one entry for the same underlying API key** if it was added both manually
(e.g. via `hermes auth add`) and later auto-seeded from a `.env` var
(`ZAI_API_KEY`). Entries differ by `base_url`, and priority 0 is tried first:

```json
[
  {"label": "bo-glm", "priority": 0, "base_url": "https://api.z.ai/api/paas/v4", ...},
  {"label": "ZAI_API_KEY", "priority": 1, "base_url": "https://api.z.ai/api/coding/paas/v4", ...}
]
```

`/api/paas/v4` (no `/coding/`) is the **pay-as-you-go balance** endpoint —
if that specific wallet is empty it returns `{"code":"1113","message":
"Insufficient balance or no resource package. Please recharge."}` (HTTP 429).
`/api/coding/paas/v4` is the **Coding Plan subscription** endpoint (separate
quota, unrelated to wallet balance) and is usually the one that's actually
funded. Same API key, two different backing quotas — the plaintext token is
identical, only the URL path differs.

Because priority 0 is attempted first, every call surfaces the wallet error
even though the coding-plan entry two lines down is perfectly healthy. This
reads to the user as "GLM is broken" when it's a credential-pool ordering bug.

## Diagnostic steps

1. Test the model directly against both a proxy (9router) and the raw
   provider API with the plain key — if both return 200, the model is fine;
   suspect the credential pool next, not the model or the proxy.
2. Read `~/.hermes-<profile>/auth.json` → `credential_pool.zai` (or whichever
   provider) and inspect every entry's `base_url`. Duplicate `label`s or
   near-identical `access_token` values pointing at different paths is the
   tell.
3. curl each `base_url` directly with the shared key to see which one
   actually errors (`Insufficient balance` vs a clean 200).

## Fix

Back up `auth.json`, then remove the entry with the broken/wrong `base_url`
from `credential_pool.<provider>`, keeping only the funded one:

```python
import json, shutil, time
path = '/Users/admin/.hermes-<profile>/auth.json'
shutil.copy(path, f'{path}.bak-{int(time.time())}')
with open(path) as f:
    d = json.load(f)
pool = d.get('credential_pool', {})
entries = pool.get('zai', [])
pool['zai'] = [e for e in entries if e.get('base_url') != 'https://api.z.ai/api/paas/v4']
d['credential_pool'] = pool
with open(path, 'w') as f:
    json.dump(d, f, indent=2)
```

No gateway restart needed to test via a fresh direct API call, but the
running gateway process's in-memory pool won't pick up the edit until its
next reload/restart — don't restart the gateway mid-session on a profile
that's actively serving the current conversation (it will drop the live
connection). Schedule the restart for a moment that doesn't interrupt the
user.

## Related

`providers.<provider>.detected_endpoint` (top-level, separate from
`credential_pool`) can already point at the correct URL while the pool still
has the bad duplicate — don't assume the top-level provider block agreeing
means the pool is clean; check the pool array explicitly.
