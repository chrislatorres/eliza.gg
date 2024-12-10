import { chunkMarkdown } from "@/libs/indexer/utils/chunk-markdown";
import { createTurso } from "@/libs/indexer/utils/create-turso";
import { embedBatch } from "@/libs/indexer/utils/embed";
import { hashString } from "@/libs/indexer/utils/hash";

const turso = createTurso();

console.time("total-execution");

console.time("db-setup");
// drop tables
await turso.execute(`DROP TABLE IF EXISTS embedding_cache`);
await turso.execute(`DROP TABLE IF EXISTS docs`);

await turso.execute(`
CREATE TABLE IF NOT EXISTS embedding_cache (
  hash      INTEGER PRIMARY KEY,
  text      TEXT,
  embedding TEXT
);
`);

await turso.execute(
  `
CREATE TABLE IF NOT EXISTS docs (
  hash     TEXT PRIMARY KEY,
  title    TEXT,
  url      TEXT,
  content  TEXT,
  full_emb F32_BLOB(512)
);
`
);
console.timeEnd("db-setup");

const urls = [
  "https://ai16z.github.io/eliza/docs/intro/",
  "https://ai16z.github.io/eliza/docs/quickstart/",
  "https://ai16z.github.io/eliza/docs/faq/",
  "https://ai16z.github.io/eliza/docs/core/characterfile/",
  "https://ai16z.github.io/eliza/docs/core/agents/",
  "https://ai16z.github.io/eliza/docs/core/providers/",
  "https://ai16z.github.io/eliza/docs/core/actions/",
  "https://ai16z.github.io/eliza/docs/core/evaluators/",
  "https://ai16z.github.io/eliza/docs/guides/configuration/",
  "https://ai16z.github.io/eliza/docs/guides/advanced/",
  "https://ai16z.github.io/eliza/docs/guides/secrets-management/",
  "https://ai16z.github.io/eliza/docs/guides/local-development/",
  "https://ai16z.github.io/eliza/docs/advanced/fine-tuning/",
  "https://ai16z.github.io/eliza/docs/advanced/infrastructure/",
  "https://ai16z.github.io/eliza/docs/advanced/trust-engine/",
  "https://ai16z.github.io/eliza/docs/advanced/autonomous-trading/",
  "https://ai16z.github.io/eliza/docs/packages/",
  "https://ai16z.github.io/eliza/docs/packages/core/",
  "https://ai16z.github.io/eliza/docs/packages/adapters/",
  "https://ai16z.github.io/eliza/docs/packages/clients/",
  "https://ai16z.github.io/eliza/docs/packages/agent/",
  "https://ai16z.github.io/eliza/docs/packages/plugins/",
];

console.time("fetch-all");
const markdownContents = await Promise.all(
  urls.map(async (url) => {
    console.time(`fetch-${url}`);
    const response = await fetch(`https://r.jina.ai/${url}`);
    console.timeEnd(`fetch-${url}`);
    console.time(`text-${url}`);
    const text = await response.text();
    console.timeEnd(`text-${url}`);

    // Extract title and URL from first two lines
    const lines = text.split("\n");
    const metadata = {
      title: lines[0].replace(/^Title:\s*/, "").trim(),
      url: url,
    };

    return { content: text, metadata };
  })
);
console.timeEnd("fetch-all");

console.time("chunk-all");
const markdownContentChunks = markdownContents
  .map(({ content, metadata }) => {
    console.time(`chunk-${content.slice(0, 10)}`);
    const chunks = chunkMarkdown(content, metadata);
    console.timeEnd(`chunk-${content.slice(0, 10)}`);
    return chunks;
  })
  .flat();
console.timeEnd("chunk-all");

console.time("embeddings-all");
const embeddings = await embedBatch(
  markdownContentChunks.map((chunk) => chunk.content)
);
console.timeEnd("embeddings-all");

console.time("db-insert");
// Create batch of insert operations
const insertOperations = markdownContentChunks.map((chunk, i) => ({
  sql: `
    INSERT OR IGNORE INTO docs (hash, title, url, content, full_emb)
    VALUES (?, ?, ?, ?, vector32(?))
  `,
  args: [
    hashString(chunk.content),
    chunk.metadata.title,
    chunk.metadata.url,
    chunk.content,
    `[${embeddings[i].join(", ")}]`,
  ],
}));

// Execute all insertions in a single transaction
await turso.batch(insertOperations, "write");
console.timeEnd("db-insert");

console.log(
  `Inserted ${markdownContentChunks.length} documents into the database`
);

console.timeEnd("total-execution");
