#!/usr/bin/env bash
# home-watch-probe.sh — No.5 HOME-WATCH one-liner probe
# Reports: load1m · die temp · disk % · hermes gw · runaway pack
# Escalate to No.1 if: load1m>5 or die>70
set -euo pipefail

echo "=== load ==="
uptime
echo "=== load1m precise ==="
sysctl -n vm.loadavg 2>/dev/null || cat /proc/loadavg 2>/dev/null || echo "n/a"
echo "=== disk ==="
df -h / | tail -1
echo "=== die temp ==="
sudo powermetrics --samplers smc -n1 -i1 2>/dev/null | grep -i 'die temp' | head -2 || echo "no smc"
echo "=== hermes gw (launchd) ==="
launchctl list 2>/dev/null | grep -i hermes || echo "no launchd hermes"
echo "=== hermes gw (process) ==="
pgrep -fa hermes 2>/dev/null | grep -v grep | head -3 || echo "none"
echo "=== runaway pack/bundle ==="
pgrep -fa 'git pack-objects|git bundle' 2>/dev/null | head -3 || echo "none"
