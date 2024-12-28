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

// Add these new interfaces near the top of the file
interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  comments_url: string;
  html_url: string;
  created_at: string;
}

interface GitHubComment {
  body: string;
  html_url: string;
  created_at: string;
}

// Add these new interfaces and types near the top of the file
interface BatchProcessingResult {
  successCount: number;
  failureCount: number;
  lastProcessedPage: number;
  documents: Array<{ content: string; metadata: any }>;
}

// Modify the fetchGitHubIssues function to accept more parameters
async function fetchGitHubIssues(
  page = 1,
  perPage = 30,
  since?: string
): Promise<GitHubIssue[]> {
  const sinceParam = since ? `&since=${since}` : "";
  log(`Fetching GitHub issues page ${page} (${perPage} per page)`);

  const response = await fetch(
    `https://api.github.com/repos/ai16z/eliza/issues?state=all&page=${page}&per_page=${perPage}${sinceParam}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    const error = `GitHub API error: ${response.statusText} for issues page ${page}`;
    logError(error, response);
    throw new Error(error);
  }

  const issues = await response.json();
  log(`Found ${issues.length} issues on page ${page}`);
  return issues;
}

async function fetchIssueComments(
  comments_url: string
): Promise<GitHubComment[]> {
  log(`Fetching comments for ${comments_url}`);
  const response = await fetch(comments_url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    const error = `GitHub API error: ${response.statusText} for comments ${comments_url}`;
    logError(error, response);
    throw new Error(error);
  }

  const comments = await response.json();
  log(`Found ${comments.length} comments`);
  return comments;
}

// Add this helper function to convert embeddings to the correct format
function float32ArrayToUint8Array(floats: number[]): Uint8Array {
  const float32Array = new Float32Array(floats);
  return new Uint8Array(float32Array.buffer);
}

// Update the processIssueBatch function with the missing insertion logic
async function processIssueBatch(
  startPage: number,
  batchSize: number,
  since?: string
): Promise<BatchProcessingResult> {
  let successCount = 0;
  let failureCount = 0;
  let currentPage = startPage;
  const perPage = 30; // GitHub API default
  let processedIssues: Array<{ content: string; metadata: any }> = [];

  try {
    while (processedIssues.length < batchSize) {
      const issues = await fetchGitHubIssues(currentPage, perPage, since);
      if (issues.length === 0) break;

      // Process each issue and its comments
      for (const issue of issues) {
        if (processedIssues.length >= batchSize) break;

        try {
          // Add issue itself
          processedIssues.push({
            content: `Title: ${issue.title}\n\n${issue.body || ""}`,
            metadata: {
              title: `Issue #${issue.number}: ${issue.title}`,
              url: issue.html_url,
              type: "issue",
              created_at: issue.created_at,
            },
          });

          // Fetch and add comments
          const comments = await fetchIssueComments(issue.comments_url);
          for (const comment of comments) {
            processedIssues.push({
              content: comment.body,
              metadata: {
                title: `Comment on Issue #${issue.number}`,
                url: comment.html_url,
                type: "issue_comment",
                created_at: comment.created_at,
              },
            });
          }
          successCount++;
        } catch (error) {
          failureCount++;
          logError(`Failed to process issue #${issue.number}`, error);
        }
      }
      currentPage++;
    }

    // Process the batch of documents
    if (processedIssues.length > 0) {
      const contentHashes = processedIssues.map((doc) =>
        String(hashString(doc.content))
      );
      const existingDocs = await checkExistingDocs(contentHashes);

      // Filter out existing documents
      const newDocs = processedIssues.filter(
        (doc, i) => !existingDocs.has(contentHashes[i])
      );

      if (newDocs.length > 0) {
        try {
          const embeddings = await embedBatch(
            newDocs.map((doc) => doc.content)
          );

          // Insert new documents into the database
          for (let i = 0; i < newDocs.length; i++) {
            const doc = newDocs[i];
            const embedding = embeddings[i];

            if (!validateEmbedding(embedding)) {
              logError(`Invalid embedding format for document ${i}`, {
                docTitle: doc.metadata.title,
                embeddingLength: embedding?.length,
                sampleValues: embedding?.slice(0, 5),
              });
              failureCount++;
              continue;
            }

            try {
              await turso.execute({
                sql: `
                  INSERT OR IGNORE INTO docs (hash, title, url, content, full_emb, type, created_at)
                  VALUES (?, ?, ?, ?, vector32(?), ?, ?)
                `,
                args: [
                  String(hashString(doc.content)),
                  doc.metadata.title,
                  doc.metadata.url,
                  doc.content,
                  float32ArrayToUint8Array(embedding),
                  doc.metadata.type || "document",
                  doc.metadata.created_at || new Date().toISOString(),
                ],
              });
              successCount++;
              log(`Inserted document ${i + 1}/${newDocs.length}`);
            } catch (error) {
              failureCount++;
              logError(
                `Failed to insert document ${i + 1}/${newDocs.length}`,
                error
              );
            }
          }
        } catch (error) {
          logError("Failed to generate or process embeddings batch", error);
          failureCount += newDocs.length;
        }
      }
    }

    return {
      successCount,
      failureCount,
      lastProcessedPage: currentPage - 1,
      documents: processedIssues,
    };
  } catch (error) {
    logError("Batch processing failed", error);
    throw error;
  }
}

