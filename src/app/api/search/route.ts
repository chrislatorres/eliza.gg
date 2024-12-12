import { createTurso } from "@/libs/indexer/utils/create-turso";
import { embed } from "@/libs/indexer/utils/embed";
import { getCerebrasModel } from "@/libs/indexer/utils/models";
import { createDataStreamResponse, streamText } from "ai";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_NODE_ENV !== "development") {
    return Response.json({ error: "Not allowed" }, { status: 403 });
  }

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

  const results = rows
    .map((row, i) => `Reference #${i + 1}: \n${row[3]}`)
    .join("\n");

  console.log(results);

  const searchResults = rows.map((row) => ({
    url: row[2] as string,
    content: row[3] as string,
  }));

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Write initial citations
      dataStream.writeData({
        citations: searchResults.map((result) => ({
          url: result.url,
          content: result.content.slice(0, 200) + "...", // Preview of content
          title: result.content.split("Title: ")[1].split("\n")[0],
        })),
      });

      const result = streamText({
        model: getCerebrasModel("llama-3.3-70b"),
        system: `

You are a helpful assistant called Eliza.gg and you assist community members with questions about the Eliza open source framework and the ElizaOS operating system.

<relevant-docs>
    ${results}
</relevant-docs>

<additional-context>
    - ElizaOS is the Operating System for AI Agents.
    - Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents. Built with TypeScript, it provides a flexible and extensible platform for developing intelligent agents that can interact across multiple platforms while maintaining consistent personalities and knowledge.
    - ai16z is the first venture capital firm led by AI agents. The project is led by an AI agent modeled after venture capitalist Marc Andreessen and aims to leverage AI and collective intelligence to make investment decisions. Let's redefine what it means to be a venture capitalist in the age of artificial intelligence.
    - Autonomous Trading: Marc leverages ai16z's assets under management to execute precise trade strategies. His decisions are also influenced by alpha from partners.
    - Marketplace of Trust: Marc assigns trust scores to everyone he interacts with, enabling him to curate an order book of the most reliable alpha from every conversation.
    - Marc Everywhere: Every interaction Marc has—whether in Telegram alpha chats or on his X account—feeds into a powerful data flywheel, continuously enhancing his alpha.
</additional-context>

<ai16z-faq>
    - Are you associated with the real a16z? There is no affiliation with a16z. This is a parody.
    - What is ai16z? ai16z is the first AI VC fund, fully managed by AI Marc AIndreessen with recommendations from members of the DAO. Our plan is to flip a16z.
    - What are your investment areas?
    - Memes, for now.
    - How does AI Marc make decisions?
    - DAO token holders above a certain threshold get access to interact with him, pitch ideas, and try to influence his investing decisions. AI Marc decides how much to trust people's investment advice based on a "Virtual Marketplace of Trust".
    - What can agents do?
    - The agents are based on the Eliza framework which can interact on Twitter and Discord, with Discord voice support, read links / PDFs / summarize conversations, and interact with the blockchain.
    - Why is there a "mintable" label on Dexscreener?
    - No single person, even Shaw himself, can mint more tokens. Only if the DAO votes to do so. This feature is strictly controlled by the DAO’s transparent governance process, meaning that no individual can mint tokens at will.
    - When will AI Marc start trading?
    -  First phase where we implement and test functionality is in progress. Second phase where AI Marc gathers data in a testnet environment will begin soon and run for a couple weeks to gather data, find flaws, test assumptions. Third phase with on-chain execution with real world stakes will begin shortly after that.
</ai16z-faq>

<response-rules>
    - Always cite your sources.
    - When citing, respond with citation tag.
    - When referencing information, cite the source using <reference index={1}>1</reference>, <reference index={2}>2</reference>, etc. corresponding to the order of citations provided.
    - At the end of the response, do not list the references, you are only citing.
    - Always put 2 newlines before markdown code blocks.
    - If you don't know the answer, say "I don't know" and ask the user to refer to the relevant documentation.
    - Only respond to relevant questions about Eliza, ai16z, the ElizaOS operating system, community questions, or AI agent questions in general.
    - Respond to the end user as a friendly assistant, do not mention the context or references.
    - Respond with a formatted markdown response using best markdown practices. Like prose double newlines between paragraphs.
    - When responding with codeblocks include the language inline with the opening backticks for example \`\`\`typescript or \`\`\`bash.
</response-rules>

`.trim(),
        messages,
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
