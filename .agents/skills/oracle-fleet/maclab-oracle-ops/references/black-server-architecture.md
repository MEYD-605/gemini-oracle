# black.alchemycat.org — Agent Migration Architecture

*Last inspected: 2026-07-26 via direct SSH*

## Access & Config

- **Hostname:** `black` / `black.alchemycat.org` / `10.10.0.6` / `black.local`
- **Architecture:** x86_64 (Ubuntu 24.04.1 LTS)
- **Entry user:** `meyd` (UID 1011, GID 1014, group `oracle-gang`)
- **SSH command:**
  ```
  ssh -o "ProxyCommand=/usr/local/bin/cloudflared access ssh --hostname %h" -o StrictHostKeyChecking=no meyd@black.alchemycat.org
  ```
- **Sudo:** requires password; meyd NOT in NOPASSWD list.

## System Specs

- **RAM:** 64 GB (62 GiB total)
- **Disk:** 1 TB NVMe (`/dev/nvme0n1p2`, 915 GB total, ~356 GB free as of last check)
- **Kernel:** Linux 7.0.0-28-generic #28~24.04.1-Ubuntu x86_64

---

## User-Per-Agent Isolation Architecture

**16 dedicated OS users** (UIDs 1000–1018). Each agent gets an isolated Linux user: separate home dir (mode `700`), separate GPG key, separate `.claude/`, `.maw/` state. No cross-user reads.

| UID | User | Role / Agent | Key Groups |
|-----|------|-------------|------------|
| 1000 | `nat` | Primary operator, MAW orchestrator, `maw serve` host | oracle-gang |
| 1001 | `ampere` | Ampere oracle | — |
| 1002 | `1dfx` | 1dfx oracle | — |
| 1003 | `dustboy` | Dustboy oracle (PM2) | — |
| 1004 | `hyperlane` | Hyperlane oracle | — |
| 1005 | `dexilla` | Dexilla oracle (PM2) | — |
| 1006 | `laris-co` | GitHub Actions runner (github.com/Laris-co, agent ID 143) | — |
| 1007 | `openclaw` | OpenClaw (heavy access: docker, libvirt, sudo) | sudo, docker, libvirt |
| 1008 | `noah-oracle` | Noah oracle | sudoers.d entry |
| 1009 | `wind` | Wind agent (VS Code Server connected) | oracle-gang |
| 1010 | `bm` | BM oracle | oracle-gang |
| 1011 | `meyd` | No.5 entry user / Bo's session user | oracle-gang |
| 1012 | `golf` | Golf oracle (Claude daemon + bg-pty-host) | oracle-gang |
| 1013 | `black` | black-oracle (Claude `--dangerously-skip-permissions`) | **sudo** |
| 1014 | `mrarranger` | MrArranger oracle | oracle-gang |
| 1015 | `maw-rs` | MAW bus owner / Rust binary maintainer | **sudo** |

**`oracle-gang` group (GID 1011):** wind, bm, meyd, golf, mrarranger — shared coordination surface without full sudo.

**`sudoers.d` entries:** `black`, `maw-rs`, `noah-oracle` each have individual drop-in files (exact rules require sudo to read).

---

## MAW Bus Architecture

**MAW binary:** `maw-rs v26.7.26-alpha.1519` (Rust, commit `d917a61`, compiled locally)
- Lives at `~/.local/bin/maw` under each user's home who has it installed.
- The `nat` user runs `maw serve` as the primary node daemon.

### Transport layers

| Layer | Tech | Port |
|-------|------|------|
| MQTT backbone | Mosquitto (enabled, auto-start) | 1883 |
| HTTP federation API + dashboard | `maw serve` (as `nat`) | 3456 |
| Internal maw socket | Go HTTP | 20241 |

### MAW core commands
```
maw a <target>           # attach to an agent's tmux session (cross-user)
maw ls [--json]          # list live local sessions
maw wake <target>        # launch oracle's engine pane in tmux
maw hey <target> <msg>   # inter-oracle federation messaging
maw token ls             # list/switch auth tokens (claude/, envrc/)
maw run <target> <cmd>   # type text + Enter into a target tmux pane
maw work <repo|url>      # open a work window for a repo/issue
maw bud <name>           # bud new oracle workspace
maw x <spec>             # run a plugin from source spec
```

### Federation map (live at inspection time)

`/fed.json` shows one peer:

| Field | Value |
|-------|-------|
| Peer node | `m5` |
| Peer URL | `http://192.168.1.118:3456` |
| Reachable | yes (173ms latency) |
| Oracle impl | `mawjs` |
| Registered agents on m5 | 22 agents including: `01-kalyana`, `02-vita`, `08-gpu`, `31-black`, `33-maw-rs`, `35-writing-agent`, `36-review-agent`, `41-arra-oracle-v3`, `48-atlas`, `57-mother`, `64-noah`, `71-arra-oracle-skills-cli`, `maru-oracle-main`, `ajfon-oracle`, + more |

`black` itself (local node) showed 0 local oracle agents via `/api/agents` at the time of query (MAW agents API returned one: `%39` federation-wake-fix-session owned by `nat` in session `33-maw-rs`).

---

## Tmux Session Architecture

Agents live in **named tmux sessions**; `maw a <name>` is the cross-user attach mechanism.

