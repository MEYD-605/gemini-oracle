# Handoff 2026-10-21 23:45 — HAOS owner reset + lane B (backup/areas/alerts/dashboard) + pipes

## Done (verified)
- HAOS owner `bo` reset via vfkit pty console; creds ~/.arra-memory/haos-owner.txt, LLT ~/.arra-memory/haos-token.txt. Login test create_entry OK (No.1 closed it).
- Versions all latest: HAOS 18.3 / Core 2026.10.2 / Supervisor 2026.10.3. TZ Asia/Bangkok, TH, THB.
- Backup: daily 03:30, 7 copies, encrypted (key ~/.arra-memory/haos-backup-key.txt). Off-VM pull ~/VMs/haos/haos-backup-offsite.sh -> ~/Backups/haos, launchd com.maclab.haos-backup-offsite 04:15 (bootstrapped by No.1).
- Floors 5 + areas 9, 22 devices assigned. Dashboard /fleet-home (overview/agents/system).
- Automations no4_*: ram<5%, disk>90%, sensor stale 15m, backup failed, seat offline 5m, 9router down 3m.
  Each -> vivo push + Discord (HA discord integration w/ No.4 bot token, notify.no_4 target Bo DM, tested) + persistent + MQTT oracle/<seat>/main/in (01-lord-knight / 88-sombo) — HA->agent tested.
- Sombo hung 23:16 (0% CPU, jsonl frozen, oracle-channel still "online"); No.1 killed+respawned (D-046). Lane A resent; new Sombo working on it.

## Open
- Sombo lane A: sensor-sync -> MQTT discovery, house devices, ~20 seats, binary_sensor.maclab_hq_9router, fix alive count.
- Hung-agent detector (jsonl mtime stale >15m while request in-flight) — design with No.1 tomorrow.
- Bo decisions: NAS Club S unmounted since 08-23; delete disk clone haos-ova-disk.img.bak-pre-authreset-20261021; clean stale MQTT names (99-bridgetest, test-agent, 04-mimo-x...).
