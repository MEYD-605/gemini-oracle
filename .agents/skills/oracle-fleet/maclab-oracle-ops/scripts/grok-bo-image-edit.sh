#!/usr/bin/env bash
# Bo likeness via grok-build native image_edit
set -euo pipefail
REF_DEFAULT="${HOME}/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/face-reference/06-IMG_20260529_171346.png"
REF="${BO_FACE_REF:-$REF_DEFAULT}"
EDITS="${HOME}/Code/github.com/MEYD-605/lord-knight-oracle/ψ/data/maclab-home/bo-personal/edits"
PROMPT_BODY="${BO_IMAGE_PROMPT:-Cinematic portrait of the same person, golden hour, soft bokeh, photorealistic. No text or watermarks.}"
SLUG="${BO_IMAGE_SLUG:-bo-portrait-$(date +%Y-%m-%d)}"
[[ -f "$REF" ]] || { echo "MISSING ref: $REF" >&2; exit 1; }
[[ -f "${HOME}/.grok/auth.json" ]] || { echo "MISSING ~/.grok/auth.json" >&2; exit 1; }
PROMPT="Load skill imagine. Call image_edit exactly once: image=${REF} prompt=${PROMPT_BODY} Reply with absolute output path only."
[[ $# -gt 0 ]] && PROMPT="Load skill imagine. Call image_edit exactly once: image=${REF} prompt=$* Reply with absolute output path only."
LOG="/tmp/grok-bo-image-edit-$(date +%s).log"
grok -m grok-build --always-approve --cwd "${HOME}" -p "$PROMPT" 2>&1 | tee "$LOG"
OUT=$(grep -Eo '/Users/[^[:space:]]+/images/[0-9]+\.(jpg|png)' "$LOG" | tail -1 || true)
[[ -z "$OUT" || ! -f "$OUT" ]] && OUT=$(grep -oE '\*\*Output path:\*\* `[^`]+`' "$LOG" | tail -1 | sed 's/.*`\(.*\)`.*/\1/' || true)
[[ -n "$OUT" && -f "$OUT" ]] || { echo "FAIL: see $LOG" >&2; exit 1; }
EXT="${OUT##*.}"
DEST="${EDITS}/${SLUG}.${EXT}"
mkdir -p "$EDITS"
cp -f "$OUT" "$DEST"
echo "OK: $DEST"
echo "MEDIA:$DEST"