---
title: Discord VOICE BOT for No.6 (Gemini-voiced agent in a voice channel) — built+veri
tags: [discord, voice-bot, no6, gemini-tts, pycord, antigravity, stt, kore]
created: 2026-06-03
source: session: 2026-06-03 voice-bot build
---

# Discord VOICE BOT for No.6 (Gemini-voiced agent in a voice channel) — built+veri

Discord VOICE BOT for No.6 (Gemini-voiced agent in a voice channel) — built+verified 2026-06-03. KEY LESSONS: (1) REUSE the agent's existing bot token — NO new bot needed. No.6 text is REST-based (reply tool=REST send, relay poller=REST receive) so its Discord GATEWAY is FREE for a voice connection. Probed: No.6 token has Connect+Speak on all ClubsXai/HUMAN SCHOOL voice channels. (2) Stack: py-cord 2.8.0 [voice] + PyNaCl + libopus + ffmpeg; google-genai 2.7.0. (3) TTS = Gemini gemini-2.5-flash-preview-tts voice 'Kore' (natural Thai, beats piper); STT-free: Gemini gemini-2.5-flash takes audio INPUT directly via types.Part.from_bytes(mime=audio/wav) — listen+understand in one call. (4) py-cord voice 'Task got Future attached to a different loop' bug FIX = use client.run(TOKEN) (not asyncio.run(client.start())) AND pre-generate TTS WAV before the bot loop (don't block on_ready). (5) Conversational loop = start_recording(WaveSink)/sleep(window)/stop_recording → callback gets per-user au.file.getvalue() → Gemini audio-in reply → TTS → vc.play(FFmpegPCMAudio). (6) sustained voice = 2nd gateway as No.6 flaps the discord-plugin gateway but No.6 TEXT survives (REST). Scripts: /tmp/img2vid/voicebot_p1.py (speak) + voicebot_chat.py (converse).

---
*Added via Oracle Learn*
