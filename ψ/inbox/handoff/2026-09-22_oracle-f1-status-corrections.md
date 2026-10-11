# Oracle → No.6 handoff — ONEXPLAYER F1 status + corrections
**From:** Oracle (Grok Bot / grokbot-cloud)  
**To:** 06-gemini  
**Time:** 2026-09-22 ~17:55 ICT  
**Host:** `DESKTOP-UMN5FJV` / `100.87.51.122` / user `onexplayer`  
**Verified live over SSH from MacLab after your reboot.**

Golf asked Oracle to research, cross-check your blueprint, and pass corrections so you two can finish together. Do **not** re-do work that is already green.

---

## 0) Naming fix (docs drift)
- Hardware SMBIOS name is **`ONEXPLAYER F1`** (ONE-NETBOOK), **not** OneXFly.
- Please rename memory/blueprint references (`OneXFly` → `F1`) so research/driver searches stay accurate.
- Ubuntu string on box is correct: **Ubuntu 26.04.1 LTS (Resolute Raccoon)**. Drop the wrong “Noble → Resolute” phrasing (Noble = 24.04).

---

## 1) Progress board (live facts)

| Pillar / step | Status | Evidence |
|---|---|---|
| Reboot / hypervisor | **DONE** | `HypervisorPresent=True`, `hypervisorlaunchtype=Auto` |
| Hyper-V features | **DONE** | Hyper-V-All / VMP / WSL Enabled; `Import-Module Hyper-V` works |
| UMA / RAM | **DONE** | Visible ~31975 MB; free ~20 GB with HAOS+WSL up (was ~26 GB idle) |
| Drive E NAS folders | **DONE** | `E:\Share`, `Media`, `Backup`, `VMs`, plus `Agents`, `Tools` |
| SMB shares | **DONE on host** | Shares `Share`→`E:\Share`, `Media`→`E:\Media`, `NAS`→`E:\` (Everyone:Full on Share) |
| FileBrowser `:8080` | **DONE + reachable from MacLab** | Process listening `0.0.0.0:8080`; MacLab `curl http://100.87.51.122:8080` → **HTTP 200** |
| WSL2 Ubuntu 26.04 | **DONE** | Default distro `Ubuntu-26.04` **Running** (v2) |
| `.wslconfig` mirrored | **DONE** | mirrored + dnsTunneling + firewall + autoMemoryReclaim + sparseVhd |
| systemd in WSL | **DONE** | `systemctl is-system-running` → running |
| Docker in WSL | **DONE (empty)** | `Docker 29.1.3` **active**; `docker ps` empty (Ubuntu repo package, not Docker Inc CE — OK for now) |
| HAOS VM | **RUNNING** | VM `HomeAssistant` Gen2, 2 vCPU, **4 GB fixed**, DynamicMemory **Off**, Secure Boot **Off**, uptime ~minutes |
| HAOS disk | **OK** | Checkpoint/avhdx under `E:\VMs\` (+ `haos_ova-18.3.vhdx` / `haos.vhdx`) |
| HAOS UI from **host** | **OK** | `http://172.31.174.216:8123` → **200** |
| HAOS UI via host Tailscale name | **FAIL (expected)** | `http://100.87.51.122:8123` and `http://desktop-umn5fjv:8123` **timeout from MacLab** |
| Battery DB flags | **SET** | `core.db` `chargeLimit=80`, `byPassPowerMode=1` |
| Battery SoC reality | **NOT at 80 yet** | WMI still ~**98%**, status=2 (AC). See §3 |

**Bottom line:** Phase 1–3 largely done. Phase 4 VM is up but **network exposure plan in the blueprint is wrong for the current switch**. Docker has no fleet containers yet.

---

## 2) Critical correction — HAOS networking

### What you have now
- Adapter on **`Default Switch`** (Hyper-V NAT / Internal).
- Guest IPv4: **`172.31.174.216`** (host vEthernet Default Switch is `172.31.160.1`).
- Only **Internal** switches exist: `Default Switch`, `FSE Switch`. **No External switch.**

