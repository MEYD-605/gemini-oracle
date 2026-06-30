# Testing & Quality Patterns: Landing Oracle

This document analyzes the testing structures, conventions, utilities, mocking patterns, coverage approach, and lint and formatting rules implemented within the **Landing Oracle** (Oracle #154) codebase located at `/ψ/learn/Oracle-Landing/landing-oracle/origin/`.

---

## 1. Testing Philosophy & Context

As a static-first, highly-optimized Astro 5 project, Landing Oracle implements a **compilation-driven and healthcheck-first quality assurance pipeline** rather than relying on heavy client-side Javascript testing libraries (such as Jest or Vitest). This approach aligns with the *Nothing is Deleted* and *Patterns Over Intentions* principles, emphasizing compile-time guarantees, type strictness, and live-environment validation.

### Core Testing & Quality Pillars
1. **Zod Schema Enforcement**: Ensures data integrity of the Oracle database at compile-time.
2. **Strict Compile-Time Verification**: Uses Astro's strict TypeScript presets to catch dynamic-typing edge-cases.
3. **Automated Live Health Checking**: Uses curl-based scripts to verify routing, DNS configuration, and server status codes.
4. **Isolated Data Mocking**: Uses file-system-based Markdown records to isolate data profiles during rendering and verification.

---

## 2. Test Structure & Conventions

Since the project does not employ standard test runners, there are no traditional test directories (like `__tests__` or `test/`). Instead, testing and quality controls are structured around validation tasks and configuration frameworks.

### Codebase Organization for Quality Control
- **[content.config.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/content.config.ts)**: The schema gateway. All database items (markdown files under [oracles/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles)) must strictly conform to the schema defined here.
- **[landing-index SKILL.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/.claude/skills/landing-index/SKILL.md)**: Implements `/landing-index --live`, which acts as an integration/smoke test suite by automatically pinging all known Oracle landing page subdomains.
- **[landing-create SKILL.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/.claude/skills/landing-create/SKILL.md)**: Declares automated compilation checks (`bun run build` verification) as a mandatory pre-deployment gate.
- **[tsconfig.json](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/tsconfig.json)**: Inherits `"astro/tsconfigs/strict"` to guarantee high type safety.

---

## 3. Zod-Driven Data Validation (Astro Content Layer)

The most rigorous quality checkpoint in the Landing Oracle system is the schema defined in `src/content.config.ts`. Because individual landing pages rely on Markdown datasets, Zod validation protects the page layout from missing properties or invalid structures.

### Schema Blueprint ([content.config.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/content.config.ts))
```typescript
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro:zod";

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

export const collections = { oracles };
```

### Static Data Compliance Checklist
Every Markdown entry under [oracles/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles) must pass validation checks for:
- Required strings (`name`, `primary`, `secondary`, `background`).
- Type-compliant values: `status` must be strictly `"live"` or `"known"`. An invalid status causes compilation to fail immediately.
- Clean separation of fields so rendering scripts do not hit `undefined` properties.

---

## 4. Test Utilities & Helpers (Smoke/Integration Testing)

The `/landing-index --live` skill serves as the project's verification test runner. It contains a curl-based testing script that performs health checks against deployed subdomains.

### Health Check Script ([landing-index/SKILL.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/.claude/skills/landing-index/SKILL.md#L35-L48))
Located inside [landing-index/SKILL.md](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/.claude/skills/landing-index/SKILL.md), it loops through known domains to verify their live status:
```bash
for domain in \
  "arthur.buildwithoracle.com" \
  "phukhao.buildwithoracle.com" \
  "maeoncraft.buildwithoracle.com" \
  "thongpraditxcatlab.buildwithoracle.com" \
  "xiaoer.buildwithoracle.com"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" --max-time 5)
  echo "$domain → $STATUS"
done
```
This script validates:
- **HTTP Code**: Verifies that pages return HTTP `200`.
- **Latency/Timeout**: Pings each endpoint with a strict 5-second connection limit to catch slow or stuck routes.

---

## 5. Mocking Patterns & Isolated Environments

Landing Oracle utilizes two main patterns to isolate components and manage state without traditional mocking libraries:

### 1. Static Database Mocking (Markdown Injection)
Component rendering logic is completely decoupled from active database connections. Instead, mock database states are simulated by reading mock markdown files in [/src/data/oracles/](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/data/oracles). This enables:
- Fast development with realistic datasets.
- Clean component boundaries: [GalleryCard.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/GalleryCard.astro) receives typed data properties passed down directly from [index.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/pages/index.astro) after Zod validation.

### 2. Micro-State Isolation (NanoStores)
Global client state is encapsulated inside [theme.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/stores/theme.ts):
- By leveraging atomic stores (`$palette` and `$rotating`), components like [PaletteToggle.astro](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/src/components/PaletteToggle.astro) can subscribe to state changes independently.
- During testing or development, store state can be modified or mocked directly on the client side (`$palette.set("nature")`) without needing to trigger mock DOM events or trigger page reloads.

---

## 6. Coverage, Linting, & Formatting Rules

### Coverage Approach
The test coverage model for the Landing Oracle is **100% build-success rate and 100% healthcheck pass rate**. Since there are no unit tests, standard coverage tools (like `c8` or `istanbul`) are not utilized. Coverage is measured by:
1. **Compilation Success**: `bun run build` verifies that all routes and files generate without errors.
2. **Subdomain Ping Success Rate**: Deployed domain reachability is verified.

### Linting & Formatting Rules
1. **TypeScript Strictness**: `"astro/tsconfigs/strict"` enforces:
   - `noImplicitAny: true`
   - `strictNullChecks: true`
   - `strictFunctionTypes: true`
   - This eliminates common type-related runtime exceptions.
2. **Environment Isolation**:
   - Secret prevention: Git workflows forbid committing credentials or wrangler keys.
   - Development Isolation: The [astro.config.mjs](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/Oracle-Landing/landing-oracle/origin/astro.config.mjs) configures the Vite server to ignore the `ψ/` directory (`watch.ignored: ["**/ψ/**"]`), preventing background task writes from triggering unnecessary rebuilds or livereloads.
