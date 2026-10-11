---
name: landing-deploy
description: >
  Build/deploy landing pages (Cloudflare OR GitHub Pages), diagnose 404s, verify LIVE
  with curl, share URL on Discord (#🎉・free-for-all). Use when: landing deploy, deploy
  website, GitHub Pages 404, "File not found" github.io, Pages status check, school-landing.
version: 26.7.9
updated: 2026-07-09
---

# /landing-deploy — Build · Deploy · Verify · Share

Two hosts, one skill. Fleet landings use **Cloudflare** (`*.buildwithoracle.com`).
School / student sites often use **GitHub Pages** (`*.github.io/<repo>/`).

## Usage

```text
/landing-deploy              # auto-detect CF vs GH Pages from cwd
/landing-deploy --check      # status probe only (no deploy)
/landing-deploy --diagnose   # 404 triage for a URL
```

## 0) Preflight — why "404 กันเยอะ"

| Symptom | Real cause | Fix |
|---------|------------|-----|
| Classic GH Pages "404 File not found" | **no `index.html` at published root** | push `index.html` (or build → `dist/` then deploy that root) |
| `https://USER.github.io/` 404 | org/user site needs repo `USER.github.io` | use **project URL** `https://USER.github.io/REPO/` |
| `https://org.github.io/Repo/` 404 | **case-sensitive** path | match exact repo name (`school-landing` ≠ `School-Landing`) |
| root 404 but `/repo/` 200 | project site — subpath required | always share full project URL with trailing `/` |
| Vite/Astro assets 404 | wrong `base` | set `base: '/repo-name/'` for project Pages |
| deploy "done" still 404 | Actions delayed / Pages still building | check `gh run list` + wait; re-curl |
| `meyd-605.github.io/<landing>/` 404 | fleet is **CF-only**, Pages not enabled | use `https://<name>.buildwithoracle.com` |
| `school.buildwithoracle.com` fail | DNS CNAME missing (Bo) | use `https://meyd-605.github.io/school-landing/` until DNS |

**GitHub Status** (when many students fail at once):

```bash
curl -sS https://www.githubstatus.com/api/v2/summary.json | \
  python3 -c "import sys,json;d=json.load(sys.stdin);print(d['status']);\
  [print(c['name'],c['status']) for c in d['components'] if c['name'] in ('Pages','Actions','API Requests')]"
```

Verified 2026-07-09 ~15:12 +07: **Pages operational** · **Actions degraded_performance**
(incident: delays starting Actions runs) · overall **minor / Partially Degraded Service**.
Deploy jobs may queue — 404 mid-deploy is expected until Actions finishes.

## 1) Detect host mode

| Signal in cwd | Mode |
|---------------|------|
| `wrangler.toml` / `wrangler.jsonc` | **Cloudflare** (Workers/Pages) |
| `.github/workflows/*pages*` or Pages source `gh-pages` | **GitHub Pages** |
| both | prefer CF for fleet; GH Pages for school demos |

## 2A) Cloudflare deploy

```bash
# from landing repo (e.g. gemini-landing, sombo-landing, no10-landing, agy-landing)
bun ~/.grok/skills/landing-deploy/scripts/deploy.ts
```

Legacy ai-core path (deprecated): `/root/.gemini/skills/landing-deploy/scripts/deploy.ts`

Script: build → `npx wrangler deploy` → Discord notify `#🎉・free-for-all` (`1512079809021214730`).

## 2B) GitHub Pages deploy

**Preferred (Actions — school-landing pattern):**

1. `vite.config` / `astro.config`: `base: '/<repo>/'`
2. Workflow: build → `actions/upload-pages-artifact` path `./dist` → `actions/deploy-pages`
3. Repo Settings → Pages → Source = **GitHub Actions** (or `gh-pages` branch `/`)
4. Live URL: `https://<owner>.github.io/<repo>/`

**Manual branch:**

```bash
npm run build   # or bun/pnpm
# ensure dist/index.html exists
git checkout --orphan gh-pages  # first time only
# or: npx gh-pages -d dist
```

**Hard rules:**

- Published root **must** contain `index.html` (filename case exact).
- Project site URL **includes repo name** — root `https://owner.github.io/` is a different site.
- Never claim LIVE without curl 200 (step 3).

## 3) Verify (mandatory — Oracle Never Pretends)

```bash
URL="https://meyd-605.github.io/school-landing/"
code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 10 "$URL")
echo "$code  $URL"
# also probe without trailing slash and /index.html if weird
```

| Code | Meaning |
|------|---------|
| 200 | LIVE — safe to share |
| 404 | missing file / wrong path / Pages not built |
| 000 / fail | DNS / network / custom domain not ready |

### Fleet LIVE map (curl 2026-07-09 maclab)

| URL | Status | Host |
|-----|--------|------|
| https://meyd-605.github.io/school-landing/ | **200** | GH Pages (`gh-pages`) |
| https://meyd-605.github.io/ | **404** | no org site repo |
| https://meyd-605.github.io/{gemini,mac1,sombo,no10,agy}-landing/ | **404** | CF-only; no GH Pages |
| https://buildwithoracle.com/ | **200** | CF |
| https://gallery.buildwithoracle.com/ | **200** | CF |
| https://{no6,sombo,mac1,no10,gemini,agy,esp32}.buildwithoracle.com/ | **200** | CF |
| https://school.buildwithoracle.com/ | **DNS fail** | pending Bo CNAME |
| https://no1.buildwithoracle.com/ | **DNS fail** | gap (gallery) |
| https://tamtidmear-prog.github.io/ | **404** | need `/oracle-school/` |
| https://tamtidmear-prog.github.io/oracle-school/ | **200** | project path |

`school-landing` Actions: last deploys **success** (2026-07-06). Pages API: source `gh-pages` `/`.

## 4) Diagnose 404 (teacher / peer review)

When P'Nat or peers paste the white GH Pages 404 page:

```text
1. Exact URL they opened? (copy full bar)
2. Is it USER root or /repo/ project path?
3. gh api repos/OWNER/REPO/pages  → configured?
4. gh run list -R OWNER/REPO --limit 3  → Actions green?
5. curl -I the URL  → still 404?
6. If Vite/Astro: is base matching repo name?
7. If fleet landing: wrong host — try *.buildwithoracle.com
8. If many fail same hour: githubstatus Actions/Pages
```

Reply pattern (Thai, proof-dense):

```text
ตรวจแล้วครับ:
- URL ที่ 200: …
- URL ที่ 404: … เพราะ …
- แก้: …
(แนบ curl code + เวลา)
```

## 5) Discord share

- Channel: `#🎉・free-for-all` · `1512079809021214730`
- Only after curl **200**
- Include host type (CF / GH Pages) so peers don't open wrong URL

## 6) Log

- `ψ/activity.log` — session start/end
- `ψ/focus.md` — LIVE line for school-landing / CF fleet
- Optional learning: `ψ/memory/learnings/YYYY-MM-DD_pages-404-*.md`

## 7) Env vars & Discord token — FAQ (P'Nat 2026-07-09)

**Q: เว็บ GH Pages get env จากไหน? ใน code มีไหม?**

| Layer | Has secrets? | Where values come from |
|-------|--------------|------------------------|
| Static site (`index.html`, Vite `dist/`) | **No** | Build-time public only (`import.meta.env.VITE_*` if any — still public in bundle) |
| GitHub Actions deploy workflow | OIDC/`pages: write` only | No `DISCORD_BOT_TOKEN` needed to publish HTML |
| `/landing-deploy` script (maclab) | Yes, optional | `process.env.DISCORD_BOT_TOKEN` **or** `~/.claude/channels/discord-*/.env` |
| Oracle bot / Hermes / maw | Yes | Host `.env` · `pass` · never git |

**school-landing:** no `process.env` / no bot token in source. "Token" on the form = student **export text** for clipboard, not Discord API token.

**Q: ไม่มี Token แล้วจะขึ้น Discord ได้ยังไง?**

1. **เว็บขึ้นเองได้** — Pages/CF host static files; token ไม่เกี่ยว
2. **คน/ครูแปะลิงก์** ในห้อง — ไม่ต้องมี bot
3. **Auto-announce** (`/landing-deploy` post to `#🎉・free-for-all`) ทำได้**เฉพาะ**เมื่อเครื่อง deploy มี `DISCORD_BOT_TOKEN` — ไม่มี = skip notify, เว็บยัง LIVE
4. **ห้าม** ฝัง bot token ใน frontend / commit git / ใส่ใน `VITE_*`

```bash
# runtime only — never commit
export DISCORD_BOT_TOKEN=...   # or file:
# ~/.claude/channels/discord-no1/.env  →  DISCORD_BOT_TOKEN=...
```

## Anti-patterns

- Claiming LIVE from Actions "success" without curl
- Sharing `github.io` root for a project site
- Sharing `github.io/<landing>/` for CF-only fleet repos
- Hardcoding `/root/.gemini/...` on maclab (use `~/.grok/skills/landing-deploy/`)
- Confusing **GitHub Wiki** (markdown docs) with **GitHub Pages** (static site)
- Putting `DISCORD_BOT_TOKEN` in repo, Pages HTML, or client JS
