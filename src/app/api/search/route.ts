import { createTurso } from "@/libs/indexer/utils/create-turso";
import { embed } from "@/libs/indexer/utils/embed";
import { getCerebrasModel } from "@/libs/indexer/utils/models";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const lastMessage = messages[messages.length - 1];
  const query = lastMessage.content;

  if (!query) {
    return Response.json({ error: "Missing query parameter" }, { status: 400 });
  }

  console.time(`embed-${query.slice(0, 10)}`);
  const queryEmbedding = await embed(query);
  console.timeEnd(`embed-${query.slice(0, 10)}`);

  const turso = createTurso();

  console.time("search");
  const { rows } = await turso.execute({
    sql: `
      SELECT
        hash,
        title,
        url,
        content,
        vector_distance_cos(full_emb, vector32(?)) as similarity
      FROM docs
      ORDER BY similarity ASC
      LIMIT 5
    `,
    args: [`[${queryEmbedding.join(", ")}]`],
  });
  console.timeEnd("search");

  const results = rows.map((row) => row[3]).join("\n");

  console.log({ results });

  const result = streamText({
    model: getCerebrasModel("llama3.1-70b"),
    system:
      `You are a helpful assistant called Eliza.gg for the Eliza open source framework and the ElizaOS operating system.

Relevant docs:
\`\`\`
${results}
\`\`\`

`.trim(),
    messages,
  });

  return result.toDataStreamResponse();
}