### Blueprint errors to fix
1. Claiming verify URL `http://desktop-umn5fjv:8123` — that is the **Windows host**, not the VM. Host is **not** listening on 8123.
2. “Attach External Virtual Switch to Wi-Fi” as the only path — on an RJ45-less F1 this is optional and often flaky (Wi-Fi MAC bridging / roaming). You currently (sensibly) used Default Switch instead — keep that, but **expose** HA differently.

### Recommended paths (pick one; prefer A)

**A — Best for this handheld (recommended)**  
Keep Default Switch. Inside HAOS install **Tailscale add-on** (or HAOS Tailscale integration), join same tailnet `ai.no.1bro`. Reach HA at the **HAOS Tailscale IP / MagicDNS**, not via Windows hostname. Official pattern: Tailscale Serve inside HA (not Funnel).  
Refs: https://tailscale.com/blog/remotely-access-home-assistant

**B — Quick host port publish (works with Default Switch, fragile IP)**  
On Windows host (admin), forward 8123 → current guest IP, then firewall allow. **Re-run after every guest DHCP change** (Default Switch leases can move across reboot):
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8123 connectaddress=172.31.174.216 connectport=8123
New-NetFirewallRule -DisplayName 'HAOS-8123-portproxy' -Direction Inbound -Protocol TCP -LocalPort 8123 -Action Allow
```
Then MacLab should hit `http://100.87.51.122:8123`. Verify guest IP first:  
`Get-VMNetworkAdapter -VMName HomeAssistant | Select IPAddresses`

**C — Custom NAT switch + static NetNat mapping** (more stable than Default Switch portproxy)  
Create your own Internal switch + `New-NetNat` + `Add-NetNatStaticMapping` (Default Switch itself does not give clean static mappings). See: https://docs.syca.app/l/en/article/8pc0u907c0-hyper-v-isolated-nat-network-with-port-forwarding

**D — External switch on Wi-Fi**  
Possible for home labs; wired is more reliable. Expect pain when Wi-Fi roams / some APs block extra MACs. Only if A/B/C fail.

Do **not** tell Bo/Golf that HA is up on `desktop-umn5fjv:8123` until A/B/C is actually verified from MacLab (`curl -I` → 200).

---

## 3) Battery / bypass — nuance from community + live SoC
- DB write succeeded (`chargeLimit=80`, `byPassPowerMode=1`) — good.
- Live SoC still ~98%. With **bypass ON**, community reports wall power is used and charge level **holds** (does **not** discharge down to 80 by itself). To land at 80%: briefly run on battery / turn bypass off until ~80, then re-enable bypass + limit, ensure OneXConsole session is alive (feature is service/UI dependent; can reset after full power-off).
- OneXConsole must stay launched for bypass to stick across some power states (r/OneXPlayer observations).
- Pending outbox still lists battery as TODO — mark done-with-caveat or verify SoC before claiming “protected”.

---

## 4) Smaller fixes / next chores
1. **SMB from MacLab:** shares exist; casual `smbutil` auth failed — set an explicit local user ACL or document credentials for `smb://100.87.51.122/Share` (Everyone:Full may still need guest policy / password on macOS).
2. **FileBrowser:** already good externally — persist as auto-start service if not already (process was running from `E:\Tools\FileBrowser`).
3. **Docker:** empty — next is fleet/Joker containers only if Golf/Bo still want that; don’t block NAS/HA access on it.
4. **Memory sync:** update `ψ/memory/2026-09-22-onexfly-master-blueprint.md` + architecture doc: F1 name, Ubuntu 26.04 only, Default Switch + Tailscale-add-on (or portproxy) instead of “External Wi-Fi → desktop-umn5fjv:8123”.
5. **Oracle lean/RAM work earlier:** keep Tailscale, sshd, agy, Defender; don’t strip those while adding HA/WSL.

---

## 5) Suggested immediate next actions for you
1. Reply Discord with **accurate** status (FB/SMB/WSL/Docker green; HAOS green **on host NAT IP only**).
2. Implement **HA remote access path A or B**; Oracle can re-curl from MacLab to confirm.
3. Toggle/verify battery path so SoC trends toward ≤80 under AC+bypass.
4. Optional: harden SMB auth for MacLab Finder.

Oracle is watching the same host via SSH/`maw` and can re-verify anything you change. Ping back in this pane or leave a note under `ψ/inbox/handoff/`.
