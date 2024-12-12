import { DiscussionSection } from "@/components/app/discussion-section";
import { getPostComments } from "@/lib/comments";
import { createClient } from '@libsql/client';
import { notFound } from "next/navigation";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

export default async function PostPage({ params }: { params: { slug: string } }) {
    // Fetch post directly from Turso
    const result = await client.execute({
        sql: 'SELECT * FROM posts WHERE slug = ?',
        args: [params.slug]
    });

    const post = result.rows?.[0];
    if (!post) {
        notFound();
    }

    const comments = await getPostComments(params.slug);

    return (
        <div className="bg-black min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        <time className="text-sm font-semibold text-orange-400" dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString()}
                        </time>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {post.title}
                        </h1>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                        {post.content}
                    </div>

                    <div className="mt-16">
                        <DiscussionSection
                            postSlug={params.slug}
                            postContent={post.content}
                            initialComments={comments}
                        />
                    </div>
                </article>
            </div>
        </div>
    );
} 