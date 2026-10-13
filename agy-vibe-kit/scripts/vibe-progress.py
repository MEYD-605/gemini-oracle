#!/usr/bin/env python3
"""Vibe Coding Progress HUD & Discord Notification Script for Antigravity CLI (AGY).

Tracks agent lifecycle events (PreInvocation, PreToolUse, PostToolUse, Stop),
provides real-time progress indicators, and optionally broadcasts updates to Discord.

Contract:
  - Input: Event name in sys.argv[1] (PreInvocation, PreToolUse, PostToolUse, Stop)
  - Input payload: JSON via stdin
  - Output: JSON to stdout ({})
"""
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

EVENT = sys.argv[1] if len(sys.argv) > 1 else ""

# Optional Discord Webhook integration
WEBHOOK_URL = os.environ.get("VIBE_DISCORD_WEBHOOK") or os.environ.get("DISCORD_WEBHOOK_URL")

# Local progress log file
LOG_DIR = Path.home() / ".gemini"
PROGRESS_LOG = LOG_DIR / "vibe-progress.log"

def shorten(s, max_len=70):
    s = " ".join(str(s).split())
    return s if len(s) <= max_len else s[: max_len - 1] + "…"

def format_tool_action(name, args):
    if not isinstance(args, dict):
        args = {}
    if name == "run_command":
        cmd = args.get("CommandLine", "")
        cmd = re.sub(r"^\s*rtk\s+", "", cmd)
        return f"💻 Terminal: `{shorten(cmd, 60)}`"
    if name == "view_file":
        p = Path(args.get("AbsolutePath", "")).name or "file"
        sl, el = args.get("StartLine"), args.get("EndLine")
        rng = f" (L{sl}-L{el})" if sl and el else ""
        return f"📖 Read: `{p}{rng}`"
    if name == "write_to_file":
        p = Path(args.get("TargetFile", "")).name or "file"
        cnt = str(args.get("CodeContent", "")).count("\n") + 1
        return f"✏️ Write: `{p}` ({cnt} lines)"
    if name == "replace_file_content":
        p = Path(args.get("TargetFile", "")).name or "file"
        sl, el = args.get("StartLine"), args.get("EndLine")
        rng = f" (L{sl}-L{el})" if sl and el else ""
        return f"✏️ Edit: `{p}{rng}`"
    if name in ("search_web", "web_search"):
        q = args.get("query", "")
        return f"🌐 WebSearch: `{shorten(q, 50)}`"
    if name in ("read_url_content", "web_fetch"):
        u = args.get("Url", "")
        return f"🌐 WebFetch: `{shorten(u, 50)}`"
    if name == "invoke_subagent":
        subs = args.get("Subagents", [])
        roles = ", ".join(s.get("Role", s.get("TypeName", "Agent")) for s in subs if isinstance(s, dict))
        return f"🤖 Subagents: {roles or 'invoking'}"
    if name == "call_mcp_tool":
        server = args.get("ServerName", "")
        tool = args.get("ToolName", "")
        return f"🧠 MCP: `{server}/{tool}`"
    return f"⚙️ Action: `{name}`"

def notify_discord(message):
    """Optionally broadcast progress to a Discord webhook if configured."""
    if not WEBHOOK_URL:
        return
    try:
        payload = json.dumps({"content": message}).encode("utf-8")
        req = urllib.request.Request(
            WEBHOOK_URL,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "AgyVibeKit/1.0"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=2):
            pass
    except Exception:
        # Non-blocking; don't disrupt AGY on webhook network errors
        pass

def log_local(line):
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        with open(PROGRESS_LOG, "a", encoding="utf-8") as f:
            ts = time.strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{ts}] {line}\n")
    except Exception:
        pass

def handle_event(event_name, data):
    if event_name == "PreInvocation":
        inv = data.get("invocationNum", 1)
        msg = f"⚡ Thinking... (Invocation #{inv})"
        log_local(msg)

    elif event_name == "PreToolUse":
        tool_call = data.get("toolCall", {})
        t_name = tool_call.get("name", "")
        t_args = tool_call.get("args", {})
        status = format_tool_action(t_name, t_args)
        log_local(f"PreToolUse: {status}")
        notify_discord(status)

    elif event_name == "PostToolUse":
        step = data.get("stepIdx", 0)
        err = data.get("error")
        if err:
            err_msg = f"⚠️ Step #{step} encountered error: {shorten(str(err), 60)}"
            log_local(err_msg)
            notify_discord(err_msg)

    elif event_name == "Stop":
        msg = "🏁 Session complete! All requested actions finished."
        log_local(msg)
        notify_discord(msg)

def test_suite():
    print("🧪 Running Vibe Progress Self-Test Suite...")
    events = [
        ("PreInvocation", {"invocationNum": 1}),
        ("PreToolUse", {"toolCall": {"name": "view_file", "args": {"AbsolutePath": "/app/src/main.ts", "StartLine": 1, "EndLine": 50}}}),
        ("PreToolUse", {"toolCall": {"name": "run_command", "args": {"CommandLine": "rtk cargo test"}}}),
        ("PostToolUse", {"stepIdx": 2, "error": None}),
        ("Stop", {})
    ]
    for ev, payload in events:
        handle_event(ev, payload)
        print(f"  ✅ Event handled: {ev:15}")
    print("\n🎉 All Vibe Progress tests passed successfully!")

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_suite()
        return

    # Always ensure valid JSON is emitted to AGY
    raw_input = ""
    try:
        raw_input = sys.stdin.read()
    except Exception:
        pass

    data = {}
    if raw_input.strip():
        try:
            data = json.loads(raw_input)
        except Exception:
            pass

    try:
        handle_event(EVENT, data)
    except Exception as e:
        log_local(f"Error handling event {EVENT}: {e}")

    # Return standard empty JSON object for AGY hook handler
    sys.stdout.write(json.dumps({}))
    sys.stdout.flush()

if __name__ == "__main__":
    main()
