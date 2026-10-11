# 2026 Open-Source Fleet Tooling & Infrastructure Gap Analysis

Synthesized from `web_search` and `x_search` (xAI Twitter discovery) for Bo's 3-house Hermes fleet.

## Verified Essential Tooling Gaps & Recommended Repos

### Priority 1: High-Impact Infrastructure (Do First)
1. **Secrets Management**: [getsops/sops](https://github.com/getsops/sops) + [FiloSottile/age](https://github.com/FiloSottile/age)
   - Encrypts YAML/ENV in-place for git commits. Replaces unencrypted tokens in `config.yaml`.
2. **Uptime & Dead-Man's Switch**: [louislam/uptime-kuma](https://github.com/louislam/uptime-kuma) + [healthchecks/healthchecks](https://github.com/healthchecks/healthchecks)
   - Real-time HTTP/TCP node monitoring + heartbeat alerts for Hermes cron jobs.
3. **Automated Encrypted Backups**: [restic/restic](https://github.com/restic/restic)
   - Deduplicated, encrypted backups across fleet nodes via SSH / S3 targets.

### Priority 2: Multi-Agent Coding Orchestration
4. **Git Worktree Multi-Agent Coding**: [Untrivial-ai/agent-orchestrator](https://github.com/Untrivial-ai/agent-orchestrator) (or [stablyai/orca](https://github.com/stablyai/orca))
   - Parallel agent execution in isolated git worktrees with automatic CI feedback loop routing back to the responsible agent.
5. **Continuous Integration**: GitHub Actions (`gh` CLI integration)
   - Automated testing and linting before agent code merges.

### Priority 3: Observability & Security (Next Phase)
6. **Containerization**: `Moby (Docker)` / `Podman`
7. **LLM Cost & Tracing**: [Langfuse/langfuse](https://github.com/langfuse/langfuse) (Self-hosted)
8. **MicroVM Sandboxing**: [microsandbox/microsandbox](https://github.com/microsandbox/microsandbox)
9. **Prompt/Skill Unit Testing**: [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo)

### Emerging Trends to Watch (Do Not Adopt Yet)
- **Nostr-Based Cryptographic Agent Workspace**: [block/buzz](https://github.com/block/buzz) (Jack Dorsey/Block) - Agent-native messaging where agents hold keypairs rather than bot tokens.
