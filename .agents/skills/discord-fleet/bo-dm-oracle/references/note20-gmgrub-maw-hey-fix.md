# Note20 GmGrub & maw hey Diagnostics Guide

## Environment
- Host: `dex-note20-d1` (Tailscale `100.80.0.2`, Android)
- SSH: `ssh note20` (configured in ~/.ssh/config, user `u0_a377`)
- proot-distro: `debian` container with bind-mounted Termux home
- HTTP Port: `3456`
- Agent sessions: `10-gmgrub`, `school-sonic`
- maw-rs binary: `~/bin/maw-rs.real` (symlink: `~/bin/maw-rs` → `.real`)
- maw-rs version (as of 2026-07-28): `v26.7.16-alpha.2102-dirty` (Jul 16)
- maclab maw-rs version: `v26.7.16-7-ge005ab9-dirty` (Jul 25)

## The Three Traps (all hit every time)

### Trap 1: Dynamic Linker — cannot run maw-rs.real on Termux host
`maw-rs.real` is a Linux glibc aarch64 ELF requiring `/lib/ld-linux-aarch64.so.1`.
Running it directly in Termux: `cannot execute: required file not found`.
The `~/bin/maw-rs-serve` wrapper script tries this and fails silently.
**Must run inside `proot-distro login debian`.**

### Trap 2: proot session exits → process dies
`nohup maw-rs.real serve ... &` inside `proot-distro login debian -- bash -c '...'` dies
when the proot session ends (SSH disconnect kills the proot PID).
**Must use persistent `tmux new-session -d` wrapping the proot command.**

### Trap 3: Binary not at `/usr/local/bin/maw-rs` inside proot
Inside proot debian, `/usr/local/bin/maw-rs` is a symlink that may not resolve.
Use the FULL bind-mounted path: `/data/data/com.termux/files/home/bin/maw-rs.real`

## Correct Startup Procedure (PROVEN 2026-07-28)

```bash
# 1. Kill any stale processes
ssh note20 'pkill -f "maw-rs serve" 2>/dev/null; tmux kill-session -t maw-serve 2>/dev/null; true'

# 2. Start maw-rs serve inside proot via tmux (CORRECT method)
ssh note20 'tmux new-session -d -s maw-serve "proot-distro login debian -- bash -c \"export MAW_CONFIG=/data/data/com.termux/files/home/.config/maw/maw.config.json MAW_STATE_DIR=/data/data/com.termux/files/home/.maw MAW_HOME=/data/data/com.termux/files/home/.maw; /data/data/com.termux/files/home/bin/maw-rs.real serve --host 0.0.0.0 --port 3456 2>&1 | tee /data/data/com.termux/files/home/maw-serve-stdout.log\""'

# 3. Wait and verify locally on note20
sleep 3
ssh note20 'curl -s http://127.0.0.1:3456/api/health'

# 4. Verify from maclab via Tailscale
curl -s http://100.80.0.2:3456/api/health
# Expected: {"ok":true,"port":3456,"server":"local","source":"maw-rs"}

# 5. Federation check
maw federation | grep note20
# Expected: ●  note20  online
```

## Cross-Node Version Mismatch (KNOWN ISSUE — not fixable without rebuild)

maclab maw-rs (v26.7.16-7, Jul 25) sends `maw hey` to note20 (v26.7.16-alpha.2102, Jul 16).
Result: `hey: remote /api/send returned HTTP 404: not_found`

But manual curl POST to `http://100.80.0.2:3456/api/send` returns 401 `refuse-unsigned`
(the endpoint EXISTS, just requires crypto signing). The newer maw-rs client routes
to a different internal path that the older server doesn't have.

**Same issue affects ai-core** (v0.1.0-alpha.1 — even older).

**Root cause**: API contract changed between alpha and stable maw-rs versions.
**Fix**: Build and deploy matching maw-rs version for aarch64-linux on note20.
(maclab binary is x86_64-darwin — cannot cross-copy.)
Until then, `maw hey` cross-node will fail. Discord relay still works as fallback.

## /api/identity Response (for diagnostics)

```json
{
  "agents": [],
  "endpoints": ["/api/agents","/api/identity","/api/messages",
                "/api/pane-keys","/api/probe","/api/send","/api/sleep","/api/wake"],
  "host": "local",    // ← BUG: should be "note20", config not picked up in proot
  "node": "local",
  "oracle": "mawjs",
  "pubkey": "2f4be28b0f1802385d309794fd7826eba17f43becca5d99ab94530f0903d77fa",
  "version": "26.7.16-alpha.2102-dirty"
}
```

Note: `agents: []` and `host: "local"` mean the proot maw-rs serve doesn't see
the Termux-side Hermes/tmux sessions. This is expected — the proot environment
is isolated from Termux's tmux server.

## maw.config.json (note20)
Located at: `~/.config/maw/maw.config.json`
Key fields: host=note20, node=note20, port=3456, oracle=gmgrub-oracle
Peers: maclab (100.83.0.1), clubslab (100.66.18.111), ai-core (100.81.0.110), oppo (100.82.0.3:3457)

## What DOES Work
- Tailscale connectivity (ping ~8-10ms, direct connection)
- maw-rs serve HTTP health endpoint reachable from maclab
- Federation detection (note20 shows ● online)
- Discord relay (Bo's DMs reach gmgrok via relay, not maw hey)
- SSH access to note20 for diagnostics

## What DOES NOT Work
- `maw hey note20:10-gmgrub "..."` — version mismatch API 404
- Trust store signing — note20 trust-store has entries but version mismatch prevents delivery
- `maw-rs-serve` wrapper script — broken (tries to run binary outside proot)
