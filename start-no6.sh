#!/bin/bash
# No.6 Gemini — Launch via Antigravity (agy) CLI directly
set -euo pipefail

cd /Users/admin/Code/github.com/MEYD-605/gemini-oracle

export HOME=/Users/admin/.no6-home
export PATH="/Users/admin/.local/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"
export DISCORD_STATE_DIR="/Users/admin/.claude/channels/discord-no6"

mkdir -p /Users/admin/.no6-home/.gemini

# D-045 (10-18 09:33): desired-state.yaml decides (label → slug via AGY_MODELS);
# gemini-3.8-flash-high below is the fallback if the yaml can't be read — logged, never silent.
# /usr/local/bin/python3: /usr/bin/python3 has no yaml module.
FALLBACK_MODEL="gemini-3.8-flash-high"
AGY_MODEL="$(/usr/local/bin/python3 /Users/admin/Code/github.com/MEYD-605/lord-knight-oracle/ψ/tools/fleet-model-get.py No.6 --slug 2>/dev/null || true)"
if [[ -z "$AGY_MODEL" ]]; then
  AGY_MODEL="$FALLBACK_MODEL"
  echo "$(date '+%F %T') No.6 yaml unreadable → using launcher fallback '$FALLBACK_MODEL'" >> /Users/admin/.maw/fleet-model-drift.log
fi

exec /Users/admin/.local/bin/agy \
  --model "$AGY_MODEL" \
  --dangerously-skip-permissions \
  --add-dir /Users/admin/Code/github.com/MEYD-605/gemini-oracle \
  --add-dir /Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ
