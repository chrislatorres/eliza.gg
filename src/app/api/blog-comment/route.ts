import { ensureBlogCommentsTable } from "@/lib/comments";
import { getAIResponse } from "@/lib/openrouter";
import { createTurso } from "@/libs/indexer/utils/create-turso";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
    try {
        const { messages, postSlug, replyTo, isAiMention, postContent } = await request.json();
        const db = createTurso();

        await ensureBlogCommentsTable();

        const commentId = nanoid();
        const userMessage = messages[messages.length - 1].content;

        // If @Eliza is mentioned, get AI response
        let aiResponse = "Temporary response";
        if (isAiMention) {
            try {
                console.log('Requesting AI response for:', userMessage);
                aiResponse = await getAIResponse(userMessage, postContent);
                console.log('AI response generated:', aiResponse);
            } catch (error) {
                console.error('AI response error:', error);
                aiResponse = "Sorry, I couldn't generate a response at this time. Please try again later.";
            }
        }

        // Save to database
        await db.execute({
            sql: `
                INSERT INTO blog_comments (id, post_slug, user_message, ai_response, reply_to)
                VALUES (?, ?, ?, ?, ?)
            `,
            args: [
                commentId,
                postSlug,
                userMessage,
                aiResponse,
                replyTo || null
            ]
        });

        return Response.json({
            success: true,
            comment: {
                id: commentId,
                postSlug,
                userMessage,
                aiResponse,
                createdAt: new Date().toISOString(),
                replyTo
            }
        });

    } catch (error) {
        console.error('Full error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });

        return Response.json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
} 