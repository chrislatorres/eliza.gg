import { createTurso } from "@/lib/indexer/utils/create-turso";
import { embed } from "@/lib/indexer/utils/embed";

export async function POST(request: Request) {
  const { query, limit = 10 } = await request.json();

  if (!query) {
    return Response.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const queryEmbedding = await embed(query);

  const turso = createTurso();

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
      LIMIT ?
    `,
    args: [`[${queryEmbedding.join(", ")}]`, limit],
  });

  const searchResults = rows.map((row) => ({
    url: row[2] as string,
    content: row[3] as string,
  }));

  return Response.json(searchResults);
}
