# maw-relay — auto-relay Hermes replies through maw federation

## Problem it solves

Every fleet seat runs `hermes chat --tui` inside its own tmux pane. When one
seat sends a job via `maw hey <target> "...answer this and reply via maw hey
<origin>"`, the receiving agent processes it and types its answer on its own
screen — but nothing forces it to actually run `maw hey` back. Hermes has no
built-in "reply to sender" concept for tmux/CLI sessions (unlike Claude Code's
`Stop` hook, which the original Oracle `hey`/`inbox` skills were designed
around). Without an explicit instruction *and* the agent remembering to send
it, answers just sit on the receiving pane's screen forever — this is the
"we're typing at each other but nothing arrives" failure mode.

## Fix: a `post_llm_call` plugin hook

Hermes plugins (`~/.hermes-<seat>/plugins/<name>/`) can register
`post_llm_call`, which the docs confirm fires **once per successful turn, in
both CLI and gateway sessions** (unlike gateway-only hooks, which never fire
for tmux CLI panes). The plugin:

1. Reads the **incoming** `user_message` for this turn (not the reply).
2. Regex-matches a `maw hey <target>` instruction embedded in it (the pattern
   the fleet already uses when relaying EXEC/audit requests between seats,
   e.g. `"...ตอบกลับ maw hey maclab:01-lord-knight"`).
3. If found, shells out `maw hey <target> "<assistant_response, truncated>"`
   automatically — no explicit action required from the model.
4. If no such instruction is present, does nothing (keeps normal
   Discord/user conversation untouched — doesn't spam every turn).

All errors are swallowed (hooks must never crash the agent loop).

## Files

```
~/.hermes-<seat>/plugins/maw-relay/
├── plugin.yaml     # name/version/description
└── __init__.py     # register(ctx) -> ctx.register_hook("post_llm_call", relay_reply)
```

Enable via `hermes config set plugins.enabled` (append `maw-relay` to the
existing list — don't clobber `image_gen/xai` etc. that may already be
there) — do this via `python3 -c "import yaml; ..."` read-modify-write since
`hermes config set` on a list key writes it as a numbered dict, not a YAML
list (`args.0`, `args.1`, ...), which breaks list-typed config values.

## Deploy checklist (per seat)

1. `mkdir -p ~/.hermes-<seat>/plugins/maw-relay && cp` both files in from a
   known-good seat.
2. Read-modify-write `plugins.enabled` in that seat's `config.yaml`.
3. Bounce **both** processes for that seat — they are independent and each
   needs its own reload:
   - launchd gateway: `launchctl kickstart -k gui/501/ai.hermes.gateway-<seat>`
   - any long-running TUI pane: `tmux respawn-pane -k -t <session> -c <cwd>
     "env HERMES_HOME=~/.hermes-<seat> <venv>/bin/hermes chat --tui --yolo"`
4. Verify load (don't just trust "no errors"):
   - `hermes plugins list` (via that seat's venv) should show `maw-relay |
     enabled`.
   - `ls -la ~/.hermes-<seat>/plugins/maw-relay/__pycache__/*.pyc` mtime
     should match the new process start time (`ps -p <pid> -o lstart`).
5. Live-fire test: `maw hey <session> "reply with X, then stop, don't call
   maw hey yourself — let the plugin handle it. reply via maw hey <origin>"`
   and confirm `<origin>` receives it **without** the target agent explicitly
   calling `maw hey` in its own tool calls — that's the proof the hook fired,
   not the model's own discipline.

## Known limitation

The reply's `maw hey` sender identity is inferred by `maw-rs` from the tmux
window/process context at the OS level, not from Hermes's own
`agent.environment_hint`. This means auto-relayed messages currently arrive
tagged with the tmux window name (e.g. `[maclab:python3.11]`,
`[maclab:hermes-chat]`) instead of the seat's proper handle (e.g.
`[maclab:04-mimo]`). The message routes to the right place; only the
cosmetic signature is wrong. Not yet fixed — would need the plugin to shell
`maw hey --sig "<seat>"` or equivalent if `maw-rs` exposes an override flag.
