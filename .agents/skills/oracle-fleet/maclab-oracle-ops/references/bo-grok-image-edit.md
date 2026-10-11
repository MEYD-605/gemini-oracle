# Bo portrait — grok-build `image_edit`

Proven maclab 2026-07-02.

## PREFERRED: xAI Direct API (2026-07-12 — 3× faster, explicit output)

```bash
python3 ~/.hermes-no5/skills/imagine/scripts/bo-image-edit.py \
  --ref /path/to/face.jpg \
  --prompt "prompt here" \
  --out /path/to/output.jpg \
  --aspect 9:16
```

- ~9s vs ~22s through Grok CLI
- Explicit `--out` path — no session dir hunting
- Auth: `~/.grok/auth.json`
- Supports `--extra-ref` for 2-image outfit/setting lock

## FALLBACK: Grok CLI (--prompt-file)

`grok "prompt" -p` fails from Hermes terminal with `Device not configured (os error 6)` (even with `pty=true`). Use `--prompt-file` instead.

```bash
REF="<path-to-face-reference>"
cat > /tmp/grok-bo-edit.txt << EOF
Use image_edit with the reference image at ${REF}. <2-5 sentence prompt>. Save to <output-path>.png
EOF
grok --prompt-file /tmp/grok-bo-edit.txt --output-format json
# → JSON response: parse .text for output path
```

### From real terminal (tmux session)

Inside an actual tmux session the short `-p` form works:

```bash
REF="$HOME/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/face-reference/06-IMG_20260529_171346.png"
grok -m grok-build --always-approve --cwd "$HOME" -p \
  "Load skill imagine. Call image_edit exactly once: image=$REF prompt=<2-5 sentences>. Reply with absolute output path only."
```

### Reference image sources (PRIORITY ORDER — never use screenshots)

| Priority | Source | Path | Notes |
|----------|--------|------|-------|
| 1 | **Live DM images** (Bo just sent) | `~/.hermes-no5/cache/images/img_*.jpeg` | Check what arrived this session; Bo may send fresh refs |
| 2 | **Discord inbox photos** | `~/.claude/channels/discord-no0/inbox/*.jpg` | Real camera photos, typically 3008×4000; sort by size for best quality |
| 3 | **Canonical face ref dir** | `$HOME/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/face-reference/` | Curated refs |
| 4 | **Recent edit** | `bo-personal/edits/YYYY-MM-DD_<slug>.jpg` | Use latest if chaining edits |
| ❌ | ~~Desktop screenshot~~ | ~~`~/Desktop/bo-reference-screenshot.jpg`~~ | **NEVER** — it's a phone screenshot, not a face photo |

**CRITICAL:** Before picking a reference, `file <path>` to verify it's a real photo (JPEG, large dimensions like 3008×4000), not a small screenshot.

## After generation

1. Parse output path from JSON `text` field (or stdout in tmux)
2. **STOP and send the image to Bo** via `MEDIA:/absolute/path` — do NOT auto-chain to video
3. Wait for Bo's reaction before proceeding to any video step
4. When Bo says "เก็บไว้ด้วย", copy to `ψ/media/personal/` in the active repo (NOT scattered across `outputs/`)
5. Reply Bo with `MEDIA:/absolute/path`

**Media organization rule:** all generated portraits → `ψ/media/personal/`. Reference images → `ψ/media/personal/refs/`. Do NOT use `outputs/` as permanent storage — it's a scratch dir.

## Video (same vault)

No text-to-video. Per `~/.grok/skills/imagine/SKILL.md`: `image_edit` frame → `image_to_video` (6s/10s) → `ffmpeg -f concat -c copy` for multi-shot.

- **Native clip:** `grok -m grok-build` + `image_to_video` (not `use_tool`) — `references/bo-grok-video.md`
- **Explicit 480p/720p:** `gmgrok-oracle/ψ/tools/xai-video-one.py` or `scripts/grok-bo-video-480p.sh`

**Luxury “สวยขึ้น” prompt hint:** rim light, shallow DOF, subtle film grain, magazine cover, same person likeness.

## Policy

`bo-personal/CONSTRUCTURE.md` — likeness via `image_edit` + ref only.