# maclab GPU (Radeon Pro Vega 56) — local AI acceleration capability (2026-08-11)

## The question that triggers this check

Bo periodically asks some form of "GPU เราเอามาช่วยงาน AI ได้ไหม / มันเก่าไปไหม
ทำงานไหวไหม" (can our GPU help with AI work, is it too old, can it handle it).
Answer with a live measurement, not a spec-sheet guess — the hardware and the
software-support story are two different answers and conflating them gives
Bo the wrong mental model.

## Hardware facts (verified via `system_profiler SPDisplaysDataType`)

- **Radeon Pro Vega 56**, 8GB HBM2, PCIe x16, Metal 3 support confirmed
- ~10.5 TFLOPS FP32 — a genuinely capable card for its era (paired with the
  iMac Pro 2017, 8-core Xeon W)
- Not "too old" in raw compute terms — the ceiling is software support, not
  silicon

## The real blocker: ollama cannot use AMD GPUs on Intel Macs

Confirmed via GitHub issue `ollama/ollama#1016` — "Support AMD GPUs on Intel
Macs", opened 2023-11-06, **still open** as of the last check (2026-07-10
update). This is a long-standing, well-known gap in ollama's Metal backend:
it only reliably GPU-offloads on Apple Silicon; Intel+AMD combos fall back to
CPU-only inference silently (no hard error — it just runs slow).

## Live proof method (repeat this instead of trusting a doc claim)

