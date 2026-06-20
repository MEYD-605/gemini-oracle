# Project Rules: No.6 Gemini

## Development Loop & Git Safety Rules

1. **Astro Dev Server Watch Protection**:
   - In all Astro-based projects, ensure the Vite development server watch list ignores local agent workspace paths (`**/ψ/**` and `.agents/`).
   - Example configuration in `astro.config.mjs`:
     ```javascript
     export default defineConfig({
       vite: {
         server: {
           watch: {
             ignored: ["**/ψ/**", "**/.agents/**"]
           }
         }
       }
     });
     ```

2. **Git Staging Safety**:
   - When initializing new local repositories, always write a `.gitignore` file (at minimum excluding `node_modules/`, `dist/`, `.astro/`, and local caches) **before** running `git add .`.

3. **Impeccable Style Integration**:
   - Adhere to the design language anchors: use dark warm-black lacquer background settings (`oklch(7% 0.006 95)`), thin borders with low opacity (12-16%), and avoid bright neon AI gradients.
