# Fleet CPU/Core Inventory & Hardware Evaluation (2026-07-29, updated 2026-08-01)

## Why this exists

Bo asked to compare CPU load/core counts across `maclab` and `ai-core` after
noticing both showed "16" — a coincidence worth verifying properly instead of
assuming a display bug. This turned into a hardware-sourcing discussion
(buying used server CPUs to host more agents). Use this doc whenever Bo asks
to check core counts, compare machine specs, or evaluate a CPU purchase for
fleet expansion.

## maclab own full hardware spec (verified live 2026-08-01)

When Bo asks "เช็คสเปคเครื่องนี้ให้ละเอียด" about the local maclab box itself
(not a remote node), this is the cached answer — re-verify with `system_profiler
SPHardwareDataType` / `sysctl` / `df -h` if it's been a while, but don't re-run
the full probe for a routine "is this machine OK" question:

| Item | Value |
|------|-------|
| Model | iMac Pro (iMacPro1,1) |
| CPU | Intel Xeon W-2140B @ 3.2GHz — 8 physical cores / 16 logical threads (HT on) |
| RAM | 80 GB, no swap under normal load (`vm.swapusage: used=0.00M`) |
| GPU | Radeon Pro Vega 56, 8GB VRAM, Metal 3 |
| Disk | 1TB PCIe SSD (Apple SSD AP1024M), typically ~495GB free / ~47% used on Data volume |
| macOS | 15.7.7 (Sequoia), build 24G720 |
| Typical load | load average 2.5-3.5 is NORMAL for this box with 5+ Hermes profiles running — that's 30-45% of the 8 physical cores, comfortable headroom. CPU idle is usually >90% (`top -l 1`). |

**Is HT "actually good" on this box? Yes, specifically because of the workload
shape** — Hermes gateway/chat processes here are I/O-bound (waiting on model
provider HTTP calls, disk, network), not CPU-bound compute. HT's ~15-30%
throughput gain shows up exactly when a thread stalls waiting on I/O and the
core can pick up the other logical thread's work instead of sitting idle. If
this box were instead doing local LLM inference (CPU/GPU-bound, pipeline
always full), HT would help much less — there's no idle pipeline slot for the
second thread to fill. Don't answer "is HT good" with a generic yes/no —
answer it against the actual workload running on that box.

**When RSS/CPU-hog investigation is needed**, don't assume Hermes profiles are
the top consumer — check `ps aux | sort -rk3 | head -12` for the actual
top-CPU process first. On 2026-08-01 the top consumer was OrbStack Helper
(container runtime), not any Hermes instance, even with 5 Hermes gateway/chat
processes running concurrently (~12.6GB combined RSS, single-digit % CPU each).

## Quick probe commands per OS

**macOS (maclab):**
```bash
sysctl -n hw.ncpu hw.physicalcpu hw.logicalcpu
sysctl -n hw.model machdep.cpu.brand_string
sysctl hw.perflevel0.physicalcpu hw.perflevel1.physicalcpu \
       hw.perflevel0.logicalcpu hw.perflevel1.logicalcpu   # P-core/E-core split if present
system_profiler SPHardwareDataType | grep -E "Chip|Cores|Model"
uptime   # load averages
```

**Linux (ai-core, clubslab, black, rockpi-edge):**
```bash
nproc
lscpu | grep -E "^CPU\(s\)|Model name|Thread\(s\) per core|Core\(s\) per socket"
free -h
uptime
```

## The core rule: logical CPU count ≠ physical execution units

The number `nproc`/`sysctl hw.ncpu`/Activity Monitor reports is **thread**
count, not core count. Two techniques inflate it beyond physical cores:

- **Hyper-Threading / SMT**: each physical core exposes 2 logical threads by
  sharing internal execution resources. Real throughput gain from HT is only
  ~20-30%, NOT 2x. A CPU showing "16" via HT on 8 physical cores is NOT
  equivalent to a CPU with 16 real physical cores.
