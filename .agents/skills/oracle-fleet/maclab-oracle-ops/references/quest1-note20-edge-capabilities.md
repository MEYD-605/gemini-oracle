# Quest 1 + Note 20 Edge Node Capabilities & Setup Guide

Reference guide for edge deployment on low-spec Android fleet nodes (Snapdragon 835 Quest 1 and Snapdragon 865/Exynos 990 Note 20).

## 1. Background Service Supervision (Termux)

- **Main repo package index (aarch64):** Includes `termux-services`, `cronie`, `openssh`, `rsync`, `mosh`, `syncthing`, `frp`, `python`, `nodejs`, `ffmpeg`, `proot`, `llama-cpp` (with OpenCL/Vulkan backends), `ollama`.
- **Missing main packages:** `tailscale` (request #10166 open, root PR #22980 closed), `whisper.cpp` (must build from source: `pkg install git cmake ninja clang`).
- **Daemon Supervision Stack:**
  1. `pkg install termux-services` → runit-based `sv`/`sv-enable`.
  2. `Termux:Boot` add-on for startup via `~/.termux/boot/`.
  3. Wake locks: run `termux-wake-lock` inside service scripts; disable OS battery optimization.
  4. OOM resilience: design watchdogs to be restart-safe.

## 2. No-Root Mesh (Tailscale) Options

- **Option A (Quest 1 / Termux):** `bropines/tailscale-termux-cli`
  - Patched static `tailscaled` daemon running in userspace (SOCKS5 + DNS).
  - No root or `/dev/net/tun` required. Auto-starts daemon via `termux-services`.
- **Option B (Note 20 / PRoot Debian):** `jefferyb/tailscaled-proot`
  - Patched `tailscaled` for PRoot environment (bypasses Android netlink blocks via `ifconfig` polling).
  - Re-enables Tailscale SSH server & Taildrop file transfers on Android.

## 3. Edge Inference Envelope & Guidelines

- **Quest 1 (SD835, ~4GB shared RAM, budget ≤1.5-2GB for Termux):**
  - **LLMs:** Sub-1B models (Qwen2.5-0.5B / SmolLM2-360M Q4_0, ~250-500MB) → ~3-6 tok/s CPU. Prompt processing is severe bottleneck.
  - **STT:** `whisper.cpp` `tiny.en` (~75MB) → near-real-time CPU inference. `base.en` (~140MB) → ~0.5-1x real-time.
  - **Embeddings & Vector DB:** `sqlite-vec` extension with `all-MiniLM-L6-v2` GGUF embeddings (~20MB).
- **Note 20 (SD865 / Exynos 990, 8-12GB RAM):**
  - **LLMs:** 1.5B-3B models (Qwen3-1.7B-3B Q4) → ~3-8 tok/s interactive CPU chat inside PRoot Debian.
  - **STT:** `whisper.cpp` `base.en` → multiple-x real-time. Acts as fleet mobile transcription node.
  - **Avoid:** 7B+ models on mobile CPU (1-3 tok/s, high latency); GPU/Hexagon offload on SD835/SD865 (Hexagon QNN backends require Adreno 7xx/v75 Hexagon NPU).

## 4. Architectural Workflows

1. **Head-Mounted Terminal:** Quest 1 running `mosh` + `tmux` over Tailscale mesh connecting to Note 20 or MacLab.
2. **Distributed Voice Loop:** Quest 1 mic (`termux-api`) → local whisper tiny.en → instant local commands; audio sync'd via Syncthing to Note 20 / MacLab for heavier processing.
3. **Off-Grid HUD & Retrieval:** Pre-computed `sqlite-vec` indexes built on MacLab, deployed to Note 20/Quest for zero-cloud RAG search.
