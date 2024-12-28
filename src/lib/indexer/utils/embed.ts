import {
  createTurso,
  executeTursoQuery,
} from "@/lib/indexer/utils/create-turso";
import { hashString } from "@/lib/indexer/utils/hash";
import { log, logError } from "@/lib/indexer/utils/logging";
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
    try {
      const cachedResult = await executeTursoQuery(async () =>
        turso.execute({
          sql: "SELECT embedding FROM embedding_cache WHERE hash = ?",
          args: [hash],
        })
      );

      if (cachedResult.rows.length === 0) {
        nonCached.push(text);
      } else {
        cached.push(cachedResult.rows[0][0]);
      }
    } catch (error) {
      logError(`Cache check failed for text: ${text.slice(0, 50)}...`, error);
      nonCached.push(text); // Treat as non-cached on error
    }
  }
  console.timeEnd("embedBatch-cache-check");

  // Process non-cached texts in batches of 128
  const BATCH_SIZE = 128;
  let allEmbeddings = [];

  console.time("embedBatch-api-calls");
  try {
    for (let i = 0; i < nonCached.length; i += BATCH_SIZE) {
      const batch = nonCached.slice(i, i + BATCH_SIZE);
      const results = await client.embed({
        input: batch,
        model: "voyage-3-lite",
      });

      // Validate embeddings before adding them
      const validEmbeddings = results.data.map((result) => {
        const embedding = result.embedding;
        if (
          !embedding ||
          !Array.isArray(embedding) ||
          embedding.length !== 512
        ) {
          throw new Error(
            `Invalid embedding format: expected array of 512 numbers, got ${embedding?.length} elements`
          );
        }
        return embedding;
      });

      allEmbeddings.push(...validEmbeddings);
    }
  } catch (error) {
    logError("Failed to generate embeddings batch", error);
    throw error;
  }
  console.timeEnd("embedBatch-api-calls");

  // Store new embeddings in cache asynchronously
  console.time("embedBatch-cache-store");
  let cacheSuccesses = 0;
  let cacheFailures = 0;

  // Process in smaller batches to avoid overwhelming the connection
  const CACHE_BATCH_SIZE = 50;
  for (let i = 0; i < nonCached.length; i += CACHE_BATCH_SIZE) {
    const batch = nonCached.slice(i, i + CACHE_BATCH_SIZE);
    await Promise.all(
      batch.map(async (text, j) => {
        const hash = hashString(text);
        try {
          await executeTursoQuery(async () =>
            turso.execute({
              sql: "INSERT OR IGNORE INTO embedding_cache (hash, text, embedding) VALUES (?, ?, ?)",
              args: [hash, text, JSON.stringify(allEmbeddings[i + j])],
            })
          );
          cacheSuccesses++;
        } catch (error) {
          cacheFailures++;
          logError(
            `Failed to cache embedding for text: ${text.slice(0, 50)}...`,
            error
          );
        }
      })
    );

    // Add a small delay between batches
    if (i + CACHE_BATCH_SIZE < nonCached.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  log(
    `Cache storage complete. Successes: ${cacheSuccesses}, Failures: ${cacheFailures}`
  );
  console.timeEnd("embedBatch-cache-store");

  console.timeEnd("embedBatch-total");
  return [...allEmbeddings, ...cached.map((c) => JSON.parse(String(c)))];
}
