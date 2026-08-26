#!/bin/bash
# No.6 Gemini — Antigravity (ag/gemini-3.7-flash-high) via 9router
set -euo pipefail

export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

DISCORD_STATE_DIR="$HOME/.claude/channels/discord-no6"
CLAUDE_CONFIG_DIR="$HOME/.claude-no6"
KEY_FILE="$HOME/.claude/channels/discord-no1/9router-key"
REPO="/Users/admin/Code/github.com/MEYD-605/gemini-oracle"

export ANTHROPIC_BASE_URL="http://127.0.0.1:20128/v1"
export ANTHROPIC_API_KEY="$(cat "$KEY_FILE")"
export ANTHROPIC_DEFAULT_MODEL="ag/gemini-3.7-flash-high"
export FLEET_AGENT_NAME="06-gemini"
export CLAUDE_CONFIG_DIR
export DISCORD_STATE_DIR

mkdir -p "$CLAUDE_CONFIG_DIR" "$DISCORD_STATE_DIR"
if [[ ! -e "$CLAUDE_CONFIG_DIR/skills" && -d "$HOME/.claude/skills" ]]; then
  ln -s "$HOME/.claude/skills" "$CLAUDE_CONFIG_DIR/skills"
fi

cd "$REPO"

LOCK_FILE="$DISCORD_STATE_DIR/.no6.lock"
if [[ -f "$LOCK_FILE" ]] && kill -0 "$(cat "$LOCK_FILE")" 2>/dev/null; then
  echo "No.6 already running as pid $(cat "$LOCK_FILE") — refusing duplicate." >&2
  exit 1
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

claude --dangerously-skip-permissions \
       --name "No.6 Gemini" \
       --channels plugin:discord@claude-plugins-official
