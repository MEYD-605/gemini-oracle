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
   - **Scrollbar Contrast**: Ensure scrollbar styling matches the theme (dark background must use dark scrollbars, never white or contrasting light scrollbars).

4. **Asynchronous Webhook Integrations**:
   - All outbound integrations triggered by incoming webhooks (e.g., Notion syncing or heavy API fetching) **must** run asynchronously using non-blocking background tasks (`subprocess.Popen` or FastAPI `BackgroundTasks`). Never block the primary webhook handler to prevent client timeout retries (which trigger duplicate processing).

5. **Notion CLI Single-Customer Sync Strategy**:
   - For real-time updates inside transactional databases, prioritize targeted queries over bulk refreshes. Search and target specific items using unique properties (like Customer IDs), trash the old pages using `page trash`, and create a fresh one to prevent Notion API Rate-limiting.

6. **Human-like Fallback Copywriting Invariants**:
   - Avoid terms like "AI", "บอท", or overly formal auto-replies. Fallback copywriting must frame responses as a busy real-world admin (e.g., "ติดลูกค้าหน้างาน/ถ่ายรูป") and immediately guide users to direct phone redirects (e.g., "โทรหาช่างโมเบอร์ 080-255-9500").
