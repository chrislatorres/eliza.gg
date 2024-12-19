import { chunkMarkdown } from "@/lib/indexer/utils/chunk-markdown";
import { createTurso } from "@/lib/indexer/utils/create-turso";
import { embedBatch } from "@/lib/indexer/utils/embed";
import { hashString } from "@/lib/indexer/utils/hash";

const turso = createTurso();

// Add these near the top of the file
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data ? data : "");
}

function logError(message: string, error: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`, error);
}

// Add retry logic for database operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      logError(
        `Operation failed, attempt ${
          i + 1
        }/${maxRetries}. Retrying in ${delay}ms...`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      // Exponential backoff
      delay *= 2;
    }
  }
  throw new Error("Should never reach here");
}

// Update the GitHub functions with better logging
async function fetchGitHubContent(
  path: string
): Promise<Array<{ name: string; path: string; type: string }>> {
  log(`Fetching GitHub contents for path: ${path}`);
  const response = await fetch(
    `https://api.github.com/repos/ai16z/eliza/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    const error = `GitHub API error: ${response.statusText} for path ${path}`;
    log(`ERROR: ${error}`);
    throw new Error(error);
  }

  const contents = await response.json();
  log(`Found ${contents.length} items in ${path}`);
  return contents;
}

async function getMarkdownFiles(path: string): Promise<string[]> {
  log(`Scanning directory: ${path}`);
  const contents = await fetchGitHubContent(path);
  let markdownFiles: string[] = [];

  for (const item of contents) {
    if (item.type === "file" && item.name.endsWith(".md")) {
      log(`Found markdown file: ${item.path}`);
      markdownFiles.push(item.path);
    } else if (item.type === "dir") {
      log(`Found subdirectory: ${item.path}, scanning...`);
      const subFiles = await getMarkdownFiles(item.path);
      markdownFiles = [...markdownFiles, ...subFiles];
    }
  }

  log(`Total markdown files found in ${path}: ${markdownFiles.length}`);
  return markdownFiles;
}

async function fetchMarkdownContent(path: string) {
  log(`Fetching content for: ${path}`);
  const response = await fetch(
    `https://raw.githubusercontent.com/ai16z/eliza/main/${path}`
  );

  if (!response.ok) {
    const error = `Failed to fetch markdown content: ${response.statusText} for ${path}`;
    log(`ERROR: ${error}`);
    throw new Error(error);
  }

  const content = await response.text();
  log(`Successfully fetched content for ${path} (${content.length} bytes)`);
  return content;
}

console.time("total-execution");
log("Starting indexing process");

log("Setting up database");
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
log("Database setup complete");

log("Starting GitHub content fetch");
console.time("fetch-paths");
const directoriesToScan = ["docs/api", "docs/community", "docs/docs"];
log(`Scanning directories: ${directoriesToScan.join(", ")}`);

const markdownPaths = (
  await Promise.all(directoriesToScan.map((dir) => getMarkdownFiles(dir)))
).flat();
console.timeEnd("fetch-paths");
log(`Found ${markdownPaths.length} total markdown files to process`);

log("Fetching markdown contents");
console.time("fetch-all");
const markdownContents = await Promise.all(
  markdownPaths.map(async (path) => {
    const content = await fetchMarkdownContent(path);
    const metadata = {
      title: path.split("/").pop()?.replace(".md", "") || path,
      url: `https://github.com/ai16z/eliza/blob/main/${path}`,
    };
    log(`Processed ${path} -> ${metadata.title}`);
    return { content, metadata };
  })
);
console.timeEnd("fetch-all");
log(`Successfully fetched all ${markdownContents.length} documents`);

log("Chunking markdown content");
console.time("chunk-all");
const markdownContentChunks = markdownContents
  .map(({ content, metadata }) => {
    const chunks = chunkMarkdown(content, metadata);
    log(`Created ${chunks.length} chunks for ${metadata.title}`);
    return chunks;
  })
  .flat();
console.timeEnd("chunk-all");
log(`Created total of ${markdownContentChunks.length} chunks`);

log("Generating embeddings");
console.time("embeddings-all");
const embeddings = await embedBatch(
  markdownContentChunks.map((chunk) => chunk.content)
);
console.timeEnd("embeddings-all");
log(`Generated ${embeddings.length} embeddings`);

log("Inserting into database");
console.time("db-insert");

// Split into smaller batches to avoid overwhelming the database
const BATCH_SIZE = 100;
let successCount = 0;
let failureCount = 0;

for (let i = 0; i < markdownContentChunks.length; i += BATCH_SIZE) {
  const batch = markdownContentChunks.slice(i, i + BATCH_SIZE);
  const batchOperations = batch.map((chunk, j) => ({
    sql: `
      INSERT OR IGNORE INTO docs (hash, title, url, content, full_emb)
      VALUES (?, ?, ?, ?, vector32(?))
    `,
    args: [
      hashString(chunk.content),
      chunk.metadata.title,
      chunk.metadata.url,
      chunk.content,
      `[${embeddings[i + j].join(", ")}]`,
    ],
  }));

  try {
    log(
      `Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(
        markdownContentChunks.length / BATCH_SIZE
      )}`
    );
    await retryOperation(async () => {
      await turso.batch(batchOperations, "write");
    });
    successCount += batch.length;
    log(`Successfully inserted batch of ${batch.length} documents`);
  } catch (error) {
    logError(`Failed to insert batch starting at index ${i}`, error);
    failureCount += batch.length;

    // Try inserting one by one for failed batches
    log("Attempting individual insertions for failed batch");
    for (const [j, operation] of batchOperations.entries()) {
      try {
        await retryOperation(async () => {
          await turso.execute(operation);
        });
        successCount++;
        failureCount--;
        log(`Successfully inserted individual document ${i + j}`);
      } catch (error) {
        logError(`Failed to insert individual document ${i + j}`, error);
      }
    }
  }
}

console.timeEnd("db-insert");
log(`Insertion complete. Success: ${successCount}, Failures: ${failureCount}`);

log(
  `Successfully inserted ${markdownContentChunks.length} documents into the database`
);
console.timeEnd("total-execution");
log("Indexing process complete");
