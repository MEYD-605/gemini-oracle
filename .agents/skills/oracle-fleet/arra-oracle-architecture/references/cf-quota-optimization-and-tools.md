# Cloudflare $5/mo Quota Optimization & Offsite Backup / Workers AI Stack

Verified 2026-08-09 on `maclab` (`Ai.no.1bro@gmail.com's Account`).

## 1. Cloudflare Workers Paid ($5/mo) Limits & Capabilities

- **Workers AI Embeddings (`@cf/baai/bge-m3`):** 10,000 requests/day (~10k batches). Batching 50 docs/request allows sync of 24,000+ docs in ~488 requests (only ~5% of daily quota).
- **Vectorize Indexes:** 5,000,000 vectors (1024d) max capacity. Fleet's 24k docs consume < 0.5% capacity.
- **Vector Queries:** 30,000,000 queries/month.
- **R2 Storage:** 10 GB free storage, 1,000,000 Class A (PUT) operations/month.

## 2. Cloudflare R2 Offsite Backup Setup

Script: `~/.arra-oracle-v2/backup_r2.py`
Bucket: `oracle-backups`

### How it works:
1. Gzip compress `oracle-master.db` → `/tmp/oracle-master-YYYY-MM-DD_HHMMSS.db.gz` (~14.75 MB compressed).
2. Upload via REST PUT to Cloudflare R2:
   `https://api.cloudflare.com/client/v4/accounts/{acct}/r2/buckets/oracle-backups/objects/{key}`
3. Auth: `X-Auth-Email` + `X-Auth-Key` with explicit `Content-Length` and `Content-Type: application/gzip` headers.

## 3. Cloudflare Workers AI CLI (`/usr/local/bin/cf-ai`)

Executable Python CLI at `/usr/local/bin/cf-ai` to harness free LLM / Reasoning models for fleet fallbacks:

```bash
cf-ai "Prompt text" -m llama        # @cf/meta/llama-3.3-70b-instruct-fp8-fast
cf-ai "Prompt text" -m deepseek     # @cf/deepseek-ai/deepseek-r1-distill-qwen-32b
cf-ai "Prompt text" -m vision       # @cf/meta/llama-3.2-11b-vision-instruct
```

Uses direct REST API call to `https://api.cloudflare.com/client/v4/accounts/{acct}/ai/run/{model}` with Global Key auth.
