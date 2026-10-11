# MacLab Auto Load Guard Daemon & Emergency Unfreeze

## Overview
A lightweight daemon script (`/Users/admin/bin/maclab-load-guard.sh` mirrored to `~/.hermes-no5/scripts/maclab-load-guard.sh`) scheduled via Hermes cronjob (`maclab-auto-load-guard`, schedule `every 5m`, `no_agent=true`).

## Purpose
Prevents MacLab freezes, thermal spikes, and hard reboots caused by:
1. Zombie `clang` / `cc1` / `node-gyp` compilation loops (e.g. `better-sqlite3` native build for 9router).
2. Runaway `git pack-objects` / bundle creation storms.

## Threshold & Behavior
- **Trigger**: 1-minute load average > 8.0 (`sysctl -n vm.loadavg`).
- **Automated Actions**:
  - Scans and issues `kill -9` against any frozen compiler processes (`clang`, `cc1`, `node-gyp`).
  - Scans and issues `kill -9` against any runaway `git pack-objects` processes.
  - Logs actions to `~/.hermes-no5/logs/load-guard.log`.
- **Cron Config**: Scheduled as a script-only watchdog (`no_agent=true`) every 5 minutes to consume zero tokens and run autonomously without LLM overhead.
