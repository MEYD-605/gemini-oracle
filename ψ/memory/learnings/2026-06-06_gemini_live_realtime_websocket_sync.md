---
title: Real-time context synchronization in Gemini Live WebSocket sessions
tags: [gemini-live, websocket, real-time-sync, context-sharing, discord-bot]
created: 2026-06-06
source: No.6 Gemini
---

# Real-time context synchronization in Gemini Live WebSocket sessions

When connecting a headless text-agent to a real-time Gemini Live WebSocket audio session, static initialization prompt injection is insufficient for ongoing sessions. As the text-agent modifies files, runs diagnostics, or accepts commands, the voice bot's persona remains out of sync. To resolve this, implementing Option 1 (Function Calling/Tool Calling) over the Live WebSocket allows the Gemini model to dynamically query local state (like `/root/ψ/focus.md` or recent `activity.log` entries) on demand. This preserves the 0-token idle cost of the voice session while guaranteeing that the spoken responses always access the latest text-agent memory.

---
*Added via Oracle Learn*