// Add this new function to track the last processed date
async function getLastProcessedDate(): Promise<string | undefined> {
  try {
    // First check if the column exists
    const tableInfo = await turso.execute(`PRAGMA table_info(docs)`);
    const hasCreatedAt = tableInfo.rows.some(
      (row: any) => row.name === "created_at"
    );

    if (!hasCreatedAt) {
      await turso.execute(`
        ALTER TABLE docs
        ADD COLUMN created_at TEXT
      `);

      await turso.execute(`
        UPDATE docs
        SET created_at = datetime('now')
        WHERE created_at IS NULL
      `);

      return undefined;
    }

    const result = await turso.execute(`
      SELECT MAX(created_at) as last_date
      FROM docs
    `);

    return result.rows[0].last_date
      ? String(result.rows[0].last_date)
      : undefined;
  } catch (error) {
    logError("Failed to get last processed date", error);
    return undefined;
  }
}

// Modify processAllIssuesInBatches to return the processed documents
async function processAllIssuesInBatches(
  batchSize = 100
): Promise<Array<{ content: string; metadata: any }>> {
  let currentPage = 1;
  let totalSuccess = 0;
  let totalFailure = 0;
  let hasMore = true;
  let allProcessedDocs: Array<{ content: string; metadata: any }> = [];

  const lastProcessedDate = await getLastProcessedDate();

  while (hasMore) {
    try {
      log(`Processing batch starting from page ${currentPage}`);
      const result = await processIssueBatch(
        currentPage,
        batchSize,
        lastProcessedDate
      );

      totalSuccess += result.successCount;
      totalFailure += result.failureCount;
      currentPage = result.lastProcessedPage + 1;

      // Store the processed documents
      if (result.documents) {
        allProcessedDocs = [...allProcessedDocs, ...result.documents];
      }

      // If we processed less than the batch size, we're done
      if (result.successCount + result.failureCount < batchSize) {
        hasMore = false;
      }

      // Add a delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      log(
        `Batch complete. Total success: ${totalSuccess}, Total failure: ${totalFailure}`
      );
    } catch (error) {
      logError(
        `Failed to process batch starting at page ${currentPage}`,
        error
      );
      break;
    }
  }

  return allProcessedDocs;
}

// Add this function near the top
type Hash = string; // Using a type alias for clarity

async function checkExistingDocs(hashes: Hash[]): Promise<Set<Hash>> {
  log(`Checking for ${hashes.length} existing documents`);
  const existing = new Set<Hash>();

  // Query in batches to avoid overwhelming the database
  const QUERY_BATCH_SIZE = 500;
  for (let i = 0; i < hashes.length; i += QUERY_BATCH_SIZE) {
    const batch = hashes.slice(i, i + QUERY_BATCH_SIZE);
    const placeholders = batch.map(() => "?").join(",");
    const result = await turso.execute({
      sql: `SELECT hash FROM docs WHERE hash IN (${placeholders})`,
      args: batch,
    });

    // Ensure we're handling the hash as a string
    result.rows.forEach((row) => existing.add(String(row.hash)));
  }

  log(`Found ${existing.size} existing documents`);
  return existing;
}

