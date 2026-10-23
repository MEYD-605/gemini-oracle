#!/bin/bash
# arra-bridge-probe.sh [bearer-file] — exit 0 iff the HAOS arra-memory add-on accepts that bearer (MCP initialize → 200).
# Default file = No.6 private bridge's token. Built because the 401 on agy seats (10-21 22:48 → 10-22) went unseen for ~14 h.
f="${1:-/Users/admin/.no6-home/arra-memory/arra-bearer.txt}"
tok=$(tr -d '[:space:]' < "$f" | sed 's/^Bearer//I')
code=$(curl -s -m 10 -o /dev/null -w '%{http_code}' -X POST http://100.83.0.1:8099/mcp \
  -H "Authorization: Bearer $tok" -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}')
echo "arra-memory initialize with $(basename "$f"): HTTP $code"
[ "$code" = 200 ]
