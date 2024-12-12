import { createClient } from '@libsql/client';
import Link from 'next/link';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export default async function FeedPage() {
    try {
        // Add logging to check the query
        console.log('Fetching posts from Turso...');

        const result = await client.execute({
            sql: 'SELECT title, author, created_at, slug FROM posts WHERE published = ? ORDER BY created_at DESC',
            args: [1]
        });

        console.log('Query result:', result);

        const posts = Array.isArray(result.rows) ? result.rows : [];

        console.log('Processed posts:', posts);

        return (
            <div className="bg-black min-h-screen py-24 sm:py-32">
                <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Latest Updates</h2>
                        <div className="mt-10 space-y-16 border-t border-gray-800 pt-10">
                            {posts.length === 0 ? (
                                <p className="text-gray-400">No posts found</p>
                            ) : (
                                posts.map((post) => (
                                    <article key={post.slug} className="flex flex-col items-start">
                                        <div className="flex items-center gap-x-4 text-xs">
                                            <time dateTime={post.created_at} className="text-gray-400">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </time>
                                            <span className="text-gray-400">@{post.author}</span>
                                        </div>
                                        <div className="group relative">
                                            <h3 className="mt-3 text-lg font-semibold text-white">
                                                <Link href={`/feed/${post.slug}`}>
                                                    <span className="absolute inset-0" />
                                                    {post.title}
                                                </Link>
                                            </h3>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error in FeedPage:', error);
        return (
            <div className="bg-black min-h-screen py-24 sm:py-32">
                <div className="mx-auto max-w-2xl px-6">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Error Loading Feed</h2>
                    <p className="mt-4 text-gray-400">Unable to load posts. Please try again later.</p>
                </div>
            </div>
        );
    }
} 