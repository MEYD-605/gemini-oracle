# GM AI Core (Z Flip 5) — fleet links over LAN, no Tailscale · 2026-10-29 15:55

Bo: "ให้มันเชื่อม haos โดยไม่ต้องพึ่ง tailscale ... ไม่เคยทำให้เสร็จสักที". Done end to end, verified live.

## Added on phone (~/gmaicore-oracle/scripts, Termux)
- `gmaicore_fleet.py` (new): ArraMemory (MCP JSON-RPC → http://192.168.1.180:8099/mcp), FleetMQTT (paho 2.x → 192.168.1.180:1883, user fleet, sub oracle/gmaicore/+/in, pub /out + forward to asker oracle/<asker>/<room>/in, LWT oracle/gmaicore/lwt retained), look_at_image (9router vision, stream:false required — 9router streams image requests by default).
- `gmaicore_agent.py` patched: +5 tools (haos_remember, haos_recall, look_at_image, send_to_oracle, fleet_status) → 21 tools. Backup `.bak.20261029-1545-fleet`.
- `gmaicore_mattermost_bot.py` patched: starts FleetMQTT after agent; MQTT turns serialized via lock. Backup same stamp.
- Secrets: `~/.gmaicore/arra-bearer` (No.4's HAOS bearer), `~/.gmaicore/mqtt-pass` (fleet). mode 600.

## Verified
- Phone → HAOS recall/remember over LAN: OK (keyword mode; HAOS embedding provider unreachable = HAOS-side, not ours).
- MQTT: 04-mimo → oracle/gmaicore/main/in → answer on /out + fwd to oracle/04-mimo/main/in in 11s.
- Vision: screenshot → sonnet-5-5 description OK.
- Watchdog restarts daemon fine (tools=21).

## Open
- Android CLI on-phone (linux_arm64) untested; maclab has it at ~/.local/bin/android.
- Samsung account jaysonknappy still signed in (needs on-device tap).
