import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(request: Request) {
    try {
        const posts = await request.json();

        // Log connection info
        console.log('Turso URL:', process.env.TURSO_DATABASE_URL);

        // Check if posts table exists
        try {
            const tableCheck = await client.execute(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='posts';
            `);
            console.log('Table check result:', tableCheck);

            if (!tableCheck.rows?.length) {
                // Create posts table if it doesn't exist
                await client.execute(`
                    CREATE TABLE IF NOT EXISTS posts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        author TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        type TEXT NOT NULL,
                        slug TEXT UNIQUE NOT NULL,
                        published INTEGER DEFAULT 0
                    )
                `);
                console.log('Created posts table');
            }
        } catch (error) {
            console.error('Error checking/creating table:', error);
            throw error;
        }

        // Batch create the posts
        const results = await Promise.all(posts.map(async (post: any) => {
            try {
                const result = await client.execute({
                    sql: `INSERT INTO posts (title, content, author, created_at, type, slug, published) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    args: [
                        post.title,
                        post.content,
                        post.author,
                        post.createdAt,
                        post.type,
                        post.slug,
                        post.published ? 1 : 0
                    ]
                });
                return result;
            } catch (error) {
                console.error('Error inserting post:', error, post);
                throw error;
            }
        }));

        return NextResponse.json({ success: true, created: results.length });
    } catch (error) {
        console.error('Error creating technical update posts:', error);
        return NextResponse.json({
            error: 'Failed to create posts',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 