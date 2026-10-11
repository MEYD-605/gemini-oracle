# Grok CLI headless from Hermes terminal

Proven maclab 2026-07-11.

## Problem

Calling `grok "prompt"` or `grok "prompt" --output-format json` from Hermes
`terminal()` fails with:

```
Error: Device not configured (os error 6)
```

This happens even with `pty=true` — Grok TUI initialization expects a real
interactive terminal and Hermes terminal is not one.

## Fix: `--prompt-file` + `--output-format json`

Write the prompt to a temp file, then use `--prompt-file`:

```bash
echo 'Generate one image: <description>. Save to outputs/<name>.png' > /tmp/grok-prompt.txt
grok --prompt-file /tmp/grok-prompt.txt --output-format json
```

Returns JSON: `{ text, stopReason, sessionId, requestId, thought }`.

The `text` field contains Grok's reply (including generated file paths).

### Finding generated images (critical — saves 4+ tool calls)

Grok CLI stores generated images under a **session-specific subdirectory** keyed by the **URL-encoded CWD** the command ran from:

```
~/.grok/sessions/<url-encoded-cwd>/<session-uuid>/images/1.jpg
```

Example: if `grok --prompt-file` was run from `/Users/admin/Code/github.com/MEYD-605/gmforge-oracle`, the path is:

```
~/.grok/sessions/%2FUsers%2Fadmin%2FCode%2Fgithub.com%2FMEYD-605%2Fgmforge-oracle/<uuid>/images/1.jpg
```

**Fast lookup after generation:**

```bash
# The JSON response contains sessionId — use it directly
SID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionId'])")
find ~/.grok/sessions -path "*/$SID/images/*.jpg" 2>/dev/null
# For video output:
find ~/.grok/sessions -path "*/$SID/videos/*.mp4" 2>/dev/null
```

**Do NOT** search `$HOME` broadly (too slow, load-guard risk), and do NOT expect images in `cwd/images/`, `~/.grok/images/`, or `/tmp` — they are always under `~/.grok/sessions/`.

**Video output path pattern (verified 2026-07-12):** `image_to_video` saves to `<session-dir>/videos/1.mp4` (NOT `images/`). Use the same sessionId from the JSON response to locate it.

**Tip: ask Grok to copy output to a known path.** Grok Build can `cp` its own output if you write "Save the result to /path/to/file.jpg" in the prompt. This avoids the session-dir hunt entirely. (Verified 2026-07-12: Grok copied to `~/Desktop/Bo-RAW-2026-07-11/edits/bo-cyberpunk-portrait.jpg` when asked.)

### Full image-gen example (verified)

```bash
cd /Users/admin/Code/github.com/MEYD-605/cartographer-oracle
echo 'Generate one image: a cartoon anvil mascot, sticker style. Save to outputs/test.png' > /tmp/grok-prompt.txt
grok --prompt-file /tmp/grok-prompt.txt --output-format json
# → image_gen executes, outputs/test.png created (1024×1024 PNG)
```

### With model override

```bash
echo 'Load skill imagine. Call image_edit once: image=<ref> prompt=<desc>. Reply with output path only.' > /tmp/grok-prompt.txt
grok -m grok-build --always-approve --prompt-file /tmp/grok-prompt.txt --output-format json
```

## When to use this pattern

- **From Hermes DM** — Bo asks for image/video and you need to call Grok `image_gen` / `image_edit` / `image_to_video`.
- **Headless / no real TTY** — cron jobs, background scripts, `execute_code`.
- **Any non-interactive context** where the Grok TUI cannot initialize.

## Contrast: real terminal (tmux session)

From inside an actual tmux session (e.g. `05-gmforge`), the short form works:

```bash
grok -m grok-build --always-approve -p "prompt here"
```

But from Hermes terminal, prefer `--prompt-file` to avoid the TUI crash.
