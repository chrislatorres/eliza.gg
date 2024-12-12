import { createTurso } from "@/libs/indexer/utils/create-turso";

export type BlogComment = {
    id: string;
    postSlug: string;
    userMessage: string;
    aiResponse: string;
    createdAt: string;
    replyTo: string | null;
}

export async function ensureBlogCommentsTable() {
    const db = createTurso();

    try {
        // Create table only if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS blog_comments (
                id TEXT PRIMARY KEY,
                post_slug TEXT NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                reply_to TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reply_to) REFERENCES blog_comments(id)
            )
        `);
        console.log('Blog comments table verified');
    } catch (error) {
        console.error('Error creating blog comments table:', error);
        throw error;
    }
}

export async function getPostComments(postSlug: string) {
    const db = createTurso();

    try {
        await ensureBlogCommentsTable();
        console.log('Fetching comments for:', postSlug);

        const { rows } = await db.execute({
            sql: `
                SELECT * FROM blog_comments 
                WHERE post_slug = ? 
                ORDER BY 
                    CASE WHEN reply_to IS NULL THEN created_at END DESC,
                    CASE WHEN reply_to IS NOT NULL THEN created_at END ASC
            `,
            args: [postSlug]
        });

        const comments: BlogComment[] = rows.map(row => ({
            id: row.id as string,
            postSlug: row.post_slug as string,
            userMessage: row.user_message as string,
            aiResponse: row.ai_response as string,
            createdAt: row.created_at as string,
            replyTo: row.reply_to as string | null
        }));

        console.log('Found comments:', comments);
        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
} 