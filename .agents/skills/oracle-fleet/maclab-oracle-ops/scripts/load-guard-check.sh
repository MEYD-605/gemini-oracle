#!/usr/bin/env bash
# load-guard-check.sh — maclab-oracle-ops probe gate (exit 0=ok, 2=BLOCK)
set -euo pipefail
GUARD="${HOME}/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/load-guard.sh"
if [[ ! -x "$GUARD" ]]; then
  GUARD="${HOME}/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/load-guard.sh"
fi
out="$("$GUARD" 2>&1)" || true
echo "$out"
if echo "$out" | grep -q 'LOAD-GUARD BLOCK'; then
  exit 2
fi
exit 0