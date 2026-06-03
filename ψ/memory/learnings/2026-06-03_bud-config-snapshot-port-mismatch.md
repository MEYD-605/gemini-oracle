---
title: Bud Config Snapshot Bug — Port Mismatch After Parent Fix
tags: [bud, config, vector-search, port-mismatch, post-copy-validation]
created: 2026-06-03
source: No.6 Gemini /rrr
project: github.com/meyd-605/gemini-oracle
---

# Bud Config Snapshot Bug — Port Mismatch After Parent Fix

## Pattern
When an Oracle buds from a parent, the child copies the parent's config at bud-time. If the parent later fixes a config bug (e.g., changing embedding port from 11434→11435), the child retains the broken config indefinitely.

## Evidence
- No.1 Lord Knight fixed `OLLAMA_BASE_URL` to port 11435 (OpenVINO) on 2026-05-22
- No.6 Gemini was budded on 2026-04-17, before the fix
- No.6's `settings.json` still had port 11434 (dead Ollama) on 2026-06-03
- Result: 46 days of degraded vector search (FTS5 fallback only)

## Lesson
1. Bud copies a snapshot, not a live reference — always audit child config after bud
2. `arra_stats` reported `vector_status: "connected"` despite embedding endpoint being unreachable — misleading health indicator
3. Cross-agent config comparison (diff No.1 vs No.6) is the fastest way to find drift

## Recommendation
- Add post-bud health check that validates all MCP endpoints are reachable
- `arra_stats` should ping embedding endpoint, not just report connection config
