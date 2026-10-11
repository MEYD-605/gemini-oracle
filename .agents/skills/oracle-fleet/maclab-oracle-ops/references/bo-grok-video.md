# Bo portrait video — Grok Imagine

maclab 2026-07-02. Bo face: always **image_edit** frame first (ref or latest edit in `edits/`), then animate.

## Path A — Grok Build native `image_to_video`

### From Hermes terminal (`--prompt-file` — verified 2026-07-11)

`grok -p` fails from Hermes. Use `--prompt-file`:

```bash
IMG="<path-to-source-image>"
cat > /tmp/grok-bo-video.txt << EOF
Use image_to_video with the source image at ${IMG}. <motion prompt>. Save the video to <output-path>.mp4
EOF
grok --prompt-file /tmp/grok-bo-video.txt --output-format json
# → JSON .text contains output path; typical output: 480×640, ~6s, H.264, ~925KB
```

### From real terminal (tmux session)

```bash
IMG="/path/to/edits/2026-07-02_bo-portrait-luxury.jpg"
grok -m grok-build --always-approve --cwd "$HOME" -p \
  "Skill imagine. Call image_to_video ONCE (native tool, not use_tool). Source image: ${IMG}. Prompt: Slow cinematic push-in, gentle blink, soft rim light, photorealistic. Duration 6 seconds, aspect 9:16. Reply with exact output video path only."
```

### What to expect

- Native `image_to_video` output: ~6s, pixels follow source aspect, H.264
- Example verified run (2026-07-11): **480×640**, ~6s, 925KB, from 672×896 source
- Grok may also offer `reference_to_video` (reference-based video generation)
- Output often under `~/.grok/sessions/.../videos/N.mp4`
- **ffprobe** to verify actual pixels
- `cp` to `bo-personal/edits/` · `MEDIA:/absolute/path`

## Path B — Explicit **480p** / **720p** (xAI API)

```bash
python3 "$HOME/Code/github.com/MEYD-605/gmgrok-oracle/ψ/tools/xai-video-one.py" \
  --image "$IMG" \
  --out "$HOME/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/edits/YYYY-MM-DD_bo-test-480p-9x16.mp4" \
  --prompt "Slow cinematic push-in, gentle natural blink, soft golden rim light, photorealistic portrait, minimal motion." \
  --duration 6 \
  --aspect-ratio 9:16 \
  --resolution 480p
```

Verified **480p** + **9:16**: **480×848**, 24 fps, ~6s, ~1.6 MB (2026-07-02).

| `--resolution` | Typical 9:16 (verify with ffprobe) |
|----------------|-------------------------------------|
| `480p` | 480×848 |
| `720p` | taller tier per API (use ffprobe) |

Auth: `~/.grok/auth.json` or `XAI_API_KEY` (see script `load_token()`).

## Bo FAQ (short reply)

- **ความยาว:** API script 1–15s; Imagine skill prefers **6s** shots; Build native **6s** or **10s**
- **สัดส่วน:** `9:16`, `16:9`, `1:1`, … on API; Build follows source image aspect
- **ไม่มี text-to-video** — need a still first

## Concat multi-shot

`ffmpeg -f concat -safe 0 -i list.txt -c copy out.mp4` — same resolution/fps across shots.