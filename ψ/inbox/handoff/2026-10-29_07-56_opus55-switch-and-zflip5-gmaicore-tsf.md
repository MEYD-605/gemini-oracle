# Handoff: Switch to Opus 5.5 (`opus-5.5[1m]`) after Z Flip 5 `gmaicore` Rdda Template & TSF Tuning

**Date**: 2026-10-29 07:56 GMT+7  
**Context**: ~6%  
**Session**: No.88 Sombo (The Secretary)  
**Model for next session**: `opus-5.5[1m]` (Bo 07:55 MM: "เดี๋ยวมึงเปลี่ยนเป็น opus5.5 แล้ว forward")

---

## ⚡ FIRST THING NEXT SESSION (ON RETURN)
1. Send SOMBO RETURN PROTOCOL report to Bo's Mattermost DM (`chat_id=mm-zxbf5ks4gbrf7jz4zzaqk97pfy`) confirming `opus-5.5[1m]` is active.
2. Notify No.1 (`01-lord-knight`) via `oracle-channel` (`[maclab:88-sombo] sombo respawned on opus-5.5[1m]`).

---

## Done this session (verified)
- **Post-AC Relocation Recovery & Docker RestartPolicy Fix**:
  - Updated `mattermost-app`, `mattermost-postgres`, `arra-v4`, `searxng`, `uptime-kuma` to `--restart=always` so manual `docker stop` can never leave them stopped on boot.
  - Killed stray `meyd-core` `/login` windows (`88-sombo:0`, `02-high-wizard:0`).
  - Merged `MEYD-605/sombo-oracle#31` (`gitleaks` clean, `0 held`).
- **Z Flip 5 (`192.168.1.197`) `gmaicore` Native Gateway (Rdda Golden Template)**:
  - Root-caused `@gmaicore` stateless hallucination in `hermes-mattermost-daemon.py`.
  - Disabled MacLab stand-in listener (No.1) and verified native Termux daemon (`~/gmaicore-oracle/scripts/gmaicore_mattermost_bot.py`, `PID 23934`, deployed by No.4) is live with `session_history.json` + live tool progress.
- **Z Flip 5 Samsung Account Freeze & Cover Screen TSF Shell Tuning**:
  - Backed up `goodlock`, `multistar`, `routines`, `themestore`, `themecenter`, `com.osp.app.signin` APKs to `/sdcard/Download/Samsung_Core_APKs/`.
  - Disabled `com.samsung.android.mobileservice` + `com.samsung.android.scloud` and suspended `com.osp.app.signin` (`suspended=true, stopped=true`) so `jaysonknappy@gmail.com` cannot prompt or sync.
  - Set default IME to Gboard, granted all AppOps to `com.tsf.shell` & `dev.opencover`, whitelisted Gboard/MultiStar/GoodLock in Doze, and extended `cover_screen_timeout` to `120s`.
- **Model Switch to `opus-5.5[1m]`**:
  - Updated `~/.claude/channels/discord-sombo/anthropic-model`, `~/.claude-sombo/settings.json`, and `fleet/desired-state.yaml` to `opus-5.5[1m]`.
