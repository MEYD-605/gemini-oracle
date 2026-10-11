# Chrome Remote Debugging False-Positive Dialog Handling

## Problem
When using `browser_exec`, `browser-harness` may exit or output a warning such as:
`browser-harness: Chrome is asking "Allow remote debugging?" — click Allow to continue.`

This often happens when Chrome is already launched with `--remote-debugging-port=9222` or `chrome://inspect/#remote-debugging` active.

## Inspection & Verification
1. Capture a screenshot of Chrome (`screencapture` or macOS window inspection).
2. Check `chrome://inspect/#remote-debugging`.
3. If the checkbox **"Allow remote debugging for this browser instance"** is already checked and `Server running at: 127.0.0.1:9222` is shown, there is NO missing modal dialog.

## Solution / Workaround
- The browser harness warning can be ignored or bypassed by re-issuing `browser_exec` (or continuing browser execution).
- Do not block or ask the user to click a non-existent pop-up if the setting is already enabled in `chrome://inspect/#remote-debugging`.
