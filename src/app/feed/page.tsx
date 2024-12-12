import { getMdxFiles } from "@/lib/mdx";
import Link from "next/link";

export default function FeedPage() {
    const posts = getMdxFiles();

    return (
        <div className="max-w-2xl mx-auto px-4">
            <div className="space-y-8">
                {posts.map((post) => (
                    <article key={post.slug} className="border-b border-gray-200 pb-8">
                        <Link href={`/feed/${post.slug}`} className="block">
                            <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
                                {post.title}
                            </h2>
                            <time className="text-gray-600 mb-2 block">
                                {new Date(post.date).toLocaleDateString()}
                            </time>
                            <p className="text-gray-600">{post.summary}</p>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
} 