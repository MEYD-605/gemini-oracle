# Session Bloat Diagnostic Query & Log Inspection

Quick recipe for analyzing bloated agent sessions in Hermes `state.db`.

```python
import sqlite3

db_path = '/Users/admin/.hermes-no5/state.db'
session_id = '20260814_150958_43b78b17'

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Get total message count
c.execute("SELECT COUNT(*) FROM messages WHERE session_id = ?", (session_id,))
print("Total messages:", c.fetchone()[0])

# Get tool call vs user msg breakdown
c.execute("SELECT role, COUNT(*) FROM messages WHERE session_id = ? GROUP BY role", (session_id,))
print("Role breakdown:", c.fetchall())
```