- **Hybrid P-core/E-core (Intel 12th gen+)**: only P-cores carry HT; E-cores
  do not. So total logical thread count = (P-cores × 2) + E-cores, not a
  clean multiple of physical core count.

**Verified fleet inventory (2026-07-29):**

| Node | Chip | Physical cores | Logical threads | HT/SMT? |
|------|------|-----------------|------------------|---------|
| maclab | Intel Xeon W-2140B (iMac Pro) | 8 | 16 | Yes, all cores |
| ai-core | Intel Core Ultra 9 285H | 16 | 16 | No (Meteor Lake dropped HT) |
| clubslab | Intel Core i9-14900K | 24 (8P+16E) | 32 | Only P-cores (8×2=16 + 16E=32) |

So maclab and ai-core showing "16" is coincidental — maclab's 16 is
"8 real + 8 virtual", ai-core's 16 is "16 real". ai-core has meaningfully
more real compute headroom under full parallel load despite the same
reported number. Always dig into `lscpu`/`sysctl` detail before comparing
two machines' load/CPU numbers at face value — don't trust the top-line
count alone.

## Hardware sourcing guidance for fleet expansion (used CPU purchases)

If Bo is evaluating a used CPU listing (e.g. Facebook Marketplace Xeon/EPYC)
for hosting more Hermes/maw-rs agents, apply this framework:

1. **Distinguish real cores from thread count in the listing** (e.g.
   "20C/40T" = 20 real cores, 40 threads via HT).
2. **Workload shape matters more than raw thread count:**
   - Hermes agents / Discord gateways are mostly I/O-bound (waiting on model
     provider API) → thread count is fine, cheap old Xeons (E5 v3/v4 era)
     are good value for running MANY agents in parallel.
   - **maw-rs / ARRA Oracle relay is Rust** — no GIL, no GC pauses, scales
     near-linearly across real physical cores. This makes **physical core
     count** (not thread count, not single-core clock) the dominant factor
     for that workload specifically. Old Xeons still work but newer
     architectures give more real cores per dollar per generation.
3. **Recommended tiers (not exhaustive, verify current market price before
   quoting a number to Bo — prices move):**
   - Budget/cheap scale-out (many I/O-bound agents): old Xeon E5 v3/v4
     (Broadwell/Haswell-EP), 1,000-3,000 THB CPU-only, needs a used
     LGA2011-v3 board (~2,000-3,000 THB budget Chinese X99 board).
   - Better price/core, newer arch, still affordable: **AMD EPYC Milan
     (7003 series)** or **Rome (7002 series)** — real core count is high
     (16-64+), Zen 3/2 architecture scales well for Rust workloads, 8-channel
     ECC RAM. Needs SP3 board (pricier/rarer than X99, ~5,000-15,000 THB).
   - ARM alternative: **Ampere Altra** — up to 128 real cores, zero SMT (no
     "virtual" inflation at all), very power efficient, but hard to source
     outside cloud/server-market channels in Thailand.
   - Consumer hybrid (single high-power workstation, not scale-out): AMD
     Threadripper PRO 7000 (Zen 4) or Intel Core Ultra desktop — fewer total
     cores than EPYC but much higher per-core speed; good if the priority is
     one fast box rather than many parallel agent hosts.
4. **Always caveat live pricing.** Google/Bing/DuckDuckGo browser fetches can
   get blocked by CAPTCHA/Cloudflare in this environment — if that happens,
   say so explicitly and give ballpark figures from known knowledge, framed
   as "not verified live" rather than presenting them as current market fact.

## Middle-tier options (between cheap-old-Xeon and full EPYC Milan/Genoa)

When Bo says the top recommendation (EPYC Milan/Genoa) is too expensive vs
the cheap baseline (old Xeon E5 v3/v4), there IS a middle tier — don't just
re-offer the same two extremes:

