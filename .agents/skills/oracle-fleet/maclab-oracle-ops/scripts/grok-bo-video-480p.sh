#!/usr/bin/env bash
# Bo portrait clip at grok-imagine-video 480p (9:16 default)
set -euo pipefail
IMG_DEFAULT="${HOME}/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/edits/2026-07-02_bo-portrait-luxury.jpg"
IMG="${BO_VIDEO_SOURCE:-$IMG_DEFAULT}"
EDITS="${HOME}/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/edits"
TOOL="${HOME}/Code/github.com/MEYD-605/gmgrok-oracle/ψ/tools/xai-video-one.py"
PROMPT="${BO_VIDEO_PROMPT:-Slow cinematic push-in, gentle natural blink, soft golden rim light, photorealistic portrait, minimal motion.}"
DUR="${BO_VIDEO_DURATION:-6}"
AR="${BO_VIDEO_ASPECT:-9:16}"
RES="${BO_VIDEO_RESOLUTION:-480p}"
SLUG="${BO_VIDEO_SLUG:-bo-test-${RES}-$(date +%Y-%m-%d)}"
OUT="${EDITS}/${SLUG}.mp4"
[[ -f "$IMG" ]] || { echo "MISSING image: $IMG" >&2; exit 1; }
[[ -f "$TOOL" ]] || { echo "MISSING tool: $TOOL" >&2; exit 1; }
python3 "$TOOL" --image "$IMG" --out "$OUT" --prompt "$PROMPT" --duration "$DUR" --aspect-ratio "$AR" --resolution "$RES"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of default=noprint_wrappers=1 "$OUT"
echo "MEDIA:$OUT"