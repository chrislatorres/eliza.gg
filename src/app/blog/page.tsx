import { getPosts } from '@/lib/mdx'
import Link from 'next/link'

export default function BlogPage() {
    const posts = getPosts()
    return (
        <div className="mx-auto max-w-xl py-8">
            <h1 className="mb-8 text-center text-2xl font-black">Blog </h1>
            <div className="space-y-4">
                {posts.map((post) => (
                    <article key={post.slug}>
                        <Link href={`/blog/${post.slug}`}>
                            <h2 className="text-xl font-bold">{post.frontmatter.title}</h2>
                            <time>{post.frontmatter.date}</time>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    )
} 