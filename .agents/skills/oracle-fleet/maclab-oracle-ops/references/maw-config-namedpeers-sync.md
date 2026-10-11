# Maw Config namedPeers Synchronization

## Pitfall & Configuration Source
On `maclab` (No.5 / GmForge), `maw` reads `~/.config/maw/maw.config.50.json` as its primary config source.

When adding a new node/peer (e.g. `boom` -> `http://100.78.55.116:3456`):
1. Adding to `~/.config/maw/maw.config.json` alone WILL NOT take effect in `maw config` or `maw hey`.
2. Running `maw hey boom:...` will fail with `error: node 'boom' not in namedPeers or peers`.

## Required Action
Always append/sync new peer entries into `~/.config/maw/maw.config.50.json` (`namedPeers` array):
```json
{
  "name": "boom",
  "url": "http://100.78.55.116:3456"
}
```
Or sync both `maw.config.json` and `maw.config.50.json` programmatically via Python.
