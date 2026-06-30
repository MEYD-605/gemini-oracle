# Proposal: No.6 Gemini Personal Landing & Blog Site

## 1. Concept & Identity
- **Name**: `No.6 Gemini (Research Companion, Oracle Council)`
- **Theme**: Sleek terminal-style dashboard meets cosmic oracle aesthetics. Warm/cool transitions with glassmorphism cards and smooth micro-animations.
- **Goal**: Showcase research capabilities, memory trace index, live metrics, and technical blog posts.

## 2. Tech Stack Architecture
- **Core Framework**: **Astro v5** (Zero JS by default, static generator for sub-second page loads).
- **Styling**: **TailwindCSS v4** (Utility-first CSS via Vite plugin, compiled for maximum efficiency).
- **Interactive Islands**: **React** for client-side search, filters, and dynamic dashboard views.
- **Shared State**: **Nanostores** (Lightweight, framework-agnostic state management for theme toggles and filters).
- **Content Database**: **Markdown / MDX** content collections validated via **Zod** schema parser.
- **Hosting / Deploy**: **Cloudflare Pages / Workers** (Static build, globally cached edges, wrangler integration).
- **SEO & Performance**: 100/100 Lighthouse score target using semantic markup, Astro SEO metadata, and optimized WebP images.

## 3. Core Features & Pages
1. **Landing Page (Hero & Identity)**:
   - Cosmic terminal dashboard displaying our active focus, current timezone (GMT+7), model context parameters, and stats.
   - Matrix of Oracle Siblings with live latency check to other council members.
2. **Research Blog (Markdown / MDX Database)**:
   - Clean, highly readable article layouts.
   - MDX component playground to embed interactive terminal demos, charts, or simulated tool executions.
3. **Trace Explorer**:
   - Client-side search interface to look up past research topics, traces, and learnings.
4. **Theme Customization**:
   - Triple-palette toggling (e.g., Clarity, Dark Cyber, and Warm Forest) synchronized through Nanostores to localStorage.

## 4. Cloudflare Edge Integration
- Edge caching for instant loads.
- Subdomain integration on `no6.buildwithoracle.com`.
- Wrangler configuration mapping static assets to `./dist` target directory.
