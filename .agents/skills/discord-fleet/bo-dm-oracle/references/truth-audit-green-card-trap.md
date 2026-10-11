# Truth Audit & False Success Guard (The "Green Card" Trap)

**Source**: P'Nat's *Yai-Ban-Oracle* Book (Chapter 19: Verify Right) & Session 2026-07-27 (Note20 / GmGrub Audit).

## The Pattern
AI agents and subagents frequently report "completed", "done", or return `exit 0` when an underlying daemon, network listener, or process is actually broken or hung. 
This is known as **False Success (เขียวหลอก)** or **"ไม่รู้" หน้าตาเหมือน "สำเร็จ"**.

## Case Study: Note20 GmGrub & Android PRoot Lifecycle (2026-07-27)
1. **Agent Self-Report**: GmGrub replied claiming `maw-rs` and `maw hey` cross-node comms were fixed and working.
2. **OS-Level Verification (STV)**:
   - Executed `maw hey note20:10-gmgrub` from `maclab` → Failed with `HTTP 401: Unauthorized` / `Connection Refused`.
   - Checked `ps aux` and logs on Note20 via SSH → `maw-rs serve` binary compiled for standard Linux `glibc` crashed on host Termux due to missing `/lib/ld-linux-aarch64.so.1` or was killed by Android OS process killer upon SSH disconnect.
3. **Android Termux PRoot Pitfall**:
   - Background processes (`maw-rs serve`) spawned inside Termux/proot over SSH get killed with SIGKILL (signal 9/15) when SSH closes unless run inside a persistent `tmux` session or configured with `loginctl enable-linger` / `termux-wake-lock`.
4. **Takeaway**: Never report a service or multi-node comms channel as healthy based on an agent's self-declaration or an `exit 0` script. Always perform an independent, real-network probe (e.g. `curl`, `maw hey`, `ps aux`) to verify OS-level reality before confirming to Bo.

## Verification Checklist for "มันบอกว่าสำเร็จแล้วจริงหรือเปล่า"
1. **Network Listener Check**: Is the port actually open and listening on `0.0.0.0` or `100.x.x.x`? (`curl -i http://<ip>:<port>/api/identity` or `netstat/ss`).
2. **Cross-Node Message Probe**: Does `maw hey <target> "<message>"` return `delivered 200 OK`?
3. **Daemon Persistence**: Did the daemon stay alive after SSH exit? (Check `loginctl enable-linger <user>`, `proot` tmux session, and `systemd`).
4. **Log Inspection**: Check target host logs for silent loops, binding errors, missing peer keys (`os error 2`), or FTS write corruption.
5. **Peer Key Handshake (`MAW_HOME/peer-key`)**: `maw-rs serve` requires a matching `peer-key` in `~/.maw/peer-key` across nodes. Missing key causes `/api/identity` to fail with `os error 2` and triggers `HTTP 401 unauthorized` on `maw hey`.
