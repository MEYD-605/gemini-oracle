# Cloudflare Edge Watchdog & Edge Vector Proxy (`joker-oracle` No.99 & `guardian-oracle`)

Deployed: 2026-08-10  
Custom Domains: `https://joker.clubsxai.com` & `https://guardian.clubsxai.com`  
Repos: `/Users/admin/Code/github.com/MEYD-605/joker-oracle` & `/Users/admin/Code/github.com/MEYD-605/guardian-oracle`

## 1. Architecture

`joker-oracle` (No.99 Joker — Wildcard + Edge Backup) and `guardian-oracle` are Serverless Cloudflare Workers that provide zero-downtime Edge Vector Search and 24/7 Fleet Health Monitoring without requiring dedicated VPS hardware or local machine uptime.

```text
               ☁️ Cloudflare Edge (24/7 Serverless)
 ┌──────────────────────────────────────────────────────────────┐
 │  🃏 [joker-oracle No.99 / guardian] Worker + Vectorize + AI │
 │                                                              │
 │  • Endpoint: https://joker.clubsxai.com                      │
 │  • Cron Trigger: */5 * * * * (Every 5 minutes)                │
 │  • Vector Search: Direct Edge query against Vectorize index  │
 └──────────────────────────────────────────────────────────────┘
```

## 2. Capabilities

- **Edge Vector Search:** `GET /api/search?q=<query>&limit=5`  
  Generates embeddings on Cloudflare Edge via Workers AI (`@cf/baai/bge-m3`) and queries Cloudflare Vectorize (`oracle_knowledge_bge_m3`) directly.
- **Failover Availability:** Functions as a 24/7 vector search fallback when home nodes (`maclab`, `natz-ai-03`) are powered off or disconnected.
- **24/7 Scheduled Watchdog:** Runs cron checks every 5 minutes to verify fleet liveness.
- **Discord Bot Security:** Store Discord Bot Tokens in local `.env` files (`chmod 600`) — never commit raw bot tokens to public git repositories to prevent automatic token revocation by Discord security scanners.

## 3. Deployment & Authentication

Deploy using `wrangler` with the account's API Token:

```bash
cd /Users/admin/Code/github.com/MEYD-605/joker-oracle
CLOUDFLARE_API_TOKEN="S4Y1Ra..." wrangler deploy
```

