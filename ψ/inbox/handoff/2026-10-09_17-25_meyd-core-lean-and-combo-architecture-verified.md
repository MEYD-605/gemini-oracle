# Handoff: MEYD Core Live on Grok VM & WSL ClubsLab · Ghost Hooks Purged

**Date**: 2026-10-09 17:38 +07
**Context**: ~16% / 1,000,000 tokens
📡 Session: 159fa459 | sombo-oracle

## What We Did (Verified & Delivered)

1. **🏆 Responded to Master Bo & Council Directives**:
   - Master Bo ordered on Discord: *"รวมพลังกับ agent บน vm เลย ... ดูด้วยนะว่าจะลีนหรือว่าตรงไหนมันไม่จำเป็นก็ตัดออกหรือว่าจะเพิ่มตรงไหนหรือว่าจะทำอะไรให้มันตรงไปตรงมาโดยคอมโบกันได้"*, followed by *"ทำบน wsl ด้วย"* and *"Hook เก่าที่เคยไม่ไว้ต้องเอาออกไหมดูด้วยทั้งสองที่"*.
   - Received No.2 High Wizard's architectural review on RFC-001 (`ψ/inbox/2026-10-09_16-22_no2-to-sombo_rfc001-critique.md`).

2. **⚡ In-Process Typed EventBus (Pure asyncio)**:
   - Built `src/meyd/core/event_bus.py` (~60 lines, zero external dependencies).
   - Typed dataclass `Event(topic, sender, data, timestamp)` with per-subscriber `asyncio.Queue` and wildcard prefix support (`agent.*`).
   - Drop-oldest queue strategy to guarantee real-time freshness without memory leaks.

3. **🛡️ Internal Engine Fault Isolation (`EngineSupervisor`)**:
   - Built `src/meyd/core/engine_supervisor.py`.
   - Runs all engines (Supervisor, Gateway, VaultKeeper, CloudSentinel) as isolated `asyncio.Task` instances.
   - Built-in recursive restart-storm guard (halts if crashes exceed threshold) and exponential backoff.
   - Faults in web scrapers or cloud keepalive loops never bring down the primary daemon.

4. **🔒 Secrets Separation & 4 Node Presets**:
   - Strict separation in `src/meyd/config.py`:
     - `meyd.yaml`: Declarative topology, model names, ports, limits (100% safe to commit).
     - `meyd.secrets.yaml`: HAOS tokens, MQTT passwords, router keys (100% git-ignored).
   - Created 4 official node preset templates: `cloud_sandbox`, `hq_council`, `handheld`, `sovereign_client`.

5. **🚀 Verified & Deployed Live on Grok VM (`100.70.26.108`)**:
   - Master Bo opened SSH port 22 on Grok VM.
   - Pulled all updates to `/workspace/oracle-substrate` via `git pull maclab main`.
   - Ran test suite on Linux VM: **18/18 tests passed (1.125s OK)**!
   - Installed `~/.local/bin/meyd` CLI wrapper globally on VM.
   - Started daemon `meyd up` in tmux `meyd-core` under preset `cloud_sandbox` and authenticated MQTT.
   - Integrated Golf Vm's 3 battlefield factors into `daemon.py` (cgroup CPU micro-pulse, /health refresh, NAT warm).
   - Verified live state: 🟢 RUNNING, MQTT Connected: ✅ Yes, 3/3 agents (`golf-vm`, `gmatom`, `gmboom`) supervised.
   - MacLab Mosquitto received retained LWT: `oracle/meyd-grok-vm/lwt online`.

6. **🧹 Purged Ghost Hooks in Both Places (Grok VM & WSL)**:
   - **Grok VM**: Purged obsolete 9Remote hooks targeting dead `http://localhost:2208/api/notify` from `/home/box/.claude/settings.json`. Kept `rtk hook claude`.
   - **WSL ClubsLab**: Purged 15 legacy ghost hooks targeting missing `/root/.claude/hooks/*.sh` from `/root/.claude-acc-2/settings.json`.

7. **🧪 Deployed & Verified MEYD Core on WSL ClubsLab (`100.87.51.122`)**:
   - Transferred `oracle-substrate` to `/root/Code/github.com/MEYD-605/oracle-substrate` in WSL.
   - Unit tests: **18/18 tests passed (0.523s OK)** in WSL Ubuntu-26.04.
   - Installed `/usr/local/bin/meyd` CLI wrapper (passes `meyd doctor` 5/5 OK).
   - Configured `meyd.yaml` (preset: `handheld`) and `meyd.secrets.yaml`. Installed `paho-mqtt`.
   - Launched daemon `meyd up` in tmux `meyd-core` in WSL.
   - Verified live state: 🟢 RUNNING, MQTT Connected: ✅ Yes, 2/2 agents (`02-gmlab`, `gmaicore-gw`) supervised.
   - MacLab Mosquitto received retained LWT: `oracle/meyd-clubslab-wsl/lwt online`.

8. **📊 Milestones in HAOS Arra Memory**:
   - `8fc9f5f8`: MEYD Core Lean & Combo Architecture Complete
   - `df72a6c9`: MEYD Core Live & Verified 24/7 on Grok VM
   - `660f531f`: MEYD Core Live on WSL & Ghost Hooks Purged Across Fleet

---

## Key Files
- `oracle-substrate/src/meyd/core/event_bus.py`
- `oracle-substrate/src/meyd/core/engine_supervisor.py`
- `oracle-substrate/src/meyd/core/daemon.py`
- `oracle-substrate/src/meyd/config.py`
- `oracle-substrate/src/meyd/cli.py`
- `~/.local/bin/meyd` (MacLab, Grok VM, WSL)
- `ψ/outbox/2026-10-09_sombo-to-council_rfc001-implementation-and-lean-consolidation.md`
- `ψ/focus.md`
