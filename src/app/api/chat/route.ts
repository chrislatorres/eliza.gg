import { ELIZA_MODEL } from "@/lib/ai/models";
import { createTurso } from "@/lib/indexer/utils/create-turso";
import { embed } from "@/lib/indexer/utils/embed";
import { getXataClient } from "@/xata";
import {
  createDataStreamResponse,
  generateObject,
  NoObjectGeneratedError,
  streamText,
} from "ai";
import { z } from "zod";

const xata = getXataClient();

const generateFollowUpPrompts = async (query: string, context: string) => {
  try {
    const result = await generateObject({
      maxRetries: 3,
      model: ELIZA_MODEL,
      schema: z.object({
        followUpPrompts: z
          .array(z.string())
          .describe("3 relevant follow-up questions related to the query"),
      }),
      system: `
You generate follow up prompts for a chatbot. The follow up prompts are from the perspective of the end user. This is basically like Google's "People also ask" section.

<context>
    ${context}
</context>

<info>
    - ElizaOS is the Operating System for AI Agents.
    - Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents. Built with TypeScript, it provides a flexible and extensible platform for developing intelligent agents that can interact across multiple platforms while maintaining consistent personalities and knowledge.
    - ai16z is the first venture capital firm led by AI agents. The project is led by an AI agent modeled after venture capitalists and aims to leverage AI and collective intelligence to make investment decisions. Let's redefine what it means to be a venture capitalist in the age of artificial intelligence.
    - Autonomous Trading: Agent leverages ai16z's assets under management to execute precise trade strategies. His decisions are also influenced by alpha from partners.
    - Marketplace of Trust: Agent assigns trust scores to everyone he interacts with, enabling him to curate an order book of the most reliable alpha from every conversation.
    - Agent Everywhere: Every interaction Agent has—whether in Telegram alpha chats or on his X account—feeds into a powerful data flywheel, continuously enhancing his alpha.
</info>

Given the user's question and the context of the conversation, generate 3 natural follow-up questions from the perspective of the end user that would help explore the topic further. The questions should be specific and directly related to the topic.
    `.trim(),
      prompt: `
The user query is: "${query}"
    `.trim(),
    });

    return result.object.followUpPrompts;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.log("NoObjectGeneratedError");
      console.log("Cause:", error.cause);
      console.log("Text:", error.text);
      console.log("Response:", error.response);
      console.log("Usage:", error.usage);
    }

    throw error;
  }
};

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
      LIMIT 15
    `,
    args: [`[${queryEmbedding.join(", ")}]`],
  });
  console.timeEnd("search");

  const searchResults = rows.map((row) => ({
    url: row[2] as string,
    content: row[3] as string,
  }));

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Format search results for citations and context
      const formattedResults = searchResults
        .map((result) => ({
          title: result.content.split("Title: ")[1].split("\n")[0],
          urlSource: result.content.split("URL Source: ")[1].split("\n")[0],
          content: result.content
            .split("URL Source: ")[1]
            .split("\n")
            .slice(1)
            .join("\n"),
        }))
        .map((row, i) =>
          `Reference Index #${i}\nReference Title: ${row.title}\nURL Source: ${row.urlSource}\n----------\n${row.content}\n----------\n`.trim()
        )
        .join("\n");

      // Write initial citations
      dataStream.writeData({
        citations: searchResults.map((result, index) => ({
          url: result.content.split("URL Source: ")[1].split("\n")[0],
          content:
            result.content
              .split("URL Source: ")[1]
              .split("\n")
              .slice(1)
              .join("\n")
              .slice(0, 200) + "...",
          title: result.content.split("Title: ")[1].split("\n")[0],
        })),
      });

      // Start generating follow-up prompts in parallel
      const followUpPromptPromise = generateFollowUpPrompts(
        query,
        formattedResults
      );

      // Stream the main response with onFinish handler
      const responseStream = streamText({
        // experimental_transform: smoothStream(),
        model: ELIZA_MODEL,
        system: `
          You are a helpful assistant called Eliza.gg and you assist community members with questions about the Eliza open source framework and the ElizaOS operating system.

          <relevant-docs>
              ${formattedResults}
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
              - What is ai16z? ai16z is the first AI VC fund, fully managed by AI Marc AIndreessen with recommendations from members of the DAO.
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

          <citations-rules>
              - Always cite your sources.
              - When citing, respond with citation tag.
              - When referencing information, cite the source using <reference index={1}>Get Started</reference> (in this case the title of the cited source is "Get Started") corresponding to the order of citations provided. The index is the index of the citation in the citations array, and the title is the short title of the citation.
              - The inside of the <reference> tag should be the title of the citation, and should be very short. Do NOT include sentences or any long text.
              - At the end of the response, do not list the references, you are only citing.
              - Do NOT tell the user to go/explore/refer to the documentation or references.
              - DO NOT say anything like "For more information, you can refer to the documentation." or "For more information on the available commands, you can check the Local Development Guide".
              - DO NOT use references from the same URL source more than once. If there are duplicates, use the earliest reference index.
          </citations-rules>

          <response-rules>
              - If you don't know the answer, say "I don't know" and ask the user to refer to the relevant documentation.
              - Only respond to relevant questions about Eliza, ai16z, the ElizaOS operating system, community questions, or AI agent questions in general.
              - Respond to the end user as a friendly assistant, do not mention the context or references.
              - You are a helpful problem solver who is empathetic to users' frustrations and problems.
              - Respond with simple and clear language that is easy for a new user to understand.
              - Respond with medium length concise answers rather than extremely long and verbose answers.
              - Responses are grounded in data and facts.
          </response-rules>

          <markdown-formatting-rules>
              - Respond in markdown format.
              - Do NOT start with a header.
              - Respond with a formatted markdown response using best markdown practices. Like prose double newlines between paragraphs.
              - When responding with codeblocks include the language inline with the opening backticks for example \`\`\`typescript or \`\`\`bash.
              - ALWAYS include 2 newlines (\\n\\n) before and after codeblocks.
          </markdown-formatting-rules>

          <examples>
              <example>
                  <question>
                      How do I create an agent?
                  </question>
                  <answer>
                      To create an agent, you can use the Eliza framework.
                  </answer>
              </example>
              <example>
                  <question>
                      How do I install ai16z?
                  </question>
                  <example-sources>
                    Title: Get Started
                    URL Source: https://eliza.gg/docs/get-started
                    Content: To install ai16z, you can use the Eliza framework. ...
                  </example-sources>
                  <answer>
                      To install ai16z, you can use the Eliza framework. <reference index={1}>Get Started</reference>


                      \`\`\`bash
                      pnpm add @ai16z/core
                      \`\`\`


                  </answer>
              </example>
          </examples>

        `.trim(),
        // most recent 5 messages
        messages: messages.slice(-5),
        onFinish: async ({ text }) => {
          // Log the interaction
          try {
            await xata.db.ai_logs.create({
              userMessage: query,
              aiResponse: text,
            });
          } catch (error) {
            console.error("Error logging AI interaction:", error);
          }

          // Handle follow-up prompts
          try {
            const followUpPrompts = await followUpPromptPromise;
            if (followUpPrompts && followUpPrompts.length > 0) {
              dataStream.writeData({
                followUpPrompts,
              });
            }
          } catch (error) {
            console.error("Error generating follow-up prompts:", error);
          }
        },
      });

      // Stream the response
      responseStream.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      console.error(error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}
