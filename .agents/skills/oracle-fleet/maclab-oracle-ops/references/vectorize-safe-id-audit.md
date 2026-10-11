# CF Vectorize safe_id Audit & Multi-Repo Verification Protocol

## Context & Pitfalls
When auditing or verifying CF Vectorize / DB storage issues across `arra-oracle-v3`:

1. **Verify Live Process Working Directory First (SSOT):**
   - Do not rely solely on directory paths provided in text/prompts (e.g. `/Users/admin/Oracle/dev/arra-oracle-v3`).
   - Always verify running server processes (`ps aux | grep arra-oracle` or listening ports like `:47778`) to find the live code path (`/Users/admin/Code/github.com/MEYD-605/arra-oracle-v3`).
   - Development clones can contain stale/outdated adapter logic compared to the active service.

2. **CF Vectorize 64-Byte ID Limit Contract (`safeVectorId`):**
   - Cloudflare Vectorize caps IDs at 64 bytes (error 40008).
   - The verified live implementation (`safeVectorId` in `src/vector/adapters/cloudflare-vectorize.ts`, commit `9f7262b5`) computes:
     `prefix (55 UTF-8 bytes max) + '_' + sha256(id)[:8]` = 64 bytes max.
   - Truncation MUST happen on UTF-8 **byte** boundaries, not character boundaries (crucial for Thai and `ψ/` multi-byte characters).
   - Reverse-lookup support in `tools/search/vector.ts` expects the `<prefix>_<8-hex>` pattern for prefix LIKE queries against SQLite `oracle_documents`.

3. **Empirical Script Verification vs Live Adapter Formula:**
   - Never run large-scale background verification against CF using custom hash guesses (e.g. MD5 or custom prefix lengths).
   - Always port the exact live TypeScript function to Python/Scripting to ensure zero false positives/negatives in missing-vector counts.
