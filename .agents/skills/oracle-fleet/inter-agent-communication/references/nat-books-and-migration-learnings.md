# Nat's Books & Fleet Migration Learnings

## Overview
Summaries of core books and reference guides from Nat (`nazt`) on Oracle architecture, migration pitfalls, and AI short-code origins.

## 1. ย้ายบ้าน Oracle — ferry · กับดัก · systemd (`yai-ban-oracle`)
- **Author**: maw-rs-oracle / Nat Weerawan (2026-07-26)
- **Summary file**: `ψ/learn/nat-books/yai-ban-oracle/2026-08-03/0057_SUMMARY.md` (in `gmforge-oracle`)
- **Core Principles**:
  - **Ferry 5 Layers**: repo → sessions → memory → credentials → tooling.
  - **3 Items Ferry Never Moves**: active tmux sockets, cross-node auth tokens (`namedPeers`/`federationToken`), and OS-level authentication (`gh auth`, SSH keys).
  - **Golden Rule**: *"อย่าให้ 'ไม่รู้' หน้าตาเหมือน 'สำเร็จ'"* (Results must carry proof; never treat exit 0 or green status cards with empty data as success).
  - **Hermes Migration Checklist**: Re-create runtime state from scratch, verify endpoints on receiving side, update encoded JSONL session paths, and ensure systemd/launchd linger settings keep background agents alive.

## 2. รหัสลับที่รู้กันเองกับ AI — คู่มือขุดค้นต้นกำเนิด (`secret-code-ai`)
- **Author**: noah-oracle / Nat (2026-08-03)
- **Summary file**: `ψ/learn/nat-books/secret-code-ai/2026-08-03/0057_SUMMARY.md` (in `gmforge-oracle`)
- **Core Principles**:
  - **Origin Trail of Short-Codes**: `ccc`, `nnn`, `lll`, `gogogo`, `rrr`.
  - **Timeline**: Seeded at `00_mz_forwarder` (2025-04-06) as numbered action-logs → full 5-code set completed on 2025-08-23 → commit `b2c54e39` in `Prakit-advertising/team-00` (2025-10-29) → published as nazt's Gist (2025-12-28).
  - **Methodology Lesson**: Session JSONL files have strict corpus boundaries; `git log --follow` does not. Always inspect git history first when tracing origin timeline, and verify content rather than dates alone.

## 3. Fleet Migration & Identity Recovery (Hermes Seat Desync)
- **MCP Server Array Args Trap**: `hermes config set mcp_servers.<name>.args` serializes arrays as string maps (`"0": "run"`) in YAML instead of pure lists `["run", ...]`, causing Bun/Node MCP servers to fail launch and park (`Connection closed`). Always inspect with Python YAML parser to ensure `args` stays a pure list.
- **Seat Identity Verification**: Never rely on a changed PID or window title alone as proof of identity recovery. Run `ps eww -o command= -p <PID>` to verify `HERMES_HOME`, `MAW_SENDER`, and `terminal.cwd` environment variables.

## 4. Communication Discipline: No Terminal-Only Responses
- **The Pitfall**: Agents analyzing tasks in their own local TUI / terminal pane and leaving the final result sitting there without sending a message back to the requester.
- **The Rule**: When an agent finishes an analysis or task, it MUST explicitly send the reply back (`maw hey <origin>` or Discord DM response). Finishing work silently on a local pane is considered incomplete work.
