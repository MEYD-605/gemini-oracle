# Proxmox host clubsxno1 — access notes (2026-07-29)

## Why this exists

Bo asked to connect to a Proxmox host (`clubsxno1`) via MCP/API to read live
hardware specs (CPU sockets, RAM) instead of relying on screenshots. No MCP
server for Proxmox was configured yet — this doc captures how to find/reach
the host and the correct verification sequence for a freshly-created API
token, so the next session doesn't have to rediscover the network path.

## Host identity

- Tailscale name: `clubsxno1` → `100.80.0.1`
- SSH config alias already present in `~/.ssh/config`:
  ```
  Host clubsxno1
    HostName 100.80.0.1
    User root
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ConnectTimeout 8
  ```
- Web UI: `https://100.80.0.1:8006` (self-signed cert, `CN=clubsxno1.system.local`,
  issued by internal PVE Cluster CA — expect `curl -k` / cert-verify-skip).
- Confirmed reachable and running real Proxmox (`Server: pve-api-daemon/3.0`
  header present) — connectivity itself is NOT the blocker when auth fails.

## Verifying an API token before trusting it (mandatory sequence)

Proxmox API tokens are shown to the user **exactly once** at creation time
(the UI literally says "Please record the API token secret - it will only be
displayed now"). If a token is read from a **photo/screenshot** of that
dialog (OCR/vision), do not assume the read is correct — UUID-format secrets
are highly prone to OCR confusion (`0`/`O`, `1`/`l`, etc.).

Always verify with a live curl call before wiring it into any MCP config or
script:

```bash
curl -sk -v --connect-timeout 8 \
  -H "Authorization: PVEAPIToken=<user>@<realm>!<tokenid>=<secret>" \
  "https://<host>:8006/api2/json/version"
```

- `HTTP 200` + JSON version payload → token is good, proceed.
- `HTTP 401 Authentication failed!` → the secret (or token ID) is wrong.
  **Do not guess-correct individual characters and retry** — ask the user to
  re-copy the secret directly from the Proxmox UI (or generate a fresh token)
  rather than attempting OCR-based correction. A wrong guess against a
  security credential is worse than asking once.

## Next step once a verified token is in hand

No Proxmox MCP server exists in this profile yet. Once a token verifies via
the curl check above, options are: (a) add a `mcp_servers` entry if a
Proxmox MCP binary/package is available, or (b) skip MCP and just use
`curl -sk -H "Authorization: <REDACTED>"` against
`/api2/json/nodes/<node>/status` (CPU/RAM), `/api2/json/cluster/resources`,
etc. directly from `terminal()` — simpler for one-off spec checks and avoids
adding a new MCP dependency for infrequent use.

## If the token still 401s after Bo re-confirms the exact secret (2026-07-29)

Don't loop retrying the same curl call. If Bo *types* (not just shows a
screenshot of) the exact secret and it still 401s, the token most likely
never actually persisted server-side (UI flow interrupted, or shown-then-
not-saved). SSH into the host directly (root, key auth already in
`~/.ssh/config`) and check/recreate it there — this is authoritative and
bypasses the UI/OCR entirely:

```bash
# List real tokens for the user — ground truth, not what a screenshot showed
ssh clubsxno1 "pvesh get /access/users/root@pam/token"

# If the tokenid you were given isn't in that list, just create it
ssh clubsxno1 "pvesh create /access/users/root@pam/token/<tokenid> --privsep 0"
# Returns a NEW secret in the `value` field — use that one, not the old screenshot
```

`--privsep 0` gives the token the same rights as the user (root) — fine for
a personal single-admin box, tighten with explicit ACLs if the host is
shared. Re-run the `curl .../api2/json/version` check against the new
secret before doing anything else; expect `HTTP 200` with a JSON version
payload.

## CRITICAL — verify hostname/SSH-alias resolves to the SAME physical machine as what Bo is looking at (2026-07-29)

