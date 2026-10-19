---
pattern: "Learned cleanyourtv: ADB debloat (pm disable-user, reversible) + custom Apple-TV-style launcher for Android/Google TV, LLM-driven via PROMPT.md; MIT + OFL font"
date: 2026-10-19
source: learn: Gathin23/cleanyourtv
concepts: ["learn", "codebase", "android-tv", "adb", "debloat", "launcher", "sony-bravia"]
---

# Learned cleanyourtv

- Repo (renamed from tv-vibehack on 2026-10-19) debloats Android TV / Google TV over Wi-Fi ADB with reversible `pm disable-user`, after a full package/settings backup and a generated restore script, then installs a small native launcher (Java 17, AGP 8.5.2, Gradle 8.9, minSdk 26 / targetSdk 34).
- Driven by an LLM agent through `PROMPT.md`; host tools are `tools/tv.py` (python `adb-shell`), `disable.sh`, `restore.sh`; 30 per-model debloat lists in `examples/`.
- `LICENSE` = MIT + SIL OFL 1.1 note for the Outfit font (the OFL tail makes GitHub report NOASSERTION).
- Bo's living-room TV is a Sony BRAVIA 4K "GB ATV3" (Google TV, 192.168.1.104, name S-B223): not in the repo's tested list (only BRAVIA 4K UR2 and XBR-X900E); ADB port 5555 was closed at 18:06 on 2026-10-19 until debugging is enabled on the TV.
- Docs: `ψ/learn/Gathin23/cleanyourtv/`.
