#!/bin/bash
# No.6 Gemini — Launch via Antigravity (agy) CLI directly
set -euo pipefail

cd /Users/admin/Code/github.com/MEYD-605/gemini-oracle

export HOME=/Users/admin/.no6-home
export PATH="/Users/admin/.local/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"
export DISCORD_STATE_DIR="/Users/admin/.claude/channels/discord-no6"

mkdir -p /Users/admin/.no6-home/.gemini

exec /Users/admin/.local/bin/agy \
  --model gemini-3.7-flash-high \
  --dangerously-skip-permissions \
  --add-dir /Users/admin/.no6-home/.gemini \
  --add-dir /Users/admin/Code/github.com/MEYD-605/gemini-oracle \
  --add-dir /Users/admin/Code/github.com/MEYD-605/gemini-oracle/ψ
