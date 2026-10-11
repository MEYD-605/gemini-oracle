# Home Guardian Audit & Verification Guidelines (No.5 GmForge)

## Core Principles
1. **Never Claim 100% Completion Prematurely**: Do not state that audit or infrastructure status is "สมบูรณ์เรียบร้อยครบทุกจุด" without explicitly verifying file contents against live environment realities.
2. **Drift Detection**:
   - Inspect `infra.md`, `SHARED_KNOWLEDGE.md`, and leftover maps (`แผนที่-Oracle-leftover-*.md`).
   - Look for obsolete tool paths, stale references (e.g. old grok-build tools or deprecated MCP paths), and unmerged directory structures.
3. **Bo's Expectations**:
   - Deliver clear, direct evidence with file paths and mtimes.
   - Report remaining drift honestly rather than asserting that everything is complete.
