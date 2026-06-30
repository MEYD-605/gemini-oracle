# Landing Oracle — Quick Reference Guide

This document serves as a comprehensive reference guide for the **Landing Oracle** codebase, an Astro 5 + Cloudflare Workers web presence consultant and pattern keeper (Oracle #154).

---

## 1. Project Overview & Architecture

**Landing Oracle** is the central dashboard and landing page gallery deployed at `gallery.buildwithoracle.com` and `landing.buildwithoracle.com`. It tracks the web presence of the 76+ Oracles in the family, visualizing the gap between the live subdomains and the overall ecosystem.

### Core Architecture
- **Framework**: [Astro 5.x](https://astro.build/) in `static` output mode.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) configured via `@tailwindcss/vite`.
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores) for client-side theme/palette sync.
- **Hosting / Deploy**: [Cloudflare Workers & Pages](https://workers.cloudflare.com/) (`wrangler`).

### Codebase Sitemap
- [package.json](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/package.json) — Dependencies, scripts, and build setup.
- [astro.config.mjs](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/astro.config.mjs) — Astro integration configuration.
- [wrangler.toml](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/wrangler.toml) — Cloudflare Workers deployment paths.
- [src/content.config.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/content.config.ts) — Content Collection schemas.
- [src/data/oracles/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles/) — Markdown-based profiles for all tracked Oracles.
- [src/layouts/Base.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/layouts/Base.astro) — Main page structure and FOUC prevention.
- [src/styles/global.css](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/styles/global.css) — Custom theme palettes and CSS variables.
- [src/stores/theme.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts) — Theme switcher logic.
- [src/components/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/) — Layout sections (`Nav.astro`, `GalleryCard.astro`, `PaletteToggle.astro`).
- [src/pages/index.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/pages/index.astro) — Main landing page structure and logic.

---

## 2. Installation & Scripts

The project utilizes **Bun** as its package manager (indicated by the presence of [bun.lock](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/bun.lock)).

### Installation
To install dependencies, run:
```bash
bun install
```

### Script Commands
Run these commands via your preferred package manager (e.g., `bun run <script>`):

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `dev` | `astro dev` | Starts the Astro development server locally. |
| `build` | `astro build` | Bundles static assets to the `./dist` directory. |
| `preview` | `astro preview` | Previews the built production site locally. |

---

## 3. Configuration

### Astro Config
The configuration file [astro.config.mjs](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/astro.config.mjs) is configured as follows:
- **`output: "static"`**: Outputs pre-rendered static HTML files.
- **`adapter: cloudflare()`**: Integrates with Cloudflare.
- **`vite` Configuration**:
  - Incorporates `@tailwindcss/vite` for Tailwind v4.
  - Excludes the `**/ψ/**` directory from the development watcher to prevent infinite hot-reload loops when metadata is logged.

### Cloudflare Wrangler
The [wrangler.toml](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/wrangler.toml) configuration specifies:
- **`routes`**: Maps `gallery.buildwithoracle.com` and `landing.buildwithoracle.com` to the Worker.
- **`[assets]`**: Sets the static directory output to `./dist` for deployment.

---

## 4. Key Features & Examples

### A. Content Collections (Oracle Directory)
Oracle entries are configured as a content collection inside [src/content.config.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/content.config.ts).

```typescript
// Define the 'oracles' collection schema
const oracles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/oracles" }),
  schema: z.object({
    name: z.string(),
    number: z.string().optional(),
    domain: z.string().optional(),
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    stack: z.array(z.string()).optional(),
    screenshot: z.string().optional(),
    status: z.enum(["live", "known"]),
  }),
});
```

#### Example Profile Markdown
Markdown files are placed in [src/data/oracles/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles/).

**Live Oracle**: [antigravity.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles/antigravity.md)
```markdown
---
name: Antigravity
domain: antigravity.buildwithoracle.com
primary: "#a78bfa"
secondary: "#f472b6"
background: "#0d1117"
stack: ["Static HTML", "Cloudflare Workers"]
screenshot: /screenshots/antigravity.png
status: live
---

เทพปีศาจแห่งความฝัน. Multi-hub landing — CV, Ether Race, Chain Observer. PSRU Workshop.
```

**Known / Missing Oracle**: [brewmaster.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles/brewmaster.md)
```markdown
---
name: Brewmaster
primary: "#d97706"
secondary: "#f59e0b"
background: "#1a1005"
status: known
---
```

---

### B. The Theming & Palette System
The codebase features a custom, rotating theme system containing 3 main color palettes defined as CSS variables in [src/styles/global.css](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/styles/global.css):

1. **Clarity** (Default): Indigo-to-violet gradients with deep slate backgrounds.
2. **Royal**: Rich purple and golden accents (`#f59e0b` primary).
3. **Nature**: Emerald greens (`#4ade80` primary) with earthy accents.

```css
/* Styling bindings in global.css */
html[data-palette="clarity"] {
  --theme-bg: #0f172a;
  --theme-primary: #818cf8;
  --theme-icon: "◇";
  --theme-label: "Clarity";
}
```

#### FOUC (Flash of Unstyled Content) Prevention
To prevent style flickering before Javascript mounts, a blocking inline script in [src/layouts/Base.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/layouts/Base.astro) reads the saved local storage values and sets `data-palette` immediately.
```html
<script is:inline>
  (function () {
    var p = localStorage.getItem("landing-oracle-palette");
    if (p && ["clarity", "royal", "nature"].indexOf(p) !== -1) {
      document.documentElement.setAttribute("data-palette", p);
    } else {
      document.documentElement.setAttribute("data-palette", "clarity");
    }
  })();
</script>
```

#### Palette State Management
State is managed reactively with **Nanostores** inside [src/stores/theme.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts). It exports three primary controls:
- [initPalette](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts#L15): Sets the initial palette from storage and checks if auto-rotation is enabled.
- [cyclePalette](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts#L30): Manually increments palettes, disabling auto-rotate.
- [toggleRotation](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts#L38): Toggles the 6-second auto-rotate interval loop.

---

### C. Core Components & Visual Usages

#### 1. Nav Bar Component ([src/components/Nav.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/Nav.astro))
Renders the macOS-like glassy navigation header and places the palette controls.

#### 2. Palette Toggle ([src/components/PaletteToggle.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/PaletteToggle.astro))
Renders toggle buttons for manual rotation and palette cycling. Employs client-side TypeScript subscribing to `$palette` and `$rotating` stores:
```typescript
$palette.subscribe(updatePalette);
$rotating.subscribe(updateRotate);
```

#### 3. Gallery Card ([src/components/GalleryCard.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/GalleryCard.astro))
Represents a single Oracle in the Gallery, showing its name, sub-domain, and screenshot with a custom glass hover effect.
- Custom properties configured via `data-` attributes enable client-side search/filtering:
  ```html
  <a
    href={`https://${oracle.domain}`}
    class="gallery-card group relative"
    data-status="live"
    data-name={oracle.name.toLowerCase()}
    data-stack={oracle.stack?.join(",").toLowerCase() ?? ""}
  >
  ```

---

### D. Main Landing Page & Interactive Systems

The main structure is declared in [src/pages/index.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/pages/index.astro).

#### 1. Search & Tag Filtering
Client-side search reads inputs and checks them against the dataset of card element properties:
```javascript
function applyFilters() {
  const query = searchInput?.value.toLowerCase().trim() ?? "";
  const cards = grid.querySelectorAll(".gallery-card");
  let visible = 0;

  cards.forEach((card) => {
    const name = card.dataset.name ?? "";
    const stack = card.dataset.stack ?? "";
    const matchesSearch = !query || name.includes(query) || stack.includes(query);
    const matchesFilter = activeFilter === "all" || stack.includes(activeFilter);
    const show = matchesSearch && matchesFilter;
    
    card.classList.toggle("hidden-by-filter", !show);
    if (show) visible++;
  });
}
```

#### 2. Gap Grid Visualization (The Dot Matrix)
Displays a layout representing every Oracle in the family. Colors are dynamically assigned based on the Oracle's `primary` color variables.
- **Lit dots (`.lit`)**: Represent live Oracles. Hovering loads preview screenshots using standard CSS custom property variables: `--preview-img:url(...)`.
- **Known dots (`.known`)**: Muted, semi-transparent dots representing existing Oracles without active sites.
- **Dim dots (`.dim`)**: Placeholders for remaining undocumented slots in the 76+ family.

#### 3. Scroll Reveal System
Utilizes an `IntersectionObserver` to trigger fade-in animations on elements with the `.reveal` class.
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
```
