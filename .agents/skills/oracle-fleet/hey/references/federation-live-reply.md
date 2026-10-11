# Federation live-reply notes

## When `maw hey` is enough
- Use for one-way delivery into another oracle's inbox.
- It confirms delivery, but it does **not** prove the target is interactive or that a reply will appear in the same session immediately.

## When you need a live back-and-forth
- Resolve the target session first with `maw wake <target> --from <origin> --dry-run`.
- Then wake/create the live session with `maw wake <target> --from <origin> --prompt "..."`.
- If the session is already open, use `maw run <session> "<cmd>"` to inject a command into that live shell.
- Use `maw attach <session>` or `tmux capture-pane -t <session> -p` for readback.

## Discovery helpers
- `maw ls --json` shows live local sessions.
- `maw wake all --list` lists wakeable sessions.
- `maw attach <session> --print` resolves the actual tmux target.

## Pitfall
- A live session may be a plain shell, not the intended agent runtime. If the target shell lacks the expected command in PATH, it is still a valid session for `maw run`, but not necessarily the oracle runtime you expected.