// Add this helper function inside processIssueBatch
function validateEmbedding(embedding: any): boolean {
  return (
    embedding &&
    Array.isArray(embedding) &&
    embedding.length === 512 &&
    embedding.every((n) => typeof n === "number" && !isNaN(n))
  );
}

console.time("total-execution");
log("Starting indexing process");

log("Setting up database");
console.time("db-setup");
// drop tables
// await turso.execute(`DROP TABLE IF EXISTS embedding_cache`);
// await turso.execute(`DROP TABLE IF EXISTS docs`);

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
  hash       TEXT PRIMARY KEY,
  title      TEXT,
  url        TEXT,
  content    TEXT,
  full_emb   F32_BLOB(512),
  type       TEXT DEFAULT 'document',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

log("Fetching issues and comments in batches");
console.time("fetch-issues");
const issueContents = await processAllIssuesInBatches(100); // Process 100 issues at a time
console.timeEnd("fetch-issues");
log(`Successfully fetched ${issueContents.length} issue-related documents`);

// Combine markdown and issue contents
const allContents = [...markdownContents, ...issueContents];
log(`Total documents to process: ${allContents.length}`);

log("Chunking all content");
console.time("chunk-all");
const contentChunks = allContents
  .map(({ content, metadata }) => {
    const chunks = chunkMarkdown(content, metadata);
    log(`Created ${chunks.length} chunks for ${metadata.title}`);
    return chunks;
  })
  .flat();
console.timeEnd("chunk-all");
log(`Created total of ${contentChunks.length} chunks`);

log("Preparing documents for processing");
// Ensure hashString returns a string
const contentHashes = contentChunks.map((chunk) =>
  String(hashString(chunk.content))
);
const existingDocs = await checkExistingDocs(contentHashes);

// Filter out existing documents
const newChunks = contentChunks.filter(
  (chunk, i) => !existingDocs.has(String(contentHashes[i]))
);

if (newChunks.length === 0) {
  log("No new documents to process");
  console.timeEnd("total-execution");
  process.exit(0);
}

log(`Processing ${newChunks.length} new documents`);

// Only generate embeddings for new documents
log("Generating embeddings for new documents");
console.time("embeddings-all");
const embeddings = await embedBatch(newChunks.map((chunk) => chunk.content));
console.timeEnd("embeddings-all");
log(`Generated ${embeddings.length} embeddings`);

log("Inserting into database");
console.time("db-insert");
let successCount = 0;
let failureCount = 0;

for (let i = 0; i < newChunks.length; i++) {
  const chunk = newChunks[i];
  const embedding = embeddings[i];

  // Better embedding validation
  if (!embedding) {
    log(`Missing embedding for document ${i}`);
    failureCount++;
    continue;
  }

  // Ensure embedding is in the correct format
  const vectorData = Array.isArray(embedding)
    ? embedding
    : Object.values(embedding);
  if (
    vectorData.length !== 512 ||
    !vectorData.every((n) => typeof n === "number")
  ) {
    logError(`Invalid embedding format for document ${i}`, {
      length: vectorData.length,
      sample: vectorData.slice(0, 5),
    });
    failureCount++;
    continue;
  }

  try {
    await turso.execute({
      sql: `
        INSERT OR IGNORE INTO docs (hash, title, url, content, full_emb)
        VALUES (?, ?, ?, ?, vector32(?))
      `,
      args: [
        String(hashString(chunk.content)),
        chunk.metadata.title,
        chunk.metadata.url,
        chunk.content,
        float32ArrayToUint8Array(vectorData),
      ],
    });
    successCount++;
    log(`Inserted document ${i + 1}/${newChunks.length}`);
  } catch (error) {
    failureCount++;
    logError(`Failed to insert document ${i + 1}/${newChunks.length}`, error);
  }
}

log(`Insertion complete. Success: ${successCount}, Failures: ${failureCount}`);
console.timeEnd("db-insert");
