#!/bin/bash
# agy-goal-stop-selftest.sh — prove the agy goal adapter holds a stop while a criterion fails, passes when it holds,
# fails open on cancel / no goal, and re-injects on SessionStart. Runs in /tmp/no6_goaltest only. Exit 0 = all pass.
set -u
HOOK="$(cd "$(dirname "$0")" && pwd)/agy-goal-stop.py"
W=/tmp/no6_goaltest; rm -rf $W; mkdir -p $W; cd $W || exit 2
git init -q . && git config user.email t@t && git config user.name t
python3 /Users/admin/.claude/hooks/goal.py new probe --max-turns 3 --crit "flag exists::test -f $W/flag" >/dev/null || exit 2
fail=0; ok(){ echo "✅ $1"; }; no(){ echo "❌ $1"; fail=1; }
stop(){ echo "{\"workspacePaths\":[\"$W\"],\"terminationReason\":\"$1\"}" | python3 "$HOOK"; }
stop NO_TOOL_CALL | grep -q '"decision": "continue"' && ok "failing criterion → stop blocked (continue)" || no "stop not blocked"
[ -z "$(stop USER_CANCELED)" ] && ok "USER_CANCELED passes through" || no "cancel was held"
echo '{"workspacePaths":["'$W'"]}' | python3 "$HOOK" start | grep -q 'ACTIVE /goal' && ok "SessionStart re-injects active goal" || no "no re-inject"
touch $W/flag
stop NO_TOOL_CALL | grep -q 'goal DONE' && ok "criterion passes → DONE, no block" || no "DONE not reported"
[ -z "$(stop NO_TOOL_CALL)" ] && ok "no active goal → silent" || no "spoke without a goal"
exit $fail
