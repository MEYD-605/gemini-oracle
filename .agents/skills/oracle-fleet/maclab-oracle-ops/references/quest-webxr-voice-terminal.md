# Quest 1 / WebXR Voice Terminal & maw-rs Gateway Integration Architecture

Proven pattern for voice-controlled terminals (ttyd / sshx / xterm.js) inside Oculus Quest 1 / WebXR connected to MacLab and the `maw-rs` agent fleet.

## Hardware & Environment Constraints
- **Device:** Oculus Quest 1 (Android 10, Snapdragon 835, 4 GB RAM, dual-OLED).
- **Web Browser:** Quest Browser mirrors `chrome_android` for Web Speech API (`webkitSpeechRecognition` supported with Google cloud backend).
- **In-Browser STT Limit:** SD835/4 GB lacks CPU/DSP overhead for in-browser Whisper WASM (runs >5× real-time, unusable). All Whisper/ASR transcription must be offloaded over LAN/Tailscale to MacLab or streamed via on-device native APK.

## Three-Tier Architecture

### Tier A: Push-to-Talk (PTY) + MacLab Whisper Server (Primary Production)
1. **Quest WebXR Client:**
   - WebXR Gamepad API captures Right Controller Grip (`gp.buttons[1].pressed`).
   - `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } })` captures audio during grip down.
   - `MediaRecorder` buffers `audio/webm;codecs=opus` chunks.
   - Grip release flushes blob to MacLab Voice Gateway over Tailscale WSS/HTTPS.
2. **MacLab Voice Gateway & STT Host:**
   - `whisper.cpp` server running `./server -m models/ggml-base.en-q5_1.bin -p 8 --port 9090`.
   - ffmpeg transcodes `webm` -> WAV (16 kHz mono) (~30-60 ms overhead).
   - End-to-end transcription latency: **300–900 ms**.
3. **Command Router & Execution:**
   - `terminal <text>` -> typed directly into xterm.js pane (`ttyd` WebSocket).
   - `hey <agent> <msg>` -> executes `maw hey <agent> "<msg>"`.
   - `run <session> <cmd>` -> executes `maw run <session> "<cmd>"`.
   - `wake <agent> [prompt]` -> executes `maw wake <agent> --prompt "<prompt>"`.

### Tier B: Web Speech API (Quick-Win / Fallback)
- Utilizes native `webkitSpeechRecognition` inside Quest Browser.
- Zero local backend setup required.
- **Drawbacks:** Requires active internet connection to Google STT API; higher latency (0.5–2s).
- Fall back to Tier A when `onerror` fires with `network` issue.

### Tier C: On-Device Wake-Word (sherpa-onnx KWS) (Phase 2 Hands-Free)
- Sideloaded Android APK running `sherpa-onnx` Keyword Spotter (KWS) on SD835 (3.3M zipformer model, ~80 MB RAM, <10% single CPU core).
- Listens for "Hey Maw" wake-word offline on device.
- Exposes local WebSocket on Quest (`ws://127.0.0.1:9092/kws`) to wake up Quest Browser WebXR PTT loop hands-free.

## maw-rs Gateway Integration Surface
- **Plugin Manifest (`plugin.json`):**
  - Requires `engine.serve` object with `command` and `prefix` starting with `/api/` (e.g. `/api/voice`).
  - Capabilities needed: `proc:exec:maw`, `tmux:send`, `net:fetch:stt`.
- **Security Guard & Tailscale:**
  - Expose gateway via `tailscale serve --bg 9091` for automatic TLS.
  - Capped stdout return (e.g. max 4000 chars) to prevent terminal panel overflow.
  - Guard self-referencing targets (`maw hey maclab:05-gmforge` on maclab node drops to tmux pane send instead of CLI hey call).