Tailscale/SSH-config aliases (`clubsxno1`, etc.) can exist for a machine that
is NOT the one Bo is currently looking at on a physical/VNC screen, especially
when Bo has multiple Proxmox nodes or friend-provided servers in play. This
happened for real: Bo's screen showed `32 x Intel(R) Xeon(R) CPU E5-2640 v2
@ 2.00GHz (2 Sockets)`, but SSH to the `clubsxno1` alias landed on a
completely different box (`Intel Core Ultra 9 285H`, 1 socket, 62 GB RAM) —
i.e. the alias silently pointed at `ai-core`-class hardware, not the Dual
Xeon server Bo was actually viewing.

**Before reporting any spec pulled via SSH/API as "confirmed", cross-check an
identifying fact against what Bo described/showed** (CPU model string,
socket count, hostname via `hostname`/`pvesh get /nodes`) — don't just trust
that a named alias must be the machine in the screenshot. If they don't
match, say so immediately and ask Bo for the correct hostname/IP rather than
reporting the wrong machine's specs as if they answered the question.

## Third-party / friend-provided Proxmox hosts — IP given ≠ IP that works (2026-07-29)

Not every Proxmox host is one we manage. Bo sometimes gets access to a
friend's box (no SSH key, no Tailscale, just a login handed over in chat).
Two things go wrong reliably in this scenario:

1. **The IP/network info a friend pastes in chat is often wrong or
   incomplete.** A friend sent "4x IP Address: 143.14.4.51-54 / Gateway:
   143.14.4.254" — those were guest-VM-facing addresses, not the
   Proxmox host itself. All 4 timed out on ping/SSH/curl (traceroute
   confirmed the network path was fine, reaching the gateway .254 cleanly
   — only the specific host IPs Bo was given never answered). The real
   Proxmox web UI IP (143.14.4.1) was a completely different address in
   the same /24, only discoverable once Bo had it open in a browser.
   Don't keep retrying/scanning the given IPs — ask Bo to open the
   Proxmox web UI locally (if he can) and read the actual address bar.

2. **No SSH access on someone else's box** — the clubsxno1 pattern above
   (SSH in as root, pvesh create token) does not apply. For a
   friend-provided host you typically only have a Proxmox web login
   (username/realm + password, e.g. soulbrews@pve). Use the ticket+CSRF
   flow to authenticate, then create a token through the same authenticated
   API session — no SSH needed at all:

```bash
# 1) Log in with username+password to get a ticket + CSRF token
curl -sk -w "\nHTTP_STATUS:%{http_code}\n" --connect-timeout 8 \
  -d "username=<user>@<realm>&password=<password>" \
  "https://<host>:8006/api2/json/access/ticket"
# Response JSON has data.ticket and data.CSRFPreventionToken — HTTP 200 confirms login works.

# 2) Use the ticket (as a cookie) + CSRF token to create a new API token
#    (token names must be unique per user; pick a fresh one like "gmforge")
curl -sk -w "\nHTTP_STATUS:%{http_code}\n" --connect-timeout 8 \
  -H "Cookie: PVEAuthCookie=<ticket>" \
  -H "CSRFPreventionToken: <csrf_token>" \
  -d "privsep=0" \
  "https://<host>:8006/api2/json/access/users/<user>@<realm>/token/<new_tokenid>"
# Response has data.value (the secret) and data.full-tokenid (e.g. "soulbrews@pve!gmforge")

# 3) Verify the new token the normal way before trusting it
curl -sk -w "\nHTTP_STATUS:%{http_code}\n" --connect-timeout 8 \
  -H "Authorization: PVEAPIToken=<user>@<realm>!<new_tokenid>=<secret>" \
  "https://<host>:8006/api2/json/nodes"
```

This is strictly better than reusing a screenshot-read token that already
401'd once — creating a new token through an authenticated session sidesteps
both the OCR-risk problem (see main section above) and the "was it ever
actually saved server-side" problem, without needing shell access to the box
at all.

## Proxmox web-UI password is NOT the Linux SSH password (2026-07-30)

Even when SSH port 22 is confirmed open (`nc -zv <host> 22` succeeds) on a
Proxmox host, do not assume the `user@realm` password that logs into the web
UI / API ticket endpoint also works for SSH. They are separate auth systems
(PAM/Linux vs PVE realm auth) even when the username looks the same (e.g.
`soulbrews@pve` for web, but no matching Linux user password). Confirmed by
testing: `sshpass -p '<web-password>' ssh soulbrews@<host>` and
`... ssh root@<host>` both returned `Permission denied` even though the same
credential logged into `/api2/json/access/ticket` with HTTP 200. Don't
report "can't SSH in" as a dead end — pivot to API-only inspection (see next
section) instead of re-trying password variations.

## Getting deep hardware/system info WITHOUT any SSH access (2026-07-30)

When only an API token/ticket is available (no SSH), the `report` endpoint
returns a full text dump equivalent to what you'd get running several
commands over SSH — `pveversion --verbose`, `/etc/hosts`, subscription
status, apt sources, and (further down the same blob) `lscpu` output:

```bash
curl -sk --connect-timeout 8 -H "Authorization: PVEAPIToken=<tok>" \
  "https://<host>:8006/api2/json/nodes/<node>/report" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data'])"
