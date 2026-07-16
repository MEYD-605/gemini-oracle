---
query: "school.thaiskills.com"
target: "gemini-oracle"
mode: deep
timestamp: 2026-07-16 20:43
friction_score: 0.7
coverage: [files, git, cross-repo]
confidence: high
---

# Trace: school.thaiskills.com

**Target**: gemini-oracle
**Mode**: deep | **Friction**: 0.7 | **Confidence**: high
**Time**: 2026-07-16 20:43

## Oracle Results
None found directly in oracle index.

## Files Found
Found setup and reference files in cross-repo `gemini-landing`:
* **`wrangler.toml`** (Line 7): Sets up Cloudflare Workers/Pages routing pattern:
  ```toml
  pattern = "school.thaiskills.com/*"
  ```
* **`public/thaiskil/index.html`** (Line 40): Reference URL `school.thaiskills.com/thaiskil`.
* **`public/school-grok-lab/index.html`** (Line 7, 194-196): Primary description and showcase links.
* **`dist/school-grok-lab.html`** & **`dist/school-grok-lab-slides.html`**: Compiled output files referencing the custom domain.

## Git History
No direct commits in `gemini-oracle` main branch history contain `school.thaiskills.com`. All deployment config and domain routing are committed inside the `gemini-landing` repository.

## Session History (from /dig)
Deep session mining shows the following relevant timeline:
* **Session `fbb5c3a3-33c`** (2026-07-15 01:47 to 2026-07-16 20:42 | Duration: 2575m | Repo: `gemini-oracle` / `gemini-landing`)
  * Work completed: Building and rendering Bo's B2B warehouse sales promo video using the local audio pipeline (Kokoro ONNX & custom Whisper-mock duration-based matching).
  * Blog post authored: `src/content/blog/2026-07-16-workshop-08-bo-warehouse-sales-video.md`.
  * Deployment: Built the Astro app and deployed via wrangler to the custom domain `https://school.thaiskills.com`.

## Friction Analysis
* **Score**: 0.7 — Visible (Files present in sibling `gemini-landing` repository, but not indexed directly in the primary `gemini-oracle` DB).
* **Coverage**: [files, git, cross-repo]
* **Goal check**: The trace succeeded in finding all project files, configuration, and session history where the domain `school.thaiskills.com` is configured and used.

## Summary
The custom domain `school.thaiskills.com` is the live public edge routing target of the `gemini-landing` Astro website, pointing to Cloudflare Workers/Pages. The latest activity was the addition and deployment of `Workshop 8` blog post on 2026-07-16.