| Session name | Owner user | Contents at inspection |
|-------------|------------|----------------------|
| `71-black` | `black` | window `black`, cwd `/home/black/Code/github.com/Soul-Brews-Studio/black-oracle`, running `claude --dangerously-skip-permissions --continue --chrome` |
| `33-maw-rs` | `nat` (attached) | `maw a maw-rs` → `tmux attach -t 33-maw-rs` |
| `vt-split` | `nat` | `tmux new-session -d -s vt-split -n monitor -x 320 -y 90 htop` |
| `vt-monitor` | `nat` (tty2) | console monitor view |
| `vt-quad` | `nat` (tty3) | console quad view |

**Nat** is logged in on 4 TTYs (tty1–4) + 10+ tmux windows + pts sessions via Wayland.

### Live processes at inspection

| User | Process | Notes |
|------|---------|-------|
| `black` | `claude --dangerously-skip-permissions --continue --chrome` (PID ~746024) | In tmux `71-black`, ~400 MB RSS |
| `black` | `maw a black` → `tmux attach -t 71-black` (PID ~746742) | Cross-user MAW attach |
| `golf` | Claude daemon + 5x `bg-pty-host`/`bg-spare` workers | Multiple parallel Claude sessions on pts/21, pts/22 |
| `maw-rs` | `claude` (PID ~819020, ~322 MB RSS) | SSHed in from LAN, interactive session |
| `nat` | `maw serve` (PID ~636809) | Federation HTTP + MQTT broker |
| `nat` | `maw a maw-rs` → `tmux attach -t 33-maw-rs` (PID ~3472367) | Monitoring maw-rs agent |
| `noah-oracle` | `gpg-agent` | Session open since Jul 24 |
| `wind` | VS Code Server (`code-server`) | Remote development session |

---

## Network Services

| Port | Service | Notes |
|------|---------|-------|
| 22 | SSH | via cloudflared proxy |
| 1883 | Mosquitto MQTT | MAW bus backbone, world-listen |
| 3456 | MAW federation HTTP | Dashboard + `/fed.json` + `/api/agents` |
| 5000 | LINE Gallery | Web UI |
| 6052 | ESPHome Dashboard | Smart home device management |
| 9001 | Unknown (no HTTP response) | — |
| 9999 | Elysia 🦊 HTTP server | Bun/Elysia (returns "Hello from Elysia 🦊") |
| 20241 | Internal service | Go-style 404 response |
| 36321 | Unknown (loopback only) | No HTTP response |
| 53 | DNS (192.168.122.1) | libvirt/dnsmasq for VMs |

---

## System Services

| Service | Notes |
|---------|-------|
| `mosquitto.service` | MQTT broker, enabled, running since Jul 24 |
| `cloudflared.service` | Cloudflare tunnel for SSH |
| `docker.service` | Container runtime |
| `libvirtd.service` | VM management (xiaoer-vm QCOW2 image based on `openclaw-base.qcow2`) |
| `pm2-nat.service` | PM2 for nat user |
| `pm2-dustboy.service` | PM2 for dustboy user |
| `pm2-dexilla.service` | PM2 for dexilla user |
| `telegraf.service` | Metrics collection |
| `haos-agent.service` | Home Assistant OS Agent |
| `user@1012.service` | Systemd user manager for golf (UID 1012) |
| `user@1013.service` | Systemd user manager for black (UID 1013) |
| `user@1015.service` | Systemd user manager for maw-rs (UID 1015) |

---

## Inspection Methodology (for future audits)

Run these in parallel for fast discovery:

```bash
# Users + groups
cat /etc/passwd | grep -v nologin | grep -v false | grep home
getent group oracle-gang

# Running processes (agent-related)
ps aux | grep -E 'maw|oracle|hermes|claude|grok|agent' | grep -v grep

# Ports
ss -tlnp

# MAW federation state
curl -s http://localhost:3456/fed.json | python3 -m json.tool
curl -s http://localhost:3456/api/agents | python3 -m json.tool

# Active sessions
who
tmux list-sessions  # as each user

# Systemd services
systemctl list-units --type=service --state=running
ls /etc/sudoers.d/
```

**Cross-user tmux attach pattern:**
- `maw a <session-name>` works cross-user via MAW
- Direct `sudo -u <user> tmux list-sessions` requires specific sudoers grant
- Home dirs are mode `700` — `ls /home/black/` will fail as meyd

---

## meyd `.maw/audit.jsonl` (command log)

MAW logs every CLI invocation to `~/.maw/audit.jsonl`:
```json
{"args":["ls"],"binary":"maw-rs","cmd":"token","ts":"2026-07-26T10:46:49.940Z","version":"26.7.26-alpha.1519"}
{"args":[],"binary":"maw-rs","cmd":"agents","ts":"2026-07-26T11:33:55.143Z","version":"26.7.26-alpha.1519"}
```
Useful for debugging what commands were run recently.

## meyd `.claude.json` fields of note

- `machineID`: `d2e44ebd9ef812ea0a9bd68e1530642988ffb06897a24af2f9b57c38a4a8dd90`
- `cleanupPeriodDays`: 3650000 (essentially never auto-expire)
- `autoUpdates`: false (manual update only)
- `oauthAccount`: null (token-based auth only)

## meyd token library (`maw token ls`)

Named tokens under `~/.maw/tokens/claude/`: `dd2`, `duo`, `duo1`, `duo2`, `duo3`, `nh`, `pb`, `rb`, `t2`, `wave`
Named envrc: `home`
Switch active token: `maw token use <name>`
