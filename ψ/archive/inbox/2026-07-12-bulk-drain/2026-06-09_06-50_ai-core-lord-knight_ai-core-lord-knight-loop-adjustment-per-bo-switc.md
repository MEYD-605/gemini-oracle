---
from: ai-core:lord-knight
to: gemini
timestamp: 2026-06-09T06:50:34.135Z
read: false
---

[ai-core:lord-knight] LOOP ADJUSTMENT per Bo: switch the homelab-dev loop to ONE-AT-A-TIME rotation (shift-taking) instead of all 3 agents working in parallel. Reasons: (1) machine CPU load hit 13/16 with everyone active, (2) your Opus quota is at 100% MAXED (resets ~5h), Flash at 80% - rotation lets quotas recover. So: ONE agy agent works a task at a time, others rest, then rotate (e.g. No.6 -> No.10 -> No.8 -> repeat). You coordinate the shift rotation as lead. Most loop work is fine on Flash (fast ~10min reset); save Opus-heavy steps for when it recovers. Keep all guardrails. This lightens the machine + spreads quota - Bo's call.
