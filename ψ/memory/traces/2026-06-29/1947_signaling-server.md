---
query: "signaling server"
target: "gemini-oracle"
mode: deep
timestamp: 2026-06-29 19:47
friction_score: 0.7
coverage: [oracle, files, git]
confidence: high
---

# Trace: signaling server

**Target**: gemini-oracle
**Mode**: deep | **Friction**: 0.7 | **Confidence**: high
**Time**: 2026-06-29 19:47

## Oracle Results
- Mentioned in inbox history logs (e.g. `ψ/inbox/2026-06-20_16-48_...`) that a Cloudflare Worker signaling server was deployed on 2026-06-10 and verified live.

## Files Found
- Source code of the signaling server is located at:
  `/root/Code/github.com/the-oracle-keeps-the-human-human/phd-satellite-data/phd/dropbox/worker/src/index.ts`
- Configuration (`wrangler.toml`):
  `/root/Code/github.com/the-oracle-keeps-the-human-human/phd-satellite-data/phd/dropbox/worker/wrangler.toml`

## Details of Signalling Server
- **Deployment Name**: `phd-signaling`
- **Hosted Domain**: `phd-signaling.laris.workers.dev`
- **WS Endpoint**: `wss://phd-signaling.laris.workers.dev/ws?key=<AUTH_KEY>`
- **Tech Stack**: Cloudflare Workers, Durable Objects (`SignalingRoom` for websocket state relaying), Drizzle ORM + Cloudflare D1 Database (`phd-signaling-db` for logs).
- **Core logic**: Relays WebRTC signaling messages (`offer`, `answer`, `ice-candidate`) between connected peers in room `default` for direct P2P data exchange.

## Friction Analysis
**Score**: 0.7 — Present in files and local workspace but not directly in the main `gemini-oracle` repository (located inside the sibling repository `the-oracle-keeps-the-human-human`).
**Coverage**: [oracle, files, git]
**Goal check**: Answered the question fully. Yes, we do have our own signaling server.

## Summary
The Oracle fleet uses the Cloudflare Workers Durable-Objects-based `phd-signaling` server deployed at `wss://phd-signaling.laris.workers.dev/ws` using key `<AUTH_KEY>` for WebRTC P2P signaling relay.
