import { DiscussionSection } from "@/components/app/discussion-section";
import { getPostComments } from "@/lib/comments";
import { getPostBySlug, getPosts } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
    const posts = getPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function PostPage({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);
    const comments = await getPostComments(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="bg-black min-h-screen py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <article className="max-w-3xl mx-auto">
                    <header className="mb-8">
                        <time className="text-sm font-semibold text-orange-400" dateTime={post.frontmatter.date}>
                            {new Date(post.frontmatter.date).toLocaleDateString()}
                        </time>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            {post.frontmatter.title}
                        </h1>
                        {post.frontmatter.excerpt && (
                            <p className="mt-4 text-xl text-gray-400">
                                {post.frontmatter.excerpt}
                            </p>
                        )}
                    </header>

                    {post.frontmatter.image && (
                        <div className="mb-12 aspect-video w-full overflow-hidden rounded-lg">
                            <img
                                src={post.frontmatter.image}
                                alt={post.frontmatter.title}
                                className="w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="prose prose-invert prose-lg max-w-none">
                        <MDXRemote source={post.content} />
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