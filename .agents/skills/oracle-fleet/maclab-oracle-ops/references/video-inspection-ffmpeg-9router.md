# Inspecting Video Attachments via FFmpeg & 9router Vision

When a user attaches a video file (e.g. `VID_*.mp4` in `~/.hermes-no5/cache/documents/`) and the `video` tool is disabled (`hermes tools list` showing `video: disabled`), inspect the video directly using local `ffmpeg` frame extraction + 9router auxiliary vision endpoint.

## Workflow

### 1. Extract Keyframes & Audio with FFmpeg
```bash
mkdir -p /tmp/vidframes
# Sample 1 frame every 3-4 seconds
ffmpeg -y -i /path/to/video.mp4 -vf "fps=1/4" /tmp/vidframes/frame_%03d.jpg
# Extract audio track for separate inspection if needed
ffmpeg -y -i /path/to/video.mp4 /tmp/vidframes/audio.mp3
```

### 2. Analyze Frames via 9router Auxiliary Vision Model (`ag/gemini-3.6-flash-high`)
Because 9router may return SSE streamed chunks (`data: {"choices": ...}`) even when `"stream": false` is passed, parse both standard JSON and fallback SSE stream chunks in Python.

```python
import yaml, json, base64, urllib.request, glob

cfg = yaml.safe_load(open('/Users/admin/.hermes-no5/config.yaml'))
api_key = cfg['providers']['9router']['api_key']
base_url = cfg['providers']['9router']['base_url']

def analyze_frame(img_path, prompt):
    with open(img_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    payload = {
        "model": "ag/gemini-3.6-flash-high",
        "stream": False,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
            ]
        }],
        "max_tokens": 400
    }
    req = urllib.request.Request(
        base_url + "/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode()
    try:
        result = json.loads(raw)
        return result['choices'][0]['message']['content']
    except Exception:
        # Fallback: parse SSE stream chunks if 9router streams output
        text = ""
        for line in raw.splitlines():
            if line.startswith("data: ") and line.strip() != "data: [DONE]":
                try:
                    chunk = json.loads(line[6:])
                    delta = chunk['choices'][0].get('delta', {})
                    if 'content' in delta and delta['content']:
                        text += delta['content']
                except Exception:
                    pass
        return text

for frame in sorted(glob.glob('/tmp/vidframes/frame_*.jpg')):
    desc = analyze_frame(frame, "Describe this video frame: who is visible, actions, text overlays, setting.")
    print(f"=== {frame} ===\n{desc}\n")
```

## Key Insights & Pitfalls
- **9router SSE Streaming:** 9router's local proxy endpoint (`http://127.0.0.1:20128/v1/chat/completions`) streaming behavior on `ag/gemini-3.6-flash-high` requires handling `data: ` line chunks when `json.loads(raw)` fails.
- **Cross-cut Video Identification:** When analyzing interview/podcast style videos, check for subject alternating across frame indices to detect cross-cutting between different speakers or AI avatars.