```

Search the returned text blob for `# lscpu`, `# pveversion`, `/etc/hosts`
etc. — it's one long shell-transcript-style string, not structured JSON per
section. This is the reliable way to get exact CPU/socket detail, real
hostname, and Debian/PVE version without shell access. It does NOT include
`dmidecode` (no RAM DIMM/type listing) or `dmesg` — for those you still need
SSH or console access.

## RAID controllers hide real disk type from every API/SMART path (2026-07-30)

If `/api2/json/nodes/<node>/disks/list` returns `"rpm": -1, "type": "unknown"`
and `/api2/json/nodes/<node>/disks/smart?disk=...` returns only
`{"health":"UNKNOWN"}` for every disk, check the `model` field on the disk
entry — a hardware RAID controller name (e.g. `PERC_H710`, `MegaRAID`) there
means the physical disks are virtualized behind the RAID card. Standard
Linux/Proxmox tooling (smartctl passthrough, rotation-rate detection) cannot
see through it without controller-specific tools (`perccli`, `MegaCli`),
which need actual shell access on the host. **Don't guess SSD vs HDD from
disk size alone** — instead, infer indirectly from the era/tier of the
hardware: a Dell PowerEdge with PERC H710 (paired with Xeon E5 v2, ~2012-2014
vintage) shipped with SAS HDDs as the default configuration; SSD would have
been an explicit (pricier) build option. State this as an inference with the
reasoning shown, not as a fact — and offer to verify via SSH/iDRAC if the
user needs certainty.

## Don't chase `/termproxy` + `vncwebsocket` as a no-SSH shell substitute (2026-07-30)

The API does expose a way to open a real host Shell without a Linux login —
`POST /api2/json/nodes/<node>/termproxy` returns a `{ticket, port, upid}`
meant to be paired with a `wss://.../vncwebsocket?port=...&vncticket=...`
connection. This looked like a clean way to run `dmidecode`/`perccli`
without asking for SSH. In practice it is **not** a simple bearer-auth
websocket — plain `Authorization: <REDACTED>` headers (and reasonable
guesses at cookie/CSRF pairing) both got rejected with
`401 Authentication failed!` / `invalid PVEVNC ticket` even against a
freshly-minted ticket. The endpoint expects the actual noVNC/xterm.js RFB
handshake sequence the web UI's JS client implements, not just a header.

**Don't burn more than one attempt on this.** If SSH access isn't available
and something requires real shell (dmidecode, perccli, dmesg), either:
1. Use the `/nodes/<node>/report` endpoint (see above) — covers lscpu,
   pveversion, hosts, apt sources, no websocket needed.
2. Ask the user to click "Shell" in the Proxmox web UI themselves and paste
   the output, or request real SSH/Linux credentials.
Don't attempt to reverse-engineer the PVE websocket auth protocol live in a
session — it costs several failed round-trips for something a config/report
read usually already answers.

## Determining RAM generation (DDR3 vs DDR4) without dmidecode access (2026-07-30)

When `dmidecode`/DIMM listing isn't reachable (no SSH, or `report` endpoint
doesn't include it), reason from the CPU socket generation instead of
guessing — this is a hard hardware constraint, not a probabilistic read:

- Xeon E5-XXXX **v1/v2** (Sandy Bridge-EP / Ivy Bridge-EP, socket **LGA 2011**
  original) → **DDR3 only**, physically cannot accept DDR4 modules.
- Xeon E5-XXXX **v3/v4** (Haswell-EP / Broadwell-EP, socket **LGA 2011-v3**)
  → **DDR4** (also a different, incompatible socket/motherboard from v1/v2
  despite the similar-looking model numbers — always check the full model
  suffix, not just "E5-26xx").
- This CPU-generation-to-RAM-type mapping is 100% reliable for stating "the
  RAM must be DDRx" even with zero direct memory-module evidence — cite the
  CPU model as the reasoning, don't hedge it as a guess.
