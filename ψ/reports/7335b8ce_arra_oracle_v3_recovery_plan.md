# Recovery Plan for `arra-oracle-v3` (LXC/VPS Environment)

This document provides a co-plan and standard recovery procedure for `arra-oracle-v3` to help **gmtk** on the remote VPS (`bigboy-vps`).

---

## ⚠️ The Data Directory Trap (READ FIRST)
A potential point of failure is data directory mismatch:
* **The Config Default**: If no environment variables are set, `arra-oracle-v3` defaults to using `~/.arra-oracle-v2/` as its data directory.
* **The Script Helper Default**: Helper scripts like `fresh-install.sh` and `setup.sh` create and reference `~/.oracle/`.

> [!WARNING]
> If a server is running under one configuration and the indexer CLI runs under the other (without explicit variables), the databases will desynchronize, causing missing files, empty database responses, or crashes.
> 
> **Recommendation**: Always explicitly set `ORACLE_DATA_DIR` in the execution shell or service environment to prevent path desynchronization.

---

## 📋 Pre-requisites Checklist
Before executing database operations, verify the following:

1. **Ollama status & Embedding Model**:
   * Verify Ollama is active on the host: `curl http://localhost:11434`
   * Ensure the required model is pulled (default: `bge-m3` or `nomic-embed-text`):
     ```bash
     ollama pull bge-m3
     ```
2. **ψ Workspace files**:
   * Ensure that the `ψ/memory/` directory containing the markdown documents (`resonance/`, `learnings/`, `retrospectives/`) is present and fully populated.
   * Identify the absolute path to this directory (e.g. `/home/agent/workspace/` or `/home/agent/ψ/`). This is the **Source of Truth**.

---

## 🚀 Recovery Procedure (Step-by-Step)

### Step 1: Safety Backup
Before executing any destructive operations, back up the existing database directories to prevent irreversible data loss.
```bash
# Backup both potential directories
cp -r ~/.arra-oracle-v2 ~/.arra-oracle-v2.bak.$(date +%Y%m%d_%H%M%S) || true
cp -r ~/.oracle ~/.oracle.bak.$(date +%Y%m%d_%H%M%S) || true
```

### Step 2: Stop Running Processes
Ensure no active server processes hold open connections or locks on the SQLite database file.
```bash
# Kill server using stored PID or process name
kill $(cat ~/.arra-oracle-v2/oracle-http.pid 2>/dev/null) || true
pkill -f "bun src/index.ts" || true
pkill -f "bun src/server.ts" || true
pkill -f "arra-oracle-v3" || true
```

### Step 3: Clear Corrupted/Stale Databases
Since the `ψ` workspace is the Source of Truth, the SQLite and Vector databases can be safely regenerated. Removing them avoids Drizzle migration/push conflicts (e.g., the Drizzle index creation bug: *Drizzle does not use `IF NOT EXISTS` for indexes, causing push failures on schema drift*).
```bash
# Choose the target data directory (e.g., ~/.arra-oracle-v2)
export TARGET_DATA_DIR="$HOME/.arra-oracle-v2"

# Clean DB files
rm -f "$TARGET_DATA_DIR/oracle.db"
rm -f "$TARGET_DATA_DIR/vectors.db"
rm -rf "$TARGET_DATA_DIR/lancedb"
```

### Step 4: Recreate SQLite Schema
Initialize a clean SQLite schema using Drizzle's push command:
```bash
# Run db:push to recreate tables and indexes
ORACLE_DATA_DIR="$TARGET_DATA_DIR" bun run db:push
```

### Step 5: Index Document Metadata (FTS5)
Parse documents from the `ψ` folder into the SQLite database.
* Set `ORACLE_REPO_ROOT` to the directory **containing** `ψ/` (so that `$ORACLE_REPO_ROOT/ψ/memory/` is read).
* *Note*: If the indexer complains about deleting more than 50% of the database, set `ORACLE_FORCE_REINDEX=1`.

```bash
export ORACLE_REPO_ROOT="/home/agent/workspace" # Adjust this path to match target psi directory

ORACLE_DATA_DIR="$TARGET_DATA_DIR" \
ORACLE_REPO_ROOT="$ORACLE_REPO_ROOT" \
ORACLE_FORCE_REINDEX=1 \
bun run index
```

### Step 6: Generate Vector Embeddings (LanceDB)
Run the vector model indexer to generate semantic search indexes in LanceDB.
```bash
ORACLE_DATA_DIR="$TARGET_DATA_DIR" \
bun src/scripts/index-model.ts bge-m3
```

### Step 7: Verification
Ensure everything is working correctly by running tests and verifying server boot:
```bash
# Run tests
bun test

# Start the server and check status
ORACLE_DATA_DIR="$TARGET_DATA_DIR" bun run server
```

---

## 🛠️ Diagnostics & Troubleshooting
* **Error**: `Refusing to delete X/Y docs (>50%)`
  * *Reason*: The indexer is running with a repo root that has fewer/different source files than what's in the DB.
  * *Action*: Ensure `ORACLE_REPO_ROOT` points to the correct location, or force re-index using `ORACLE_FORCE_REINDEX=1`.
* **Error**: `Ollama connection refused`
  * *Action*: Check if Ollama service is running using `systemctl status ollama` or equivalent, and verify port 11434 is open.
