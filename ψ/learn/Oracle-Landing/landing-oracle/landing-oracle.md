# landing-oracle Learning Index

## Source
- **Origin**: ./origin/
- **GitHub**: https://github.com/Oracle-Landing/landing-oracle

## Explorations

### 2026-06-20 16:51 (--deep)
- [[2026-06-20/1651_ARCHITECTURE|Architecture]]
- [[2026-06-20/1651_CODE-SNIPPETS|Code Snippets]]
- [[2026-06-20/1651_QUICK-REFERENCE|Quick Reference]]
- [[2026-06-20/1651_TESTING|Testing]]
- [[2026-06-20/1651_API-SURFACE|API Surface]]

**Key insights**:
1. **Nanostores Theme Engine**: Theme changes are managed using Nanostores and synced client-side via LocalStorage, dynamically toggling custom property maps for TailwindCSS v4 theme palettes (`clarity`, `royal`, `nature`).
2. **Ignored Watch Loop Prevention**: The `astro.config.mjs` prevents dev server infinite restart loops by explicitly adding `**/ψ/**` to Vite's watcher ignore list, which allows local agents to save shared memories without breaking the dev server.
3. **Zod Validation of Oracle Gallery**: Registries of Oracles are written as simple static markdown files in `src/data/oracles/*.md`. Schema parsing at build-time acts as the primary quality gateway.
