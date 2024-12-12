import { getPostBySlug, getPosts } from '@/lib/mdx'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateStaticParams() {
    const posts = getPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export default async function Post({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug)

    return (
        <article>
            <h1>{post.frontmatter.title}</h1>
            <MDXRemote source={post.content} />
        </article>
    )
} 