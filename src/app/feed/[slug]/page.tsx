import { getMdxFiles } from "@/lib/mdx";
import { readFileSync } from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import path from "path";

export async function generateStaticParams() {
    const posts = getMdxFiles();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

async function getPost(slug: string) {
    const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`);
    const fileContents = readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    if (!data || !content) {
        return null;
    }

    return {
        frontmatter: data,
        content,
    };
}

export default async function PostPage({
    params,
}: {
    params: { slug: string };
}) {
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="max-w-2xl mx-auto px-4 py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {post.frontmatter.title}
                </h1>
                <time className="text-sm text-gray-600 mt-2 block">
                    {new Date(post.frontmatter.date).toLocaleDateString()}
                </time>
            </header>
            <div className="prose dark:prose-invert max-w-none">
                {post.content}
            </div>
        </article>
    );
} 