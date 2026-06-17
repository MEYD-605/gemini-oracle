---
title: Non-claude fleet agents (agy/Antigravity No.6, Hermes No.7) need SEPARATE livene
tags: [agy, antigravity, hermes, non-claude, discord, liveness, watchdog, relay]
created: 2026-06-02
source: No.6 SuperNovice Discord fix 2026-06-02
---

# Non-claude fleet agents (agy/Antigravity No.6, Hermes No.7) need SEPARATE livene

Non-claude fleet agents (agy/Antigravity No.6, Hermes No.7) need SEPARATE liveness + inbound, NOT the claude agent-watchdog (it only respawns claude — adding agy/hermes there spawns the wrong runtime over them). Pattern: (1) liveness = own cron watchdog (gemini-keepalive.sh */2, hermes-watchdog.sh */5) that respawns the native binary if dead; (2) Discord inbound: agy runs the claude discord-plugin as an MCP so it can SEND (reply tool) but does NOT auto-receive inbound to its turn like the claude harness → needs a poll-relay (poll DMs via bot REST → maw hey the agent → it replies via reply tool). When a non-claude agent goes silent on Discord, check liveness + the inbound path, don't assume offline.

---
*Added via Oracle Learn*
