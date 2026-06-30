---
query: "markdown mdx"
target: "gemini-oracle"
mode: deep
timestamp: 2026-06-20 16:43
friction_score: 0.7
coverage: [oracle, files, git, cross-repo]
confidence: high
---

# Trace: markdown mdx

**Target**: gemini-oracle
**Mode**: deep | **Friction**: 0.7 | **Confidence**: high
**Time**: 2026-06-20 16:43

## Oracle Results
None

## Files Found
- `./ψ/focus.md`
- `./ψ/research-siwe-mqtt.md`
- `./IDENTITY.md`
- `./SOUL.md`
- `./CLAUDE_workflows.md`

## Git History
None

## GitHub Issues/PRs
None

## Cross-Repo Matches
- `/root/maw-workspace/ψ/learn/claude-mem/docs/public/` contains numerous MDX docs:
  * `endless-mode.mdx`
  * `context-engineering.mdx`
  * `modes.mdx`
  * `introduction.mdx`
  * `installation.mdx`
  * `configuration.mdx`
  * (and folders under `usage/`, `cursor/`, `architecture/`)
- `/root/Code/github.com/lvgl/lv_port_pc_vscode/lvgl/docs/src/xml/` contains library MDX files.

## Oracle Memory
None

## Friction Analysis
**Score**: 0.7 — Visible (Files + high confidence)
**Coverage**: [oracle, files, git, cross-repo]
**Goal check**: Yes, found both markdown (.md) and MDX (.mdx) files in workspaces.

## Summary
Markdown (.md) files are widely used for workspace activity, logs, and documentation under `ψ/`.
MDX (.mdx) files are located in `/root/maw-workspace/ψ/learn/claude-mem/docs/public/` (documentation for Claude memory project) and under external `lvgl` library docs in `ghq`.
