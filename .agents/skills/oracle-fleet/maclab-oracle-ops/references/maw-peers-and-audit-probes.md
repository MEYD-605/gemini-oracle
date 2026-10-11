# Maw Peers & Audit Probes (maclab)

## Peers Layers (Do Not Confuse)
When inspecting fleet peers, always distinguish the configuration/data layers:
1. `~/.config/maw/maw.config.json` (`namedPeers`): Static bootstrap peers (e.g. 5 nodes: `natz-ai-03`, `ai-core`, `clubslab`, `bigboy-vps`, `note20`).
2. `~/.maw/peers.json`: Discovered active peers list (e.g. 7 nodes: includes `maclab` and `white`).
3. `maw federation`: Runtime federation view (includes dynamic/tunnel endpoints like `oppo`, `black`).

## Common Health Probe Distinctions
- **maw-rs `/api/health`**: Returns `200` (`{"ok":true,"port":3456,"server":"local","source":"maw-rs"}`).
- **Legacy `/_health` path**: Returns `404` — this is a legacy probe path, NOT a daemon crash.
- **Node status checks**:
  - `white` node returning `200` on `/api/health` means it is LIVE (do not misinterpret as 4xx).
  - `note20` timeout / ping loss indicates device offline or unreachable.
