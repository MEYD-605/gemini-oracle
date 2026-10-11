#!/usr/bin/env bun
/**
 * /landing-deploy — Cloudflare path (default when wrangler present).
 * For GitHub Pages, use Actions workflow or see SKILL.md §2B.
 * Always curl-verifies before Discord notify.
 */
import { $ } from "bun";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const cwd = process.cwd();
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const diagnose = args.includes("--diagnose");

console.log(`🚀 landing-deploy from: ${cwd}`);

// ─── helpers ───────────────────────────────────────────────
async function httpCode(url: string): Promise<string> {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
    return String(r.status);
  } catch {
    return "000";
  }
}

function loadDiscordToken(): string {
  if (process.env.DISCORD_BOT_TOKEN) return process.env.DISCORD_BOT_TOKEN.trim();
  const tokenPaths = [
    join(homedir(), ".claude/channels/discord-no1/.env"),
    join(homedir(), ".claude/channels/discord-no6/.env"),
    join(homedir(), ".claude/channels/discord-no8/.env"),
    join(homedir(), ".claude/channels/discord-no10/.env"),
    join(homedir(), ".claude/channels/discord-sombo/.env"),
    // legacy ai-core
    "/root/.claude/channels/discord-no6/.env",
    "/root/.claude/channels/discord-no8/.env",
    "/root/.claude/channels/discord-no10/.env",
    "/root/.claude/channels/discord-sombo/.env",
  ];
  for (const p of tokenPaths) {
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf8");
    const match = content.match(/^DISCORD_BOT_TOKEN\s*=\s*(.+)$/m);
    if (match) return match[1].trim().replace(/['"]/g, "");
  }
  return "";
}

// ─── --diagnose URL ────────────────────────────────────────
if (diagnose) {
  const url = args.find((a) => a.startsWith("http")) || "";
  if (!url) {
    console.error("Usage: deploy.ts --diagnose https://user.github.io/repo/");
    process.exit(1);
  }
  const code = await httpCode(url);
  console.log(`${code}  ${url}`);
  if (url.includes("github.io") && !url.replace(/https?:\/\/[^/]+/, "").slice(1).includes("/")) {
    console.log("HINT: org/user root often 404 — try https://USER.github.io/REPO/");
  }
  if (code === "404") {
    console.log("Triage: index.html at publish root? base path? Pages enabled? Actions green?");
    console.log("See: ~/.grok/skills/landing-deploy/SKILL.md §0 and §4");
  }
  process.exit(code === "200" ? 0 : 1);
}

// ─── detect mode ───────────────────────────────────────────
const wranglerTomlPath = join(cwd, "wrangler.toml");
const wranglerJsoncPath = join(cwd, "wrangler.jsonc");
const hasWrangler = existsSync(wranglerTomlPath) || existsSync(wranglerJsoncPath);
const hasGhPagesWorkflow =
  existsSync(join(cwd, ".github/workflows")) &&
  (() => {
    try {
      return readdirSync(join(cwd, ".github/workflows")).some((f: string) =>
        /page|deploy/i.test(f)
      );
    } catch {
      return false;
    }
  })();

if (!hasWrangler && hasGhPagesWorkflow) {
  console.log("📦 GitHub Pages mode detected (workflow present).");
  console.log("→ Push to default branch and wait for Actions, or:");
  console.log("   gh workflow run <workflow> && gh run watch");
  console.log("→ Then: bun ~/.grok/skills/landing-deploy/scripts/deploy.ts --diagnose <URL>");
  console.log("Full guide: ~/.grok/skills/landing-deploy/SKILL.md §2B");
  process.exit(0);
}

if (!hasWrangler) {
  console.error("❌ No wrangler.toml/jsonc and no Pages workflow. See SKILL.md.");
  process.exit(1);
}

let tomlContent = "";
let jsoncContent = "";
if (existsSync(wranglerTomlPath)) tomlContent = readFileSync(wranglerTomlPath, "utf8");
else jsoncContent = readFileSync(wranglerJsoncPath, "utf8");

let domainName = "";
let siteName = "";

if (tomlContent) {
  const nameMatch = tomlContent.match(/^name\s*=\s*"([^"]+)"/m);
  if (nameMatch) siteName = nameMatch[1];
  const routeMatch = tomlContent.match(/pattern\s*=\s*"([^"]+)"/);
  if (routeMatch) domainName = routeMatch[1].replace("/*", "");
} else {
  try {
    const config = JSON.parse(jsoncContent);
    siteName = config.name || "";
    if (config.routes?.length > 0) {
      domainName = (config.routes[0].pattern || "").replace("/*", "");
    }
  } catch (e) {
    console.error("❌ Error parsing wrangler.jsonc:", e);
  }
}

if (!siteName) siteName = "Astro Landing";
if (!domainName) {
  console.warn("⚠️ No custom domain in wrangler — defaulting to workers.dev");
  domainName = `${siteName}.workers.dev`;
}

const liveUrl = domainName.startsWith("http") ? domainName : `https://${domainName}`;
console.log(`📝 site: ${siteName}`);
console.log(`🌐 url:  ${liveUrl}`);

if (checkOnly) {
  const code = await httpCode(liveUrl);
  console.log(`CHECK ${code}  ${liveUrl}`);
  process.exit(code === "200" ? 0 : 1);
}

// ─── build ─────────────────────────────────────────────────
console.log("🏗️ Installing & building...");
try {
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) {
    await $`bun install && bun run build`;
  } else if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
    await $`pnpm install && pnpm run build`;
  } else if (existsSync(join(cwd, "package-lock.json"))) {
    await $`npm install && npm run build`;
  } else {
    await $`bun run build`;
  }
  console.log("✓ Build OK");
} catch (e) {
  console.error("❌ Build failed.", e);
  process.exit(1);
}

// ─── deploy CF ─────────────────────────────────────────────
console.log("🚀 wrangler deploy...");
try {
  const deployOut = await $`npx wrangler deploy`.text();
  console.log(deployOut);
  console.log("✓ Deploy command OK");
} catch (e) {
  console.error("❌ Deploy failed.", e);
  process.exit(1);
}

// ─── verify ────────────────────────────────────────────────
const code = await httpCode(liveUrl);
console.log(`VERIFY ${code}  ${liveUrl}`);
if (code !== "200") {
  console.error("❌ Post-deploy curl not 200 — NOT claiming LIVE, skip Discord.");
  process.exit(1);
}

// ─── Discord ───────────────────────────────────────────────
const discordToken = loadDiscordToken();
if (!discordToken) {
  console.warn("⚠️ No DISCORD_BOT_TOKEN — skip notify.");
  console.log(`🎉 LIVE: ${liveUrl}`);
  process.exit(0);
}

const channelId = "1512079809021214730"; // #🎉・free-for-all
const msgContent = `## 🚀 Web Deployed & Live! ✨
**${siteName}** built + deployed (Cloudflare) · curl **${code}**

🌐 **Link**: ${liveUrl}

* /landing-deploy · verified *`;

console.log("Sending Discord notification...");
try {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${discordToken}`,
      "Content-Type": "application/json",
      "User-Agent": "landing-deploy/26.7.9 (maclab)",
    },
    body: JSON.stringify({ content: msgContent }),
  });
  if (res.ok) console.log("✓ Discord OK");
  else console.error(`❌ Discord ${res.status} ${await res.text()}`);
} catch (e) {
  console.error("❌ Discord error:", e);
}

console.log(`\n🎉 Success! ${liveUrl}`);
