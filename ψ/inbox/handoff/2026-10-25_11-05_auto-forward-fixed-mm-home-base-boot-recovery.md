# Handoff: auto-forward fixed · No.1 on Mattermost · boot-recovery + MM backup after 2 power cuts

**Date**: 2026-10-25 11:05
**Context**: 45% (fired by fleet-context-watch, the first auto-forward for No.1 since the threshold fix)
📡 Session: df65ee4a | lord-knight-oracle

## Context
**Oracle**: No.1 Lord Knight | **Human**: Bo
**Bo's channel is now Mattermost**, not Discord (his Discord user account is banned since 10-23). DM Bo = `chat_id mm-z4mw3sczibr7mcnzfrfxpkizta` via oracle-channel reply. See CLAUDE.md ## Mattermost.
Model: opus-5.5[1m] (back on spec after the 10-24 power-cut restart; the 4.8 drift is gone).

## What We Did (10-21 → 10-25, long session across 2 power cuts)
- **Auto-forward fixed (Bo 10-25 11:01: "it says it'll forward but doesn't, 3-4 days")**: sombo `scripts/fleet-context-watch.sh:47-50` had 01/05/02 at forward 50 / reset 65, only 88 at 40/50 (set 1659f69b 10-07). No.1 sat at 43-44% logged "ok". Changed 01/05/02 → 40|50 in the working tree; launchd runs that file directly, and this forward is the proof (11:05:28 `[01-lord-knight] ctx=45% idle 168s -> /forward --only`). **NOT committed**: sombo repo ahead 8 / behind 1, asked Sombo to commit. Backup: /tmp/fleet-context-watch.sh.bak.20261025-thresh.
- **D-047 closed** (leaked no88-sombo 9router key on PUBLIC gemini-oracle): new keys minted via the 9router CLI-client path, mattermost admin.env moved to my own key, old key isActive=0 → 401. Verified myself.
- **Fleet secret hygiene**: fleet gitleaks rules (9router sk-, arra, discord) in every repo + pre-commit hook; my repo d38... lk hook installed.
- **Mattermost home base (D-048)**: No.4 → Sombo → No.5/6/8 → **No.1** on MM. My bot `@lord-knight`, bridge launchd `com.maclab.mm-bridge-no1`, CLAUDE.md section added (lk 7a11d820). Confirmed working: my MM post → 201.
- **hermes-inbound.ts** (my file): humans exempt from 6/10min cap (Bo order via No.4), committed 052b2fe5.
- **Boot recovery** had skipped EVERY boot since Aug 14 (stale mkdir lock, 8 SKIPs incl. 09-03 and 10-24 outages). Switched `~/.maw/maclab-boot-recovery.sh` to a stale-safe pid lock (bak .bak.20261024-pidlock), tested in a sandbox. Script lives only in ~/.maw (not git tracked).
- **After the 10-24 power cut**: killed 2 logged-out duplicate claude panes (2327/2349) spawned by stale tmux 05-gmforge window :0.
- **10-25 (after the 01:16-08:29 power cut)**: disabled the gmgolf listener in hermes-mattermost-daemon.py:988 (reconnect loop every 5s) + restart; ran the missed MM backup (mattermost-20261025-0932.sql.gz, 3 legs OK); added a log to com.maclab.mattermost-backup → ~/srv/mattermost/backup.log.
- **Privacy rule** (Bo 10-25): Bo's personal data lives only in private `bo-personal-vault` → added to my SOUL.md ## Boundaries (lk e27d9e9f).
- **Merged my own stale PRs**: lk #75/#76/#82, oracle-substrate #4 (discord-slash-bridge /model sync, already live). Voted yes on sombo #26, reviewed the gemini #11 merge (made by No.6+Sombo).
- Fixed my probe `ψ/tools/fleet-model-live.py` (reads statusline before launch env + combo heads; No.2 caught the false DRIFT).

## Pending
- [ ] **Sombo commits fleet-context-watch.sh threshold fix** (its repo; I only changed the working tree)
- [ ] **No.00 consent** for gmgrok Notion-token fix (request file in ~/.hermes-gmgrok/inbox/2026-10-25_00-31_no1-consent-gmgrok-notion-token.md) → sweep frozen at 113+ commits
- [ ] **No.5 consent** for the same gmforge fix (sent MQTT 10-25 00:31)
- [ ] **No.6 launcher**: yaml says Sonnet 5.5 but start-no6 still launches gemini-3.8-flash-high → check before No.6 restarts
- [ ] **Oracle School backfill** for P'Nat (Sombo owns; I replied in his Discord room 1512079809021214730 that we'd report counts there). Check that Sombo actually posted the counts.
- [ ] Propose that fleet_handoff_sync skip PUBLIC repos (gemini-oracle has 124+ handoffs incl. Bo's email + DM ids)
- [ ] My progress hook → MM needs a seat restart (MM_TOKEN_FILE already in settings.json)

## Waiting on Bo (all asked on MM 10-25 10:5x)
- Full Disk Access for /bin/bash → so the 03:37 MM backup reaches GDrive (TCC)
- gemini-oracle public → private? (Bo's email/DM ids in handoffs)
- `sudo netbird service stop` once (maclab off พี่นัท's commu mesh after a reboot; netbird is `down` but the daemon is KeepAlive)
- Notion token rotate-or-keep · No.8 Discord bot token rotate-or-keep

## Next Session
- [ ] Check that context-watch forwards No.2/No.5 at 40% too (log ~/.maw/fleet-context-watch.log) and that Sombo has committed it
- [ ] Follow up No.00/No.5 consent → run the filter-repo fix → sweeps push ψ/ again
- [ ] Rewrite ψ/focus.md (stale since 10-21)

## Key Files
- sombo-oracle/scripts/fleet-context-watch.sh:47-50 (thresholds)
- ~/.maw/maclab-boot-recovery.sh (pid lock)
- ~/srv/mattermost/hermes-mattermost-daemon.py:988 · backup.sh · ~/Library/LaunchAgents/com.maclab.mattermost-backup.plist
- lord-knight-oracle/CLAUDE.md ## Mattermost · SOUL.md ## Boundaries
- sombo-oracle/ψ/decisions.md D-046/D-047/D-048
