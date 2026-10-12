# Learning Synthesis: LightCraft — Open-Source Pure-Rust Lightroom & Agent-First MCP Architecture

**Date**: 2026-10-12 12:47 +07  
**Author**: No.6 Gemini (Research Specialist & Pack Leader)  
**Target Repository**: `github.com/storytold/lightcraft` (ArtCraft Suite)  
**Installed Target**: MacLab HQ (`/Applications/LightCraft.app`, `/Users/admin/.local/bin/lightcraft-cli`)  
**Trigger**: Directive from Master Bo (`borde9902`) — *"ไป/learn ไห้เรียบร้อย"*

---

## 1. Executive Summary

**LightCraft** (by `storytold`, part of the **ArtCraft** creative suite) is an open-source, clean-room reimplementation of Adobe Lightroom built from scratch in **pure Rust**. Within weeks of its release, the project surged past 10,000+ stars on GitHub due to two breakthrough characteristics:
1. **Zero Subscriptions & Zero Telemetry**: A high-performance, non-destructive photo library and RAW developer that runs natively across macOS, Windows, Linux, and WebAssembly without C/C++ legacy dependencies or GPL baggage.
2. **Native Agent-First Design (Built for MCP)**: Unlike legacy photo software where automation is an afterthought (COM, AppleScript, or fragile GUI macros), LightCraft treats AI agents as first-class citizens. Every slider, crop handle, mask, and menu action is dispatchable via a built-in **Model Context Protocol (MCP)** server (`lightcraft-cli mcp`) and JSON-RPC CLI.

---

## 2. Core Architectural Pillars

### Pillar 1: Layered Clean-Room Rust Architecture (27 Micro-Crates)
LightCraft strictly enforces dependency layering (`cargo xtask layers`) across 5 levels (L0 to L5) to guarantee maintainability and prevent circular dependencies:
- **L0 (Primitives)**: `geom`, `color` (OkLCh, Display P3, sRGB), `raster` (f32 SIMD/Rayon buffers), `tiff`.
- **L1 (Formats & Domain Engines)**: `raw` (pure Rust decoders for Sony ARW, Canon CR2/CR3, Nikon NEF, Fuji RAF, DNG), `codecs` (JPEG, PNG, WebP, AVIF), `meta` (EXIF/XMP/IPTC), `develop` (adjustment calculations).
- **L2 (Processors)**: `denoise`, `inpaint` (content-aware fill), `faces` (face detection), `segment` (subject/sky masking), `merge` (HDR, Panorama, HDR-Pano).
- **L3 (Pipeline & State)**: `pipeline` (32-bit float non-destructive rendering graph), `preview` (caching), `catalog` (asset indexing).
- **L4 (Dispatch)**: `engine` (central command registry, undo/redo stack, parameter parsing).
- **L5 (Frontends & Protocol)**: `ui-egui` (immediate-mode GPU desktop GUI), `mcp` (native JSON-RPC 2.0 MCP server over stdio).
- **Applications**: `lightcraft` (desktop GUI binary) and `lightcraft-cli` (headless runner, batch engine, and MCP server binary).

### Pillar 2: The "Never Crash" Production Invariant
A hard-coded development standard enforced via Clippy (`#![deny(clippy::unwrap_used, clippy::expect_used, clippy::panic, clippy::todo)]`):
- **Zero Panics in Non-Test Code**: No `unwrap()`, `expect()`, `panic!`, `unimplemented!`, or `todo!`. All operations must return explicit `Result<T, Error>`.
- **No `unsafe` Code**: `unsafe` is strictly forbidden across all production crates with `#![forbid(unsafe_code)]`, with exactly one isolated exception in `crates/sysmem` (`malloc_zone_pressure_relief` FFI call to return freed memory pages to macOS).
- **Input Hostility**: Input-derived numbers (dimensions, byte offsets, user arguments) are treated as hostile, using checked/saturating arithmetic and strict depth caps to prevent buffer overflows or OOM loops.
- **Panic Hook Safety Net**: In the rare event of an unhandled panic, `catch_unwind` wraps the dispatch loop, displaying a recover dialog rather than crashing the process and corrupting user catalogs.

### Pillar 3: "Everything is a Command" Uniform Entry Point
Every single capability within LightCraft is registered in `crates/engine` as a discrete Command with:
- A unique string ID (e.g. `develop.set`, `photo.rate`, `mask.add`, `app.export`).
- JSON-schema validated parameters.
- Built-in permission and enablement checks (`enabled()`).
- Identical dispatch mechanics whether invoked by:
  1. A keyboard shortcut or menu item in the egui desktop UI.
  2. A CLI invocation (`lightcraft-cli run develop.set control=light.exposure value=0.7`).
  3. A TCP control socket (`lightcraft --control 7980`).
  4. An MCP Tool call (`cmd_develop_set` or `run_command`).

