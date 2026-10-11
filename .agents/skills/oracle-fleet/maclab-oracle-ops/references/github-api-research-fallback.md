# GitHub REST API Research Fallback

When primary web search tools (`web_search`, `web_extract`) are unconfigured or unavailable (e.g. missing Firecrawl credentials), GitHub's public REST API provides a structured fallback for technical research, open-source library discovery, and architecture pattern analysis.

## 1. Unauthenticated Search & Rate Limits

Unauthenticated requests to `https://api.github.com/search/repositories` are allowed but strictly rate-limited to **10 requests per minute**.

Check remaining search budget:
```bash
curl -s https://api.github.com/rate_limit | jq '.resources.search'
```

Batch queries in Python using `execute_code` with `time.sleep(7)` between calls to stay under the 10 req/min threshold:

```python
from hermes_tools import terminal
import urllib.parse, time

queries = ["webxr+terminal", "3d+force+graph", "vr+observability"]
for q in queries:
    qq = urllib.parse.quote(q)
    # 7-second sleep guarantees < 10 req/min
    cmd = f"sleep 7; curl -s -H 'Accept: application/vnd.github+json' 'https://api.github.com/search/repositories?q={qq}&sort=stars&order=desc&per_page=5' | jq -r '.items[]? | \"\\(.stargazers_count)★ \\(.full_name) :: \\(.description // \"-\") :: updated \\(.pushed_at[:10])\"'"
    out = terminal(cmd, timeout=30)
    print(out["output"])
```

## 2. Direct Repository Metadata & README Extraction

Fetch single repo details and README contents directly via curl:

```bash
curl -s "https://api.github.com/repos/{owner}/{repo}" | jq -r '"\(.stargazers_count)★ \(.full_name) | \(.description) | lang:\(.language) | pushed:\(.pushed_at[:10])"'

curl -sL "https://raw.githubusercontent.com/{owner}/{repo}/main/README.md" | head -c 3000
```
