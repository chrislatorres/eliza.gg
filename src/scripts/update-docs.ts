import { createClient } from '@libsql/client';
import { GitHubDocsGenerator } from '../utils/github-docs-generator';

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

const docsGenerator = new GitHubDocsGenerator(process.env.GITHUB_TOKEN!);

async function generateDocs() {
    try {
        const summaries = await docsGenerator.getLatestPRSummaries(10);

        // Format and store in database
        for (const pr of summaries) {
            const post = {
                title: `PR #${pr.number}: ${pr.title}`,
                content: `
## Technical Summary

**Merged On**: ${new Date(pr.mergedAt!).toLocaleDateString()}
**Author**: @${pr.author}
**Pull Request**: [#${pr.number}](${pr.url})

### Description
${pr.description}

### Changes Overview
${pr.files.map(file => `- \`${file.filename}\`: ${file.changes} changes (+${file.additions} -${file.deletions})`).join('\n')}
                `.trim(),
                author: pr.author || 'System',
                created_at: new Date(pr.mergedAt!).toISOString(),
                type: 'technical-update',
                slug: `pr-${pr.number}-${pr.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 100),
                published: true
            };

            await client.execute({
                sql: `INSERT INTO posts (title, content, author, created_at, type, slug, published) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)
                      ON CONFLICT(slug) DO UPDATE SET
                      content = excluded.content`,
                args: [
                    post.title,
                    post.content,
                    post.author,
                    post.created_at,
                    post.type,
                    post.slug,
                    post.published ? 1 : 0
                ]
            });

            console.log(`Updated post: ${post.slug}`);
        }
    } catch (error) {
        console.error('Failed to generate documentation:', error);
    }
}

generateDocs().catch(console.error);