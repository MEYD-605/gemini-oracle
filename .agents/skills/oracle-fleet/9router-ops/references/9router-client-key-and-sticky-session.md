# 9Router Client Key & Discord Session Model Binding Triage

## 1. 9Router Local API Key Invalid (`invalid_api_key`)
### Symptom
Hermes CLI or Gateway fails to communicate with local 9Router (`http://127.0.0.1:20128/v1`), returning:
```json
{"error":{"message":"Invalid API key","type":"authentication_error","code":"invalid_api_key"}}
```

### Root Cause
The `api_key` configured in `~/.hermes-noX/config.yaml` under `providers.9router.api_key` is expired, revoked, or truncated.

### Diagnostic & Fix
1. Query active client API keys stored in 9Router's SQLite database:
   ```bash
   sqlite3 -readonly /Users/admin/.9router/db/data.sqlite "SELECT id, name, key, isActive FROM apiKeys WHERE isActive=1;"
   ```
2. Verify connectivity with the candidate key:
   ```bash
   curl -s http://127.0.0.1:20128/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <VALID_KEY>" \
     -d '{"model": "cc/claude-fable-5", "messages": [{"role": "user", "content": "ping"}], "max_tokens": 10}'
   ```
3. Update `config.yaml` in the relevant Hermes seat directory (`~/.hermes-noX/config.yaml`) with the active key.

---

## 2. Discord DM Sticky Session Model
### Symptom
A seat's global config has been updated to a new model (e.g. `cc/claude-fable-5`), but incoming Discord messages are still answered by an old model (e.g. `ag/gemini-3.7-flash-high`).

### Root Cause
Hermes Gateway binds the session model at conversation initialization and records it in `state.db` (`sessions.model`). Existing active Discord DM sessions continue using their initial model until explicitly reset.

### Verification & Resolution
1. Inspect session model binding in `state.db`:
   ```bash
   sqlite3 -readonly ~/.hermes-noX/state.db "SELECT id, session_key, model, datetime(started_at, 'unixepoch', 'localtime') FROM sessions ORDER BY started_at DESC LIMIT 5;"
   ```
2. Reset the session in Discord by sending `/reset` or allowing the session inactivity timeout to recycle the session.
