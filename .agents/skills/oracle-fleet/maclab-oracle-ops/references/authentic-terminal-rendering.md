# Authentic Terminal Screenshot Rendering (VT100 Buffer -> PNG)

When asked to capture a real terminal screenshot (e.g. for `claude login` OAuth prompts or interactive CLI status), NEVER generate synthetic mockup images using PIL/Pillow or image generation.

## User Frustration Signals
- "ไม่ได้สร้างรูปให้จับภาพหน้าจอที่มัน login มา"
- "เอาภาพจริงๆเว้ย"
- "กูอยากเห็นภาพจริงกูไม่ได้ให้มึงทำรูป"

## Approved Options

### Option 1: Live VT100 ANSI Buffer Rendering
Render the raw ANSI buffer from tmux into character cells using `pyte` and draw with `Pillow`:
```python
import subprocess
import pyte
from PIL import Image, ImageDraw, ImageFont

raw = subprocess.check_output(['tmux', 'capture-pane', '-e', '-t', '88-sombo:0', '-p']).decode('utf-8', errors='ignore')

cols, rows = 100, 30
screen = pyte.Screen(cols, rows)
stream = pyte.Stream(screen)
stream.feed(raw)

char_w, char_h = 9, 18
width = cols * char_w + 30
height = rows * char_h + 30

img = Image.new('RGB', (width, height), color=(20, 20, 20))
draw = ImageDraw.Draw(img)

try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 14)
except:
    font = ImageFont.load_default()

for y, row in screen.buffer.items():
    for x, char in row.items():
        fg = (210, 210, 210)
        if char.fg != 'default':
            if char.fg in ['cyan', 'blue']: fg = (80, 180, 255)
            elif char.fg == 'green': fg = (80, 230, 120)
            elif char.fg == 'yellow': fg = (255, 200, 80)
            elif char.fg == 'red': fg = (255, 90, 90)
            elif char.fg == 'magenta': fg = (220, 120, 255)
        
        draw.text((15 + x * char_w, 15 + y * char_h), char.data, fill=fg, font=font)

img.save('/tmp/real_terminal_snapshot.png')
```

### Option 2: Live noVNC Web Interface (Interactive Real Screen)
1. Run per-user VNC display (`tightvncserver :3 -geometry 1920x1080 -depth 24`).
2. Run `websockify` bridge (`websockify --web=/path/to/novnc 6090 localhost:5903`).
3. Provide the direct noVNC URL (`http://<host>:6090/vnc.html`) so Bo can view and interact with the real terminal screen live.
