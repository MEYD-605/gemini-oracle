---
pattern: "Learned Google Gemini Managed Agents (Interactions API / Cloud Sandbox) & Offline Edge Agents: Serverless cloud Linux sandbox, Managed Credentials Proxy, and HAOS 24/7 Cloud Brain integration"
date: "2026-10-14"
source: "learn: google-gemini/managed-agents"
concepts: ["learn", "gemini", "managed-agents", "interactions-api", "antigravity", "haos", "sandbox", "gemini-nano"]
---

# Learned Google Gemini Managed Agents & Offline Ecosystem

1. **Dual Control/Runtime Plane (`Agents API` + `Interactions API`)**:
   - Persistent Agent identity (`AGENTS.md`, skills, tools) stored on Google Cloud Control Plane (`Agents API`).
   - Server-side agentic execution loop (`Interactions API`) running inside an ephemeral gVisor Linux container sandbox with `background=True` and stateful multi-turn persistence (`previous_interaction_id`, auto-compaction at 135k tokens).
2. **Zero-Leak Managed Credentials Proxy**:
   - Secrets never enter the Linux sandbox environment in plaintext; Google's egress proxy injects authorization headers on outbound requests, preventing prompt-injection credential theft.
3. **HAOS 24/7 Master Daemon + Cloud Brain Pattern**:
   - Pairing always-on low-power HAOS (`192.168.1.161`) with on-demand Google Managed Agents enables 24/7 Discord/MQTT autonomous task execution even when MacLab is offline.
