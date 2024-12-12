import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

const postsDirectory = path.join(process.cwd(), 'src/app/(feed)/feed/content/blog')

export function getPosts() {
    // Get file names under /blog
    const fileNames = fs.readdirSync(postsDirectory)

    const allPosts = fileNames
        .filter(fileName => fileName.endsWith('.mdx'))
        .map(fileName => {
            // Remove ".mdx" from file name to get slug
            const slug = fileName.replace(/\.mdx$/, '')

            // Read markdown file as string
            const fullPath = path.join(postsDirectory, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')

            // Use gray-matter to parse the post metadata section
            const { data: frontmatter, content } = matter(fileContents)

            // Ensure all required frontmatter fields exist
            const post = {
                slug,
                content,
                frontmatter: {
                    title: frontmatter.title ?? 'Untitled',
                    date: frontmatter.date ?? new Date().toISOString(),
                    excerpt: frontmatter.excerpt ?? frontmatter.description ?? 'No description provided',
                    image: frontmatter.image ?? null,
                    ...frontmatter
                }
            }

            return post
        })

    // Sort posts by date
    return allPosts.sort((a, b) => {
        if (a.frontmatter.date < b.frontmatter.date) {
            return 1
        } else {
            return -1
        }
    })
}

export function getPostBySlug(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)

    try {
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const { data: frontmatter, content } = matter(fileContents)

        return {
            slug,
            frontmatter: {
                title: frontmatter.title ?? 'Untitled',
                date: frontmatter.date ?? new Date().toISOString(),
                excerpt: frontmatter.excerpt ?? frontmatter.description ?? 'No description provided',
                image: frontmatter.image ?? null,
                ...frontmatter
            },
            content
        }
    } catch (e) {
        return null
    }
} 