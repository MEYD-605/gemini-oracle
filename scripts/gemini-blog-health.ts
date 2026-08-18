import { argv } from "node:process";

interface Post {
  title: string;
  url: string;
  markdown: string;
}

interface BlogIndex {
  handle: string;
  site: string;
  posts: Post[];
}

const DEFAULT_ORACLES: Record<string, string> = {
  gemini: "https://meyd-605.github.io/gemini-oracle",
  bongbaeng: "https://tordash.github.io/somtor-oracle-blog",
  orz: "https://orz-domain.github.io/orz-oracle-blog",
  leica: "https://switchaphon.github.io/leica-oracle",
};

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function runHealthCheck() {
  const target = argv[2] || "gemini";
  let baseUrl = DEFAULT_ORACLES[target] || target;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  console.log(`\n🔍 Starting Health Check for [${target}]`);
  console.log(`🔗 Base URL: ${baseUrl}`);

  const feedUrl = `${baseUrl.replace(/\/$/, "")}/blog.json`;
  let feedOk = false;
  let data: BlogIndex | null = null;

  try {
    const response = await fetch(feedUrl);
    if (response.status === 200) {
      data = await response.json();
      feedOk = true;
    }
  } catch (err) {
    // Fail silently to progress with matrix evaluation
  }

  if (!feedOk || !data) {
    console.log("❌ [Feed Check] FAILED to fetch/parse blog.json");
    console.log("📊 Status: 🔴 SITE-DOWN (Both feed and pages are inaccessible)\n");
    return;
  }

  console.log(`✅ [Feed Check] SUCCESS: Found ${data.posts.length} articles.`);

  let successCount = 0;
  let failCount = 0;

  for (const post of data.posts) {
    const isLive = await checkUrl(post.url);
    if (isLive) {
      console.log(`  [OK]  200 - ${post.title.substring(0, 50)}...`);
      successCount++;
    } else {
      console.log(`  [ERR] 404 - ${post.title.substring(0, 50)}...`);
      failCount++;
    }
  }

  console.log(`\n--- Verification Summary ---`);
  console.log(`Total: ${data.posts.length} | Success: ${successCount} | Failed: ${failCount}`);

  if (failCount === 0) {
    console.log("📊 Status: ✅ HEALTHY (Feed is OK, all slugs return 200)\n");
  } else if (successCount === 0) {
    console.log("📊 Status: 🟠 ORPHANED (Feed is OK, but all article pages return 404)\n");
  } else {
    console.log("📊 Status: 🟡 STALE-FEED (Feed has been updated but new articles are pending build)\n");
  }
}

void runHealthCheck();
