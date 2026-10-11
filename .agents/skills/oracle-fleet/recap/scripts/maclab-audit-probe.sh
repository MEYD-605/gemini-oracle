#!/usr/bin/env bash
# maclab-audit-probe.sh — No.5 AUDIT lane quick GREEN/YELLOW (no side effects)
set -euo pipefail
LK="${HOME}/Code/github.com/MEYD-605/lord-knight-oracle"
# shellcheck source=/dev/null
source "${LK}/ψ/tools/maclab-fleet-tmux-probe.sh"
tmux_cnt="$(maclab_fleet_tmux_count)"
tmux_miss="$(maclab_fleet_tmux_missing)"
hermes_ok="NO"
if launchctl list 2>/dev/null | awk '/ai\.hermes\.gateway/{print $1}' | grep -qE '^[0-9]+$' \
  && pgrep -f 'hermes_cli.main gateway run' >/dev/null 2>&1; then
  hermes_ok="YES"
fi
tmux05="NO"
tmux has-session -t 05-gmforge 2>/dev/null && tmux05="YES"
sombo="NO"
tmux has-session -t 88-sombo 2>/dev/null && sombo="YES"
attach="MISSING"
[[ -d "${HOME}/.claude/channels/discord-no0/inbox/attachments" ]] && attach="discord-no0/inbox/attachments"
ensure="${HOME}/Code/github.com/MEYD-605/cartographer-oracle/ψ/tools/no5-tmux-ensure.sh"
ensure_ok="NO"
[[ -x "$ensure" ]] && ensure_ok="YES"
maw_health="FAIL"
curl -sf -m 2 http://127.0.0.1:3456/_health >/dev/null 2>&1 && maw_health="OK"
gate="GREEN"
[[ "$tmux_cnt" -lt "${FLEET_TMUX_EXPECTED:-5}" ]] && gate="YELLOW"
[[ "$hermes_ok" != "YES" ]] && gate="YELLOW"
[[ "$maw_health" != "OK" ]] && gate="YELLOW"
printf 'gate=%s tmux=%s/%s miss=%s hermes_gw=%s tmux05=%s sombo=%s maw_health=%s ensure=%s attachments=%s\n' \
  "$gate" "$tmux_cnt" "${FLEET_TMUX_EXPECTED:-5}" "${tmux_miss:-}" "$hermes_ok" "$tmux05" "$sombo" "$maw_health" "$ensure_ok" "$attach"