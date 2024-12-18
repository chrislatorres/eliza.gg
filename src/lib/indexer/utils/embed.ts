import { createTurso } from "@/lib/indexer/utils/create-turso";
import { hashString } from "@/lib/indexer/utils/hash";
import { VoyageAIClient } from "voyageai";

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

const turso = createTurso();

// console.time("drop-table");
// await turso.execute(`DROP TABLE IF EXISTS embedding_cache`);
// console.timeEnd("drop-table");

console.time("create-table");
await turso.execute(`
  CREATE TABLE IF NOT EXISTS embedding_cache (
    hash      INTEGER PRIMARY KEY,
    text      TEXT,
    embedding TEXT
  );
  `);
console.timeEnd("create-table");
export async function embed(text: string) {
  console.time(`embed-${text.slice(0, 10)}`);
  const hash = hashString(text);

  // Check cache first
  console.time(`cache-check-${text.slice(0, 10)}`);
  const cached = await turso.execute({
    sql: "SELECT embedding FROM embedding_cache WHERE hash = ?",
    args: [hash],
  });
  console.timeEnd(`cache-check-${text.slice(0, 10)}`);

  if (cached.rows.length > 0) {
    console.log(`Cache hit for embedding: ${text.slice(0, 10)}...`);
    const embeddingStr = String(cached.rows[0][0]);
    console.timeEnd(`embed-${text.slice(0, 10)}`);
    return JSON.parse(embeddingStr);
  }

  console.time(`voyage-api-${text.slice(0, 10)}`);
  const response = await client.embed({
    input: text,
    model: "voyage-3-lite",
  });
  const embedding = response.data[0].embedding;
  console.timeEnd(`voyage-api-${text.slice(0, 10)}`);

  // Store in cache asynchronously without blocking
  turso
    .execute({
      sql: "INSERT OR IGNORE INTO embedding_cache (hash, text, embedding) VALUES (?, ?, ?)",
      args: [hash, text, JSON.stringify(embedding)],
    })
    .catch((err) => {
      console.error("Failed to cache embedding:", err);
    });

  console.timeEnd(`embed-${text.slice(0, 10)}`);
  return embedding;
}

export async function embedBatch(texts: string[]) {
  console.time("embedBatch-total");
  let nonCached = [];
  let cached = [];

  console.time("embedBatch-cache-check");
  for (const text of texts) {
    const hash = hashString(text);
    const cachedResult = await turso.execute({
      sql: "SELECT embedding FROM embedding_cache WHERE hash = ?",
      args: [hash],
    });

    if (cachedResult.rows.length === 0) {
      nonCached.push(text);
    } else {
      cached.push(cachedResult.rows[0][0]);
    }
  }
  console.timeEnd("embedBatch-cache-check");

  // Process non-cached texts in batches of 128
  const BATCH_SIZE = 128;
  let allEmbeddings = [];

  console.time("embedBatch-api-calls");
  for (let i = 0; i < nonCached.length; i += BATCH_SIZE) {
    const batch = nonCached.slice(i, i + BATCH_SIZE);
    const results = await client.embed({
      input: batch,
      model: "voyage-3-lite",
    });
    allEmbeddings.push(...results.data.map((result) => result.embedding));
  }
  console.timeEnd("embedBatch-api-calls");

  // Store new embeddings in cache asynchronously
  console.time("embedBatch-cache-store");
  nonCached.forEach((text, i) => {
    const hash = hashString(text);
    turso
      .execute({
        sql: "INSERT OR IGNORE INTO embedding_cache (hash, text, embedding) VALUES (?, ?, ?)",
        args: [hash, text, JSON.stringify(allEmbeddings[i])],
      })
      .catch((err) => {
        console.error("Failed to cache embedding:", err);
      });
  });
  console.timeEnd("embedBatch-cache-store");

  console.timeEnd("embedBatch-total");
  return [...allEmbeddings, ...cached];
}
