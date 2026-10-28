# ha-fusion Learning Index

## Source
- **Origin**: ./origin/
- **GitHub**: https://github.com/knowald/ha-fusion
- **Original Upstream**: https://github.com/matt8707/ha-fusion

## Explorations

### 2026-10-28 1046 (default - 3 agents)
- [[2026-10-28/1046_ARCHITECTURE|Architecture]]
- [[2026-10-28/1046_CODE-SNIPPETS|Code Snippets]]
- [[2026-10-28/1046_QUICK-REFERENCE|Quick Reference]]

**Key insights**:
1. **Modern Svelte 5 + SvelteKit Stack**: Zero Shadow DOM or heavy Web Component overhead (unlike native Lovelace). Compiles down to lean, reactive JavaScript using Svelte 5 runes (`$state`, `$derived`, `$props`), making it extremely fast and memory-efficient on low-spec hardware like Smart TVs.
2. **True Smart Home Web OS Experience**: WYSIWYG drag-and-drop dashboard editor with Konva 2D floorplans, optimistic UI toggles, horizontal light sliding gestures, HLS/WebRTC camera feeds, YouTubei integration, and Apple VisionOS-inspired glassmorphism.
3. **Resilient HAOS & Ingress Integration**: Zero database needed — persists cleanly to `./data/dashboard.yaml` and `./data/configuration.yaml`. Express server handles dynamic Ingress proxying and long-lived access token fallback for Companion App and standalone setups.