1. Confirm ollama is running and has a model: `ollama list`, `lsof -iTCP:11434 -sTCP:LISTEN`
2. Kick off a generation in the background so you can sample GPU activity mid-run:
   ```bash
   curl -s http://localhost:11434/api/generate -d '{
     "model": "llama3.2",
     "prompt": "Write a detailed 500 word essay about space exploration.",
     "stream": false
   }' -m 60 -o /tmp/ollama-gpu-test.json
   ```
   (run via `terminal(background=true)` so you can poll GPU while it's still generating)
3. While it's running, sample GPU activity a couple of times:
   ```bash
   ioreg -l -w0 2>&1 | grep -o '"GPU Activity(%)"=[0-9]*\|"Device Utilization %"=[0-9]*' | sort -u
   ```
4. In parallel, check what's actually burning CPU:
   ```bash
   ps aux | grep -i "runner\|ggml\|llama" | grep -v grep
   ```

## What we measured (2026-08-11, llama3.2 3B, ollama 0.30.10)

| Metric | Value |
|---|---|
| GPU Activity during generation | **2-6%** (essentially idle) |
| `llama-server` runner CPU% | **~191%** (pegged ~2 cores) |
| Output throughput | **14.7-15.4 tokens/sec** |

This is a textbook CPU-only inference signature — GPU is not participating at
all despite Metal 3 support being present at the OS level. The throughput
number (~15 tok/s for a 3B model) is itself consistent with CPU inference,
not GPU-accelerated (a Vega 56 doing real work here would be significantly
faster).

## Answer pattern for Bo

- **Don't recommend buying/upgrading a GPU for this chassis.** The iMac Pro
  (2017) has a soldered/proprietary GPU config — Vega 56 is not swappable,
  and even if it were, the ollama+AMD+Intel-Mac gap is a software problem a
  bigger AMD card wouldn't fix.
- **MLX is not an option either** — Apple's MLX framework targets Apple
  Silicon exclusively and has no AMD GPU support path at all. It's not a
  fallback for this box.
- If Bo wants real GPU-accelerated local LLM inference, the only real fix is
  different hardware — an Apple Silicon Mac (M-series) running MLX, which
  sidesteps the AMD dependency entirely. That's a "buy different hardware"
  answer, not a "reconfigure this box" answer — say so plainly.
- In the meantime, CPU-only inference on this box is usable for light work
  (~15 tok/s on a 3B model is fine for quick local queries) but won't scale
  to larger models or latency-sensitive use.

---

## Follow-up: "Would converting to Linux help the GPU?" (deep research, 2026-08-11)

Full source-cited report: `gmforge-oracle/imac-pro-linux-vega-llm-research.md`.
Durable decision-grade facts below — every claim verified against a primary
source in the linked report.

### Verdict: DON'T convert. Buy separate hardware instead.

The best-case speedup from converting to Linux is marginal (~12-18 t/s
estimated for Vega 56 Vulkan vs 14.7-15.4 t/s CPU-only baseline), the driver
stability is "partially working" at best, and converting loses the macOS
workstation Bo uses daily. The effort/risk is not justified.

### ROCm gfx900 support — the nuance the old skill note missed

The old note said flatly "ROCm no longer supports gfx900". That's true for
**official library support** but misleading for **whether the code runs**.
Verified timeline from ROCm GitHub release notes (73 releases scanned):

| ROCm | gfx900 status |
|------|---------------|
| 5.5.0 | ✅ in default build targets |
| 5.7.0 | ⚠️ MI50 EOS |
| 6.0.0 | ⚠️ gfx906 maintenance mode |
| 6.2.0 | ↩️ gfx900 re-added to default targets |
| 6.4.0 | AOT kernels for gfx906 removed (runtime still works) |
| 7.0.0 | ❌ gfx900 "no longer built by default" + MI50/MI60 removed |
| 7.14.0 (current) | ❌ gfx900/MI25/MI50 = Unsupported in official table |

**Key nuance:** ROCm's own gpu_os_support page says *"The HIP runtime might
continue to run applications for an unsupported GPU"* — and this is real.
llama.cpp PR #24588 (merged 2026-06-30) shows a user running llama.cpp
ROCm/HIP backend on **4× gfx900 devices** TODAY with real benchmarks. So
"officially unsupported" ≠ "doesn't run". The HIP runtime + llama.cpp's own
HIP backend keep old Vega alive even after ROCm drops it.

### Real benchmark proxies (no single-Vega-56 number exists anywhere)

No one has published a token/sec benchmark for a single Radeon Pro Vega 56
on Linux. Closest verified proxies:

| Proxy | Arch | Backend | 7-9B Q4 gen | Source |
|-------|------|---------|-------------|--------|
| 4× gfx900 APU | gfx900 (exact Vega 10) | ROCm/HIP | ~36 t/s (4 cards, PR #24588) | llama.cpp#24588 |
| MI50 32GB | gfx906 (GCN 5.1) | Vulkan | 62-71 t/s (PR #22933) | llama.cpp#22933 |
| Radeon VII | gfx906 | macOS Metal | 24-25 t/s but hard crashes (#25866) | llama.cpp#25866 |

**Conservative estimate for a single Vega 56 (8GB, 484 GB/s):** ~12-18 t/s
for 7-8B Q4 — roughly 1/3 to 1/4 of the 4-card gfx900 number (generate is
bandwidth-bound and splits near-linearly). This is barely better than the
measured CPU-only baseline.

### t2linux stability for sustained inference — high risk

From `wiki.t2linux.org/state/` (read live via browser to confirm the table):
- **AMD GPUs: 🟡 Partially working** — crashes on resolution changes /
  DRI_PRIME; `amdgpu.dpm=0` kernel param stops crashes but locks GPU to
  base/low clock (reduces performance further).
- **Hybrid Graphics: 🟡 Partially working** — dGPU power toggling broken.
- Not suitable for a 24/7 inference server. No long-term stability reports
  found for t2linux + Vega specifically.

### Alternatives to full conversion (all dead ends for this box)

- **Asahi Linux** = Apple Silicon ONLY. Does not support any Intel Mac.
- **Linux VM** = no GPU passthrough (Vega 56 is BGA-soldered, no Mac
  VFIO/IOMMU). VM gets virtual GPU = slower than CPU.
- **Boot Camp** = Windows only, no official Linux path on T2 Macs.
- **T2 brick risk** = LOW (t2linux doesn't touch firmware; reversible via
  Internet Recovery), but stability risk is the real problem, not bricking.

### Cost-benefit (why buying new wins)

| Option | Cost | ~7-8B Q4 t/s | Notes |
|--------|------|-------------|-------|
| Convert iMac Pro to Linux | $0 + ~1-2 days | ~12-18 (est) | loses macOS workstation, unstable |
| RTX 3060 12GB (used) + cheap PC | ~$200 | ~40-50 | 3× faster, stable, CUDA |
| Mac mini M4 base (16GB) | ~$599 | ~30-40 | Metal works perfectly, low power |
| Mac mini M4 Pro (24GB) | ~$1,399 | ~45-55 | more VRAM headroom |

Keep the iMac Pro on macOS as a CPU/orchestration node (Xeon W 8c/16t +
80GB RAM is useful for CPU-bound tasks). Buy separate hardware for GPU AI.
