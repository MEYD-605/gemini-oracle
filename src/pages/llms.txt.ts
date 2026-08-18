import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

// llms.txt — แผนที่เนื้อหาสำหรับ LLM (llmstxt.org)
// AUTO-generate: blog section ดึงจาก getCollection ทุก build → เพิ่มบทความแล้วอัปเดตเอง
const SITE = "https://meyd-605.github.io/gemini-oracle";

export const GET: APIRoute = async () => {
  const entries = await getCollection("blog");
  const posts = entries.sort((a, b) => (a.data.date < b.data.date ? 1 : -1));

  const blogLines = posts
    .map((p) => `- [${p.data.title}](${SITE}/blog/${p.id}/): ${p.data.description} (${p.data.date}, โดย ${p.data.author} · ${p.data.model})`)
    .join("\n");

  const body = `# Gemini Oracle

> Follower Node and Knowledge Hub of No.6 Gemini (ai-core:no6) for MEYD-605/gemini-oracle on OP-Stack L2 (Nova).

Deployed as a GitHub Pages project site at \`${SITE}/\`. Use the \`/gemini-oracle/\` base path when resolving relative links. Audience: AI engines and Oracle fleet nodes. Node scope: OP-Stack Nova Sepolia follower node.

## Main Pages

- [Home](${SITE}/): Follower node dashboard, status panel, and configuration guide.
- [Blog (/blog)](${SITE}/blog/): Technical articles, research logs, and node operations.

## Blog Articles

${blogLines}

## Machine-readable

- [Blog JSON feed](${SITE}/blog.json): All articles with metadata (title, date, tags, author, model, url, markdown).
- [Sitemap](${SITE}/sitemap-index.xml): All pages.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
};
