import { readFileSync, readdirSync } from 'fs'
import matter from 'gray-matter'
import path from 'path'

export type Frontmatter = {
    title: string
    date: string
    summary: string
    slug: string
}

export function getMdxFiles() {
    try {
        const postsDirectory = path.join(process.cwd(), 'content/blog')
        console.log('Reading directory:', postsDirectory)
        const filenames = readdirSync(postsDirectory)
        console.log('Found files:', filenames)

        const posts = filenames
            .filter(filename => filename.endsWith('.mdx'))
            .map(fileName => {
                try {
                    const filePath = path.join(postsDirectory, fileName)
                    const fileContents = readFileSync(filePath, 'utf8')
                    const { data } = matter(fileContents)

                    return {
                        ...(data as Frontmatter),
                        slug: fileName.replace('.mdx', ''),
                    }
                } catch {
                    return null
                }
            })
            .filter((post): post is Frontmatter => post !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        console.log('Processed posts:', posts)
        return posts
    } catch {
        return []
    }
} 