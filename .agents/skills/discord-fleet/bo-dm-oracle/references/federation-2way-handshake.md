# Federation 2-Way Handshake & Peer Pubkey Diagnostics

## Background
When sending a `maw hey` message across federation nodes (e.g. from `maclab` to `natz-ai-03`), the receiving node's `maw-rs` daemon verifies the sender's public key against its local `peers.json` or authorized keys store.

## Common Error: HTTP 401 Unauthorized (`refuse-missing-peer-key`)
```text
hey: remote /api/send returned HTTP 401: unauthorized [decision=refuse-missing-peer-key] — sender's pubkey is not in the receiver's peers.json — or the receiver's serve loaded pubkeys at startup and needs a restart after the peer was added
```

## Diagnostic & Remediation Steps

1. **Verify Local Configuration (`maw.config.json`)**:
   Check if the target node is listed under `namedPeers` in `~/.config/maw/maw.config.json`:
   ```json
   {
       "namedPeers": {
           "natz-ai-03": "http://100.122.59.94:3456"
       }
   }
   ```
   *Note*: In `maw.config.json`, `namedPeers` is a JSON dictionary mapping peer names to their base URLs, NOT an array/list.

2. **Verify Public Key Registration on Remote Node**:
   The remote node must have the local node's pubkey in its `~/.maw/auth/` directory or `peers.json`.
   To get the local node's pubkey:
   ```bash
   curl -s http://127.0.0.1:3456/api/identity | jq .pubkey
   ```

3. **Remote Daemon Restart**:
   `maw-rs serve` loads authorized pubkeys at startup. After adding a new peer or pubkey file on the target node, the remote `maw serve` daemon MUST be restarted to reload the pubkey store.