### Pillar 4: Native Agent-First Closed-Loop Vision
LightCraft solves the classic agent blindness problem in creative software:
- **`lightcraft-cli mcp`**:
  - Exposes helper tools: `import`, `query_photos`, `select_photos`, `list_controls`, `get_develop`, `set_develop`, `render_preview`, `export`, and `merge`.
  - Exposes dynamic commands: `cmd_<command_id>` for all engine actions.
- **Headless & Live-App Modes**:
  - **Headless Mode**: Runs entirely in-process/background, allowing agents on remote servers to import RAW files, process them, and export final JPEGs without a GUI display.
  - **Live Connect Mode** (`--connect 127.0.0.1:7980`): Agents connect to a running desktop application, inspecting live state, triggering UI actions, and capturing real-time screenshots (`ui.screenshot`).
- **Closed-Loop Visual Inspection**: The `render_preview` tool returns base64 image blocks directly in MCP tool results, enabling multimodal LLMs (like Gemini 3.8 Flash) to critique the edit, adjust highlights/shadows, and refine tone iteratively until perfection.

### Pillar 5: Scientific 32-Bit Float Color Pipeline (OkLCh Space)
- **Scene-Referred Non-Destructive Editing**: Adjustments never alter original RAW or image files. All edits reside in non-destructive JSON state / XMP sidecars.
- **Edge-Aware Tone Mapping**: Uses guided filters on log-luminance. Pulling −100 Highlights recovers blown skies smoothly without unnatural gray halos.
- **Perceptual Color Space (OkLCh)**: White balance, 8-band Color Mixer, and 3-way cinematic Color Grading compute in OkLCh space, avoiding hue shifts when boosting saturation or exposure.

---

## 3. Direct Application to Oracle Fleet & MacLab Projects

### 1. Song Wat Craft Beer Bar — AI Photo Kiosk & ID Studio (`uniform_composer.py`)
- **Challenge**: The Song Wat Photo Kiosk (partnered with Atom on Note 20 Ultra) requires automated, consistent studio lighting, color grading, skin-tone preservation, and uniform compositing.
- **Solution via LightCraft**:
  - Integrate `lightcraft-cli` into the backend ingest loop.
  - After `uniform_composer.py` masks and composites Thai student uniforms or suits, invoke `lightcraft-cli render in.jpg -o out.jpg --set light.exposure=0.15 --set effects.clarity=10 --set color.vibrance=8` to execute instantaneous, film-grade batch output.
  - Eliminates the need for expensive third-party photo processing APIs or subscription software.

### 2. Automated RAW Culling & Grade Assistant for Bo's Sony Cameras
- **Challenge**: Sorting and grading thousands of high-resolution Sony ARW files (`/Users/admin/Code/sony-camera-tools/` and `aftershoot-re/`).
- **Solution via LightCraft**:
  - Connect No.6 Gemini to `lightcraft-cli mcp`.
  - No.6 can autonomously run `query_photos`, inspect metadata, discard blurry/closed-eye shots (`photo.flag`), apply custom color presets, and export high-res deliverables.

### 3. Pure Rust Microservice for Fleet Cloud & Edge Nodes
- Because LightCraft is pure Rust and compiles to static binaries, `lightcraft-cli` can be cross-compiled for:
  - **MacLab HQ (iMac Pro, x86_64 macOS)**: ✅ Installed and active.
  - **ClubSGame (Handheld, x86_64 Windows 11 / WSL)**: Native Windows binary or WSL Linux.
  - **Edge Nodes (Termux / Linux)**: Headless aarch64 build for mobile/Raspberry Pi kiosks.

---

## 4. Local Deployment Invariants on MacLab HQ

| Component | Path / Location | Verification Command | Status |
|---|---|---|---|
| **GUI Desktop App** | `/Applications/LightCraft.app` | `open /Applications/LightCraft.app` | ✅ Installed (v0.6.0 Universal) |
| **CLI & MCP Tool** | `/Users/admin/.local/bin/lightcraft-cli` | `lightcraft-cli --version` | ✅ `0.6.0` (Global PATH) |
| **Source Code** | `/Users/admin/Code/github.com/storytold/lightcraft` | `git status` | ✅ Cloned (main branch) |
| **MCP Integration** | stdio JSON-RPC 2.0 | `lightcraft-cli mcp` | ✅ Verified functional |

---

🤖 *Codified by No.6 Gemini — Research Specialist & Pack Leader · AURA Pillar*
