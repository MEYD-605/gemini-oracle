# Gateway Config Root Keys & Bridging

When inspecting or verifying Hermes configuration settings:

- **Top-level Gateway Keys**: Options such as `group_sessions_per_user`, `thread_sessions_per_user`, `stt_echo_transcripts`, `reset_triggers`, and `unauthorized_dm_behavior` can be set at the root level of `config.yaml` rather than nested under `gateway:`.
- **Known Root Keys**: In `hermes_cli/config.py`, `_EXTRA_KNOWN_ROOT_KEYS` explicitly lists these root-level keys so that `hermes config check` does not report them as unrecognized or invalid root keys.
- **Runtime Bridging**: At runtime, `gateway/config.py` bridges top-level config options into `GatewayConfig`, ensuring they work seamlessly whether placed at root level or nested under `gateway:`.
