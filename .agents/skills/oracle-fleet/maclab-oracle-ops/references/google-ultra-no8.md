# Google Ultra — No.8 Antigravity on maclab

Bo subscription quota shows in tmux `08-agy-nano2` statusline (e.g. Flash/Opus %).

## Prove auth (no token dump)

```bash
test -f /Users/admin/.no8-home/.gemini/antigravity-cli/antigravity-oauth-token && echo ok
HOME=/Users/admin/.no8-home agy models  # only when load-guard NOT BLOCK
```

Fleet doc: `agy-nano2-oracle/CLAUDE.md` — isolated HOME so Ultra login ≠ No.6.

## Execution preference (avoid hang)

1. `load-guard-check.sh` — must pass
2. Bo explicit **GO** (not implied by “ลองใช้สิทธิ์” while load high)
3. **Prefer** one prompt in live tmux `08-agy-nano2` over spawning extra headless `agy` from Hermes
4. Outputs → copy to `lord-knight-oracle/ψ/data/maclab-home/bo-personal/edits/` · `MEDIA:` in Discord

## Capabilities (Bo asks)

- **Image:** Nano Banana / Imagine via Antigravity tools in agy session
- **Video:** Flow / Veo-style generation in same lane (Thai lip-sync experiments — prompt in session)
- **Aspects:** 9:16, 16:9, 1:1 — ask agy to export each; verify with `ffprobe` on mp4

## Fallback when Ultra paused

- Stills/video billable: **Grok Build** + **`gmgrok-oracle/ψ/tools/xai-video-one.py`** (`480p`/`720p`) — see `references/bo-grok-video.md`