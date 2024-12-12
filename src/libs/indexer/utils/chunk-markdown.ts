interface MarkdownMetadata {
  title: string;
  url: string;
}

export function chunkMarkdown(
  markdown: string,
  metadata: MarkdownMetadata,
  chunkSize = 1024,
  overlapSize = 128
) {
  // Remove excessive whitespace and split into lines
  const lines = markdown.trim().split(/\n+/);
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  // Add metadata header to first chunk
  const metadataHeader = [
    `Title: ${metadata.title}`,
    `URL Source: ${metadata.url}`,
  ].join("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineSize = line.length;

    // Start a new chunk if adding this line would exceed the chunk size
    if (currentSize + lineSize > chunkSize && currentChunk.length > 0) {
      // Add metadata header to each chunk
      chunks.push(`${metadataHeader}\n${currentChunk.join("\n")}`);
      // Keep the last few lines for overlap
      currentChunk = currentChunk.slice(-Math.ceil(overlapSize / 50));
      currentSize = currentChunk.reduce((sum, line) => sum + line.length, 0);
    }

    currentChunk.push(line);
    currentSize += lineSize;

    // Handle headers: always start a new chunk after a header
    if (line.startsWith("#")) {
      if (currentChunk.length > 1) {
        // Don't create empty chunks
        chunks.push(`${metadataHeader}\n${currentChunk.join("\n")}`);
      }
      currentChunk = [line];
      currentSize = lineSize;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(`${metadataHeader}\n${currentChunk.join("\n")}`);
  }

  return chunks.map((chunk) => ({
    content: chunk,
    metadata,
  }));
}
