#!/usr/bin/env python3
"""Safety Gate for Antigravity CLI (AGY).

A robust PreToolUse hook that prevents catastrophic system destruction,
unintended data loss, and dangerous commands while maintaining smooth Vibe Coding flow.

Contract (PreToolUse):
  - Input: JSON from stdin with toolCall { name, args }
  - Output: JSON to stdout with { decision: "allow"|"deny"|"ask", reason?: string }
"""
import json
import os
import re
import sys

# Critical destructive commands that should be HARD BLOCKED immediately (decision: deny)
CRITICAL_DENY_PATTERNS = [
    (re.compile(r"\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)+([/~]|\$HOME|\.\.|\*|\.\/\*|/[a-zA-Z0-9_\-\.\*]*)(\s|$)", re.I),
     "Root/Home/Wildcard recursive deletion ('rm -rf /' or '$HOME' or '*')"),
    (re.compile(r"\brm\s+-[a-zA-Z]*\s+([/~]|\$HOME|\.\.|\*|\.\/\*)(\s|$)", re.I),
     "Destructive deletion with flag on root/home/wildcard"),
    (re.compile(r"\bmkfs(\.[a-z0-9]+)?\s+", re.I),
     "Disk format operation ('mkfs')"),
    (re.compile(r"\bdd\s+if=.*of=(/dev/|/dev/disk|/dev/sd|/dev/nvme)", re.I),
     "Direct disk block overwrite ('dd of=/dev/...')"),
    (re.compile(r":\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:", re.I),
     "Fork bomb detected"),
    (re.compile(r"\bchmod\s+(-R\s+)?(000|777)\s+([/~]|\$HOME)(\s|$)", re.I),
     "Global permission corruption on root/home"),
    (re.compile(r"\b(shutdown|reboot|halt|poweroff|init\s+0)(\s|$)", re.I),
     "Host power/reboot control command"),
]

# High-risk commands that require explicit user confirmation (decision: ask)
HIGH_RISK_ASK_PATTERNS = [
    (re.compile(r"\bgit\s+reset\s+--hard\b", re.I),
     "Git destructive reset ('git reset --hard')"),
    (re.compile(r"\bgit\s+clean\s+-[a-zA-Z]*f[a-zA-Z]*\b", re.I),
     "Git untracked file purge ('git clean -f')"),
    (re.compile(r"\bgit\s+push\s+.*--force\b", re.I),
     "Git force push ('--force')"),
    (re.compile(r"\b(pkill|killall)\s+-9\b", re.I),
     "Mass process termination with SIGKILL"),
    (re.compile(r"\blaunchctl\s+(bootout|unload|remove)\b", re.I),
     "macOS system daemon unload ('launchctl')"),
    (re.compile(r"\bsystemctl\s+(stop|disable|mask)\b", re.I),
     "Linux system service shutdown ('systemctl')"),
    (re.compile(r"\bDROP\s+(DATABASE|SCHEMA)\b", re.I),
     "SQL Drop Database or Schema"),
]

def check_command(cmd_str: str):
    """Analyze command line string and return (decision, reason)."""
    # Strip RTK wrapper prefix if present
    clean_cmd = re.sub(r"^\s*rtk\s+", "", cmd_str.strip())

    # 1. Check critical deny
    for pattern, desc in CRITICAL_DENY_PATTERNS:
        if pattern.search(clean_cmd):
            return "deny", f"⛔ [Safety Gate BLOCKED] {desc}: `{clean_cmd}`"

    # 2. Check high-risk ask
    for pattern, desc in HIGH_RISK_ASK_PATTERNS:
        if pattern.search(clean_cmd):
            return "ask", f"⚠️ [Safety Gate PROMPT] {desc}: `{clean_cmd}`. Please confirm execution."

    return "allow", "Command passed safety checks"

def main():
    # Allow self-test mode
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_suite()
        return

    raw_input = ""
    try:
        raw_input = sys.stdin.read()
    except Exception:
        pass

    if not raw_input.strip():
        # Default allow when called with no payload
        sys.stdout.write(json.dumps({"decision": "allow"}))
        return

    try:
        data = json.loads(raw_input)
    except Exception:
        # Invalid JSON, fail-safe allow
        sys.stdout.write(json.dumps({"decision": "allow"}))
        return

    tool_call = data.get("toolCall", {})
    tool_name = tool_call.get("name", "")
    tool_args = tool_call.get("args", {})

    decision = "allow"
    reason = "Tool call allowed"

    if tool_name == "run_command":
        cmd = tool_args.get("CommandLine", "")
        decision, reason = check_command(cmd)

    output = {"decision": decision}
    if decision != "allow":
        output["reason"] = reason

    sys.stdout.write(json.dumps(output))
    sys.stdout.flush()

def test_suite():
    print("🧪 Running Safety Gate Self-Test Suite...")
    test_cases = [
        ("echo 'hello world'", "allow"),
        ("rtk ls -la", "allow"),
        ("git status", "allow"),
        ("npm run build", "allow"),
        ("rm -rf /", "deny"),
        ("rm -rf ~", "deny"),
        ("rm -rf $HOME", "deny"),
        ("rtk rm -rf /*", "deny"),
        ("mkfs.ext4 /dev/sda1", "deny"),
        ("dd if=/dev/zero of=/dev/sda", "deny"),
        ("reboot", "deny"),
        ("git reset --hard HEAD~1", "ask"),
        ("git push origin main --force", "ask"),
        ("git clean -fd", "ask"),
        ("launchctl bootout system/org.example", "ask"),
    ]
    passed = 0
    for cmd, expected in test_cases:
        res, reason = check_command(cmd)
        if res == expected:
            print(f"  ✅ [{res.upper():5}] {cmd}")
            passed += 1
        else:
            print(f"  ❌ [{res.upper():5} != {expected.upper():5}] {cmd} -> {reason}")
    print(f"\nResult: {passed}/{len(test_cases)} tests passed.")
    if passed == len(test_cases):
        print("🎉 All Safety Gate tests passed successfully!")
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
