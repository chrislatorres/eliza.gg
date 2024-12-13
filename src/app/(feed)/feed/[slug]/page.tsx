import { DiscussionSection } from "@/components/app/discussion-section";
import { getPostComments } from "@/lib/comments";
import { getCompletion } from "@/lib/openrouter";
import { createClient } from '@libsql/client';
import { notFound } from "next/navigation";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function generateDocumentation(content: string) {
    try {
        const messages = [{
            role: "system",
            content: "You are Eliza, an AI assistant who understands the Eliza codebase and its development. Create detailed technical documentation for pull requests."
        }, {
            role: "user",
            content: `Analyze this PR and create a detailed technical summary. Focus on:
1. Key changes and their impact
2. Architecture decisions
3. Implementation details
4. Potential implications

PR Content:
${content}`
        }];

        const response = await getCompletion(messages);
        return response;
    } catch (error) {
        console.error('Error generating documentation:', error);
        return "Unable to generate documentation at this time. Please refer to the PR content below.";
    }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
    const result = await client.execute({
        sql: 'SELECT * FROM posts WHERE slug = ?',
        args: [params.slug]
    });

    const post = result.rows?.[0];
    if (!post) {
        notFound();
    }

    const prMatch = post.content.match(/\[#(\d+)\]\((https:\/\/github\.com\/[^)]+)\)/);
    const prNumber = prMatch?.[1];
    const prUrl = prMatch?.[2];

    const comments = await getPostComments(params.slug);
    const documentation = await generateDocumentation(post.content);

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
                        {prUrl && (
                            <a
                                href={prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block text-orange-400 hover:text-orange-300"
                            >
                                View PR #{prNumber} on GitHub →
                            </a>
                        )}
                    </header>

                    <div className="mb-12 p-6 rounded-lg bg-gray-900">
                        <h2 className="text-2xl font-bold text-white mb-4">Technical Documentation</h2>
                        <div className="prose prose-invert prose-lg max-w-none whitespace-pre-wrap">
                            {documentation}
                        </div>
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