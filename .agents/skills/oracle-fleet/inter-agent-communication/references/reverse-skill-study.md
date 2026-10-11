# Reference: `zhaoxuya520/reverse-skill` (Cybersecurity Skills Router)

**Analyzed**: 2026-08-03 by No.1 Lord Knight  
**Source**: https://github.com/zhaoxuya520/reverse-skill  

## Overview
`reverse-skill` is an AI-agent-centric cybersecurity and reverse engineering skill router pack. It provides a standardized framework for code AI clients (Claude Code, Cursor, Codex CLI, Kiro, Cline, etc.) to execute security, pentesting, reverse engineering, and CTF tasks deterministically without hallucinating commands.

## Key Architectural Patterns

1. **Master Routing & Fast-Path Triage (`MASTER-ROUTING.md` / `routing.md`)**:
   - Maps user task intent to 35+ specialized skill playbooks (APK reverse, iOS, JS reverse, .NET, IDA/radare2/Ghidra binary reverse, Pwn, EDR bypass, LLM security, Firmware).
   - Enforces a "route first, act second" paradigm.

2. **Scope Gatekeeper & Precedent Auth (`skills/ops/scope-contract.md`)**:
   - Requires explicit authorization (`auth.status=granted`) and network profile definition in `work/<case>/scope.md` before executing any target-directed action (`ACT`).
   - Prevents AI agents from running aggressive unauthorized scanning/attacks against random hosts.

3. **Tool Index Auto-Bootstrap (`skills/scripts/refresh-tool-index.*`)**:
   - Inspects the local machine environment (Windows / Linux / macOS / Kali) to build `tool-index.md`.
   - Single source of truth for tool availability (`jadx`, `apktool`, `frida`, `radare2`, `ghidra`, `nmap`, etc.).
   - Prevents re-installation of existing binaries while providing deterministic setup recipes for missing tools.

4. **Evidence Chain (`skills/ops/evidence-finding-path.md`)**:
   - Enforces structured evidence linking (`Evidence -> Finding -> Path`) and timeline journaling.

## 18-Node Capability Taxonomy
- **Infra**: VPS, Linux, SSH, Firewall, Tailscale, Backup
- **Install**: Official installer, Python/Deps, Hermes Doctor, Updates, Systemd
- **Models**: Nous Portal, Codex, Anthropic, OpenRouter, Local, Real-time switching
- **Interfaces**: Terminal, TUI, Desktop App, Web Dashboard, IDE ACP, OpenAI API
- **Gateway**: Discord, Telegram, Slack, WhatsApp, Email, 20+ Platforms
- **Context**: AGENTS.md, Project Rules, User Prefs, Conversation History, Channel Context
- **Tools**: Terminal, File I/O, Web Search, Web Extract, Vision, Image Gen, Audio TTS
- **Memory**: User Profile, Work Protocols, Tech Environment, Inter-session Alerts, History Search
- **Skills**: Reusable Workflows, Community Catalog, Slash Commands, Custom Skills, Usage Improvement
- **Integrations**: MCP Servers, GitHub, Databases, SaaS Tools, Home Assistant, Custom Plugins
- **Automation**: Scheduled Tasks, Skill Crons, Webhooks, Script-only (no LLM), Cross-platform Delivery
- **Delegation**: Subagents, Parallel Processing, Background Sessions, Multi-step, Auto Return
- **Security**: Authorized Users, Code Pairings, Dangerous Command Guard, Secret Protection, Docker/SSH Isolation
- **Research**: Auto Watchdog, Multi-source Search, Competitor Analysis, Doc Synthesis, Citation Reports
- **Dev**: Repo Audit, Feature Gen, Bug Fix, Test/Lint, PRs, Code Review
- **Content**: Idea Search, Writing, Newsletter, Social Media, Visuals, Audio
- **Business**: Email Sorting, Meeting Notes, CRM Updates, KPI Reports, Data Analysis, Doc Prep
- **Monitoring**: Server Status, Web Changes, News, Pricing, Logs, Discord Alerts
- **Daily Ops**: Phone Messages, PC-off Work, Session Continuity, Runtime Edits, Channel Delivery, Human-in-the-loop Approval
- **Improvement Loop**: Memory, Past Decisions, Method-to-Skill, Reuse, Continuous Improvement

## Applicability to Oracle Fleet
- **Fleet Master Skill Router**: Pattern can be adapted to construct an internal fleet router mapping tasks across compute nodes (`maclab`, `clubslab`, `ai-core`).
- **Playbook Adoption**: Individual MIT-licensed security playbooks can be ported into `~/.hermes-no1/skills/` as needed.
