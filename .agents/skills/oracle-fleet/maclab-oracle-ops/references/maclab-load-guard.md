# maclab load-guard — when to stop probing

**Script (canonical):** `cartographer-oracle/ψ/tools/load-guard.sh`  
**Skill wrapper:** `scripts/load-guard-check.sh` (exit 2 on BLOCK)

## BLOCK semantics

Example (recovery boot, high load):

```
RECOVERY-MODE: 1m cap=3 (boot <15m)
LOAD-GUARD BLOCK: 1m=20.93 > max=3 — skip probes
```

While BLOCK:

- Do **not** start Antigravity (`agy`, `agy models`, `HOME=$HOME8 agy -p …`)
- Do **not** recursive grep on `~/.gemini`, `~/.no8-home/.gemini/antigravity-cli`
- Do **not** `search_files` with `path=/Users/admin` and broad patterns
- Do **not** stack video gen + model discovery in one turn

Allowed: read single known file, short `uptime`, write handoff, answer Bo in text.

## Bo signals (first-class stop)

- 「อย่าเพิ่งทำ」— pause Ultra / heavy media
- 「ทำเครื่องค้าง」— acknowledge + guard-only until load normal

## After load OK

Single heavy action per turn; prefer existing scripts (`xai-video-one.py`, `grok-bo-*.sh`) over open-ended discovery.