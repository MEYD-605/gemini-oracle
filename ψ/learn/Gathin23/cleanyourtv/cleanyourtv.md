# cleanyourtv Learning Index

## Source
- **Origin**: ./origin/
- **GitHub**: https://github.com/Gathin23/cleanyourtv (formerly `tv-vibehack`, renamed 2026-10-19)

## Explorations

### 2026-10-19 1803 (default, 3 agents)
- [[2026-10-19/1803_ARCHITECTURE|Architecture]]
- [[2026-10-19/1803_CODE-SNIPPETS|Code Snippets]]
- [[2026-10-19/1803_QUICK-REFERENCE|Quick Reference]]

**Key insights**:
- Debloats Android TV / Google TV over ADB using reversible `pm disable-user` (nothing uninstalled), after a full backup + generated restore script, then installs a small native launcher (Java 17, AGP 8.5.2, Gradle 8.9, minSdk 26 / targetSdk 34).
- Designed to be driven by an LLM agent via `PROMPT.md`; host tooling is `tools/tv.py` (python `adb-shell`, `rsa`, `cryptography`) plus `disable.sh` / `restore.sh`; per-model debloat lists live in `examples/` (30 verified at learn time).
- `LICENSE` is MIT plus an SIL OFL 1.1 note for the Outfit font; the OFL tail is why GitHub reports NOASSERTION.
- Sony notes: only BRAVIA 4K UR2 and XBR-X900E are listed; disable the stock launcher only after the new one is installed; screencap is empty during Live TV/HDMI.

**Verification (main review)**: contamination grep (host vocabulary) = 0 hits in all 3 docs; build versions, `examples/` count (30), dependency list and cited class names (`GlassView`, `vividColor`, `InputKeyService`, `KEYCODE_TV`) checked against SOURCE_DIR.
