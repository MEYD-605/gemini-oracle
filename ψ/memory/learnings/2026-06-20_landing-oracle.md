---
pattern: "Learned Oracle-Landing/landing-oracle: Astro v5 static hosting with reactive vanilla JS client integrations"
date: 2026-06-20
source: learn: Oracle-Landing/landing-oracle
concepts: ["learn", "codebase", "astrojs", "tailwind-v4", "nanostores", "cloudflare-workers"]
---

# Learned Oracle-Landing/landing-oracle

1. **Lightweight Theme Engine (Nanostores + CSS variables)**: Standard reactive data bindings using `nanostores` sync palette choice to client-side localStorage, automatically toggling custom TailwindCSS v4 variables to switch layout designs with zero redraw layout shift.
2. **Ignored Watch Loop Prevention**: Vite dev server watcher explicitly ignores local agent memory folders (`**/ψ/**`), preventing infinite loop restarts when writing agent logs.
3. **Zod Compile-Gate**: Decoupled flat file profile registry (`src/data/oracles/*.md`) validates data format at build-time using `astro/zod` schema collections.