- **Intel Xeon Scalable Gen1/Gen2 (Skylake-SP / Cascade Lake-SP, 2017-2019)**
  — e.g. Xeon Gold 6148 (20C/40T), Gold 6154 (18C/36T), Silver 4114 (10C/20T).
  Newer than Broadwell E5 v4 (~10-15% higher IPC), 6-channel DDR4 (vs 4-channel
  on E5 v4). Prices have dropped hard post-Sapphire Rapids launch. Needs
  LGA3647 board — more available in Thailand than SP3 EPYC boards, cheaper too.
- **AMD EPYC Naples (7001 series, first-gen Zen, 2017)** — e.g. EPYC 7351
  (16C/32T), EPYC 7451 (24C/48T). Older Zen but still gets **8-channel DDR4**
  (EPYC's core advantage carries down to gen 1, unlike Intel where channel
  count scales with tier/generation). Cheapest EPYC entry point since it's the
  most obsolete EPYC generation on the market. Caveat: some SP3 boards need a
  BIOS flash to recognize first-gen EPYC — check board compatibility list
  before buying.
- Rule of thumb when Bo asks for "something in between": Naples EPYC wins if
  the workload is Rust/maw-rs-heavy (8-channel memory matters more than IPC);
  Xeon Scalable gen1/2 wins if board/parts availability in the Thai secondhand
  market matters more than raw memory bandwidth.

## Pitfall: multi-socket servers — always check for "(N Sockets)" (2026-07-29)

When Bo shows a screenshot of a **live management UI** (Proxmox, ESXi, IPMI,
etc.) instead of a marketplace listing, the CPU line format is different and
easy to misread. Proxmox's summary panel shows the TOTAL logical thread count
across ALL sockets in one line, e.g.:

```
32 x Intel(R) Xeon(R) CPU E5-2640 v2 @ 2.00GHz (2 Sockets)
```

This is a **dual-socket (2-CPU) server**, not one CPU with 32 threads. The
correct read is: 32 total threads ÷ 2 sockets = 16 threads/socket ÷ 2 (HT) =
**8 physical cores per socket, 16 physical cores total**. Missing the
`(N Sockets)` suffix and treating the whole line as a single-chip spec produces
a core count that's off by a factor of N — a real mistake made in this exact
session (assumed 1 socket, quoted a memorized "10C/20T" spec for E5-2640 v2
before the live evidence showed 2 sockets × 8C/16T = 16C/32T total).

**Rule:** when live hardware evidence (Proxmox/ESXi/lscpu) is available,
trust it over a memorized per-chip spec, and always look for a socket-count
qualifier before doing any core-count math. `lscpu`'s `Socket(s):` line is
the Linux equivalent — check it alongside `Core(s) per socket:` rather than
reading `CPU(s):` alone.

## Worked example: evaluating a real marketplace listing (2026-07-29)

Bo shared a screenshot of a Facebook Marketplace listing: "Xeon E5-2673 v4
20C/40T" at ฿1,200. Process used to evaluate it:

1. Read the listing via `vision_analyze` (image already in chat) to get exact
   model number, price, and any visible board/RAM hints.
2. Identify architecture generation and known specs (core/thread count, TDP,
   socket, RAM support) from model knowledge — flag clearly if not live-verified.
3. State the verdict explicitly (good deal / not) with the reasoning, not just
   raw specs — Bo wants a buy/don't-buy read, not a spec sheet.
4. Always mention hidden costs: motherboard availability/price for that socket,
   RAM type needed, cooler compatibility, no iGPU (needs discrete GPU) — these
   often matter more than the CPU price itself for a "too good to be true" deal.
5. When asked "is that number real or inflated" for a NEW listing/chip (not
   one already in the fleet inventory table above), apply the same HT-inflation
   check: state the physical core count separately from the advertised thread
   count, and confirm whether the specific SKU has HT (most Xeon E5/Gold do).
