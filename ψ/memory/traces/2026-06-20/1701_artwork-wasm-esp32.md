---
query: "artwork-wasm-esp32"
target: "gemini-oracle"
mode: deep
timestamp: 2026-06-20 17:01
friction_score: 0.7
coverage: [oracle, files, git, cross-repo]
confidence: high
---

# Trace: artwork-wasm-esp32

**Target**: gemini-oracle
**Mode**: deep | **Friction**: 0.7 | **Confidence**: high
**Time**: 2026-06-20 17:01

## Oracle Results
None

## Files Found
In repository `workshop-04-esp32-wasm`:
- `submissions/02-Nova/README.md` (Desk-pet character pack structure & generation script).
- `submissions/02-Nova/characters/nova/` (idle, busy, attention, celebrate, sleep, heart, dizzy GIFs).
- `submissions/03-lord-knight/README.md` (WASM-based GIF decoder on WAMR/wasm3).
- `submissions/03-lord-knight/webflasher/index.html` (Web flasher interface and web simulation).
- `submissions/07-nova/README.md` (Documents books and Novamon pipeline).

## Git History
None in this repo. The workspace `workshop-04-esp32-wasm` was cloned via `ghq get` in this session.

## GitHub Issues/PRs
None

## Cross-Repo Matches
- The repository `workshop-04-esp32-wasm` is cloned at `/root/.no6-home/ghq/github.com/the-oracle-keeps-the-human-human/workshop-04-esp32-wasm`.

## Session History (from /dig)
- **ESP32 WASM Desk-Pet Workshop (Workshop 04)**: Wednesday, June 17, 2026.
- **Core Goal**: Hand-assemble or compile a standalone, import-free `.wasm` module, embed it into ESP32 firmware, run it on-chip via wasm3/WAMR interpreter, and build a Web Flasher using `esp-web-tools` to write the firmware and assets directly over WebSerial.

## Friction Analysis
**Score**: 0.7 — Visible (Files + high confidence)
**Coverage**: [oracle, files, git, cross-repo]
**Goal check**: Yes, successfully traced the ESP32 wasm artwork and web flashing integration.

## Summary
The trace maps the full pipeline of the ESP32 WASM Desk-Pet (Workshop 04) which integrates procedural artwork, WebAssembly virtual machine interpretability on low-power microcontrollers, and browser flashing integrations.

Key components traced:
1. **Procedural Artwork**: Designed procedurally via Python/Pillow in `02-Nova` to output 7 animation states of the `Novamon` cyber-puppy at 96×100 px native resolution. These are packed into a 3MB LittleFS storage image (`nova-storage.bin`).
2. **On-Chip WASM Interpreters**:
   - **wasm3** (PlatformIO/Arduino): Employs wasm interpreter library to run WASM reactor modules (such as `sentinel.wasm`).
   - **WAMR (WebAssembly Micro Runtime)** (ESP-IDF): Used in `03-lord-knight` to execute `gifapp.wasm` directly on the ESP32-S3 CPU, enabling hardware sandboxed rendering.
3. **Web Flasher (Web & Hardware Bridge)**: Built using `esp-web-tools` to let users flash compiled binaries and assets directly from desktop Chrome/Edge over WebSerial API. Includes an in-browser WebAssembly simulation (`emcc` build `gifdec.js`) of the GIF decoder before writing to physical devices.
