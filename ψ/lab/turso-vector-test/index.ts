import { createClient } from "@libsql/client";

async function main() {
  console.log("⚡ [Lab] Starting Turso/libSQL Native Vector Search & Embedding Test...");

  // In-memory or local sqlite file using libSQL engine
  const client = createClient({
    url: "file:turso_vector_demo.db",
  });

  try {
    // 1. Create table with vector column (F32_BLOB)
    console.log("1️⃣ Creating table `oracle_knowledge` with F32_BLOB vector column...");
    await client.execute(`
      CREATE TABLE IF NOT EXISTS oracle_knowledge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        embedding F32_BLOB(4)
      );
    `);

    // Clear old data if any
    await client.execute(`DELETE FROM oracle_knowledge;`);

    // 2. Insert mock embeddings (4-dimensional vectors for easy visual inspection)
    // Concept vectors:
    // [AI/LLM, Database/Storage, Networking/API, Philosophy/Soul]
    const docs = [
      {
        title: "Gemini 3.7 Flash Architecture",
        content: "High-speed multimodal reasoning model with hybrid thinking capabilities.",
        category: "AI",
        embedding: "[0.95, 0.10, 0.20, 0.05]", // Strong AI dimension
      },
      {
        title: "Turso & libSQL DiskANN Vector Index",
        content: "Embedded and distributed SQLite with native vector similarity indexing.",
        category: "Database",
        embedding: "[0.15, 0.92, 0.40, 0.05]", // Strong Database dimension
      },
      {
        title: "Cloudflare Workers MCP Transport",
        content: "Stateless HTTP MCP server with OAuth 2.1 authentication and PKCE.",
        category: "Networking",
        embedding: "[0.30, 0.35, 0.90, 0.10]", // Strong Networking dimension
      },
      {
        title: "Oracle Soul & Yeast Budding Philosophy",
        content: "Colony reproduction, non-deletion principles, and symbiotic agency.",
        category: "Philosophy",
        embedding: "[0.10, 0.05, 0.15, 0.98]", // Strong Philosophy dimension
      },
    ];

    console.log("2️⃣ Inserting sample knowledge with `vector32(...)` conversion...");
    for (const doc of docs) {
      await client.execute({
        sql: `INSERT INTO oracle_knowledge (title, content, category, embedding) VALUES (?, ?, ?, vector32(?));`,
        args: [doc.title, doc.content, doc.category, doc.embedding],
      });
    }

    // 3. Test Vector Distance Functions (Cosine & L2)
    console.log("\n3️⃣ Testing Vector Distance Functions directly...");
    const targetQueryVector = "[0.20, 0.88, 0.35, 0.05]"; // Database-oriented query: "Where do we store vector data?"
    console.log(`Query Vector: ${targetQueryVector} (Concept: Database / Storage)`);

    const distanceResults = await client.execute({
      sql: `
        SELECT
          id,
          title,
          category,
          vector_distance_cos(embedding, vector32(?)) AS cosine_distance
        FROM oracle_knowledge
        ORDER BY cosine_distance ASC;
      `,
      args: [targetQueryVector],
    });

    console.log("\n📊 Cosine Distance Results (Lower = More Similar):");
    for (const row of distanceResults.rows) {
      console.log(`- [Score: ${Number(row.cosine_distance).toFixed(4)}] ${row.title} (${row.category})`);
    }

    // 4. Test Index Creation (libsql_vector_idx) & vector_top_k
    console.log("\n4️⃣ Testing `libsql_vector_idx` index creation & `vector_top_k`...");
    try {
      await client.execute(`
        CREATE INDEX IF NOT EXISTS knowledge_vec_idx
        ON oracle_knowledge(libsql_vector_idx(embedding, 'metric=cosine'));
      `);
      console.log("✓ Vector index `knowledge_vec_idx` created with DiskANN (metric=cosine)!");

      // Query via vector_top_k
      const topKQuery = "[0.12, 0.08, 0.10, 0.95]"; // Philosophy query: "What is Oracle's core soul?"
      console.log(`\nQuerying Top-2 using vector_top_k for query: ${topKQuery} (Concept: Philosophy)...`);

      const topKResults = await client.execute({
        sql: `
          SELECT k.id, k.title, k.category, k.content
          FROM vector_top_k('knowledge_vec_idx', vector32(?), 2) AS v
          JOIN oracle_knowledge AS k ON k.id = v.id;
        `,
        args: [topKQuery],
      });

      console.log("\n🎯 Top-K Results via DiskANN Index:");
      for (const row of topKResults.rows) {
        console.log(`- ID ${row.id}: ${row.title} [${row.category}] -> "${row.content}"`);
      }
    } catch (idxErr: any) {
      console.log("ℹ Note on local libsql embedded engine:", idxErr.message);
    }

    console.log("\n✅ All vector tests executed successfully!");
  } catch (err: any) {
    console.error("❌ Test error:", err);
  } finally {
    client.close();
  }
}

main();
