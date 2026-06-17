---
title: Bud an agy/Antigravity (Gemini) Oracle on a remote Mac with Discord (Rdda patter
tags: [agy, antigravity, discord, bud, macos, relay, keychain, gemini]
created: 2026-06-03
source: No.1 Lord Knight — Rdda bud on Muk's iMac
---

# Bud an agy/Antigravity (Gemini) Oracle on a remote Mac with Discord (Rdda patter

Bud an agy/Antigravity (Gemini) Oracle on a remote Mac with Discord (Rdda pattern, 2026-06-03): (1) install agy via 'curl -fsSL https://antigravity.google/cli/install.sh | bash' → ~/.local/bin/agy (command is 'agy' not 'antigravity'; standalone Go binary, no node). (2) agy AUTH is GUI-session/keychain-bound on macOS — agy launched via SSH NEVER authenticates; only from the user's GUI Terminal. Persistent agy must start from GUI session (LaunchAgent gui domain, or user runs launcher). (3) agy does NOT auto-deliver inbound Discord DMs like the claude harness — needs a RELAY that polls Discord REST API for allowlisted senders and injects into agy's tmux via 'tmux send-keys' (same as no6-discord-relay.py; channels gate on @mention). (4) Discord MCP = bun running claude-plugins-official/discord plugin in ~/.gemini/config/mcp_config.json + DISCORD_STATE_DIR/.env(token chmod600)+access.json. (5) macOS system python3 urllib fails Discord TLS — use ssl unverified context or certifi. (6) Orphan discord plugins reparent to launchd ppid=1, keep the same bot token connected = gateway conflict; kill them.

---
*Added via Oracle Learn*
