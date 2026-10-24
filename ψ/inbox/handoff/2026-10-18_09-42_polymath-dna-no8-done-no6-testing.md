# Handoff: Polymath DNA per seat (No.8 done, No.6 under test) + agy tube fixes + D-045

**Date**: 2026-10-18 09:42
**Context**: 41% (opus-5.5[1m])
📡 Session: 7d957a6e | sombo-oracle

## Bo's rules this session (all saved)
- Polymath = each seat a full polymath on its own; strand count varies per seat's core ("ดูตามแก่นของแต่ละตัวที่มันแปรผันได้")
- One seat at a time + test before/after
- **Never change a seat without telling it + asking it to help** ("ต่อไปนี้เราจะไม่ทำอะไรโดยเจ้าตัวไม่รู้") — interview the seat, not just logs
- MacLab (บ้านเรา) first
- memory: `seat-dna-ask-the-seat-and-loaded-file.md`, `clubsgame-two-sided-care-no8-no10.md`

## What We Did
- **Research**: polymath personas (PRISM: personas change tone not accuracy; diversity collapse), similar fleets (Gas Town, OpenClaw SOUL/AGENTS split), polymath measurement (Araki/Root-Bernstein: breadth·depth·integration; 2–4 deep typical).
- **Team DNA audit** (subagents): `ψ/drafts/2026-10-18_team-dna-audit.md` — 8 seats, current DNA vs real work, repeated mistakes, proposed home base/strands/tests, + loaded-file map. Key finding: 6/7 seats share "claim state without same-turn check"; 10-09 DNA was batch-pasted in 36 min.
- **No.8**: sandbox trial `scripts/dna-trial/run_trial.py` — STOP obeyed 5/10 → 10/10, plan-as-order 3/3=3/3, unseen 8T-reset diagnosis 0/5=0/5 (DNA fixes behaviour, not knowledge). Bo GO → applied. Then **interviewed No.8** → v2 co-written (two-tier 🟢/🔴 read-back, Turn-Yield 3 writes/30s, role = MacLab Field Medic & Hardware/Thermal, image gen = shelf tool). agy-nano2-oracle commits 8f55912, c36a647, e3b8307. No.8 confirmed DNA v2 fully injected.
- **Seat self-check from inside** (5-question MQTT) — table `ψ/drafts/2026-10-18_seat-self-check-tubes.md`. Replies: No.1, No.2, No.6, No.8, me. Not yet: No.00, No.4, No.5.
- **No.6/No.8 tube fixes** (No.6 found root cause): `~/.no{6,8}-home/.gemini` → same `~/.gemini`, shared GEMINI.md had No.6 sign/role and loaded twice → repo GEMINI.md cut by token budget. Fixed: shared file seat-neutral, AGENTS.md → stub (gemini-oracle 27b6c308), cbm cache → central index, relic sources absolute + `~/.no8-home/.relic` symlink, lightcraft-pro linked, 29 GCP skills → `~/.gemini/config/skills-disabled`. Both seats verified live.
- **Bo chose A** (09:23): No.6/No.8 → 3.8 flash high (D-037). No.1 removed `--add-dir`, restarted both via launchers (verified: pids 53598/54234, footer "Gemini 3.8 Flash · high"), commits d6e745e6, cc4c84a. **Root cause of 10-16 argon relaunch**: `~/.maw/start-no6-no8-relay-once.command` + `~/.config/meyd/meyd.yaml` start_cmd hard-coded argon → No.1 pointed both at launchers.
- **D-045** (Sombo + No.1, `ψ/decisions.md`): one source of truth for seat model = desired-state.yaml. Split: Sombo = yaml schema + /model menu writes yaml + morning inside-check; No.1 = reader + wire launchers/MEYD/.command + drift "live argv vs yaml".
- Also: ClubSGame HAOS desired → Off (eac6107); No.5 model argon-medium in yaml.

## Pending
- [ ] **No.6 DNA trial running** (`scripts/dna-trial/trial-no6.log`, results-no6.jsonl; N6A shared profile / N6B process:2 claim / N6C provenance unseen × 5 per side). So far N6A before 1/2. → send results to No.6 + Bo → GO → edit gemini-oracle GEMINI.md (what agy loads)
- [ ] Self-check replies from No.00, No.4, No.5 → add to table, fix 🟢 items (tell seat first), 🔴 to No.1
- [ ] D-045 my part: yaml schema for model + `discord-slash-menu.py switch_agy_model()` also writes desired-state + morning inside-check script
- [ ] No.8 ↔ No.10 protocol: kill vendor bloatware on ClubSGame (needs No.10 via Discord)
- [ ] pstack: No.1 enabled-not-installed, No.2 missing, but SessionStart hook claims all have it → install or drop from hook (No.1 asked)
- [ ] No.2: arch-debt-canary still HTTP `hey` to offline 100.81.0.110:3456 → MQTT; fs MCP scope request
- [ ] No.1: own restart (cbm disconnect + env model alias)
- [ ] Remaining seats DNA: interview → draft → test → GO (No.1, No.2, No.4, No.5, No.00, me). Idea: enforcement hook flagging "เสร็จ/ตาย/ส่งถึง" without same-turn evidence
- [ ] Carried from 10-17: gmgrok aux 3.7→3.8, LC commit/merge, disk 🟡 items, GmAtom HAOS allowlist, phone sudo, move gmlab/gmaicore WSL→8T (Bo not answered)
- [ ] 270+ unpushed commits on sombo-oracle main

## Next Session
- [ ] Check `scripts/dna-trial/trial-no6.log` SUMMARY → report table to No.6 (MQTT) + Bo (DM) with honest caveats → ask GO
- [ ] Chase No.00/No.4/No.5 self-checks
- [ ] Start D-045 Sombo part (tell seats first)

## Key Files
- ψ/drafts/2026-10-18_team-dna-audit.md · ψ/drafts/2026-10-18_no8-polymath-dna-draft.md · ψ/drafts/2026-10-18_seat-self-check-tubes.md · ψ/drafts/2026-10-18_polymath-dna-draft.md
- scripts/dna-trial/run_trial.py (+ results*.jsonl)
- ψ/decisions.md (No.8 DNA, No.6/8 fixes, D-045)
- MQTT task labels: `[READ-ONLY]` / `[CLEAR TO FIX]` (No.8's request)
