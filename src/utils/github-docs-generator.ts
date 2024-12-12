import { Octokit } from "@octokit/rest";

export class GitHubDocsGenerator {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    constructor(authToken: string, owner: string = 'ai16z', repo: string = 'eliza') {
        this.octokit = new Octokit({
            auth: authToken
        });
        this.owner = owner;
        this.repo = repo;
    }

    async getMergedPRs(since?: string) {
        try {
            const { data: pullRequests } = await this.octokit.rest.pulls.list({
                owner: this.owner,
                repo: this.repo,
                state: 'closed',
                sort: 'updated',
                direction: 'desc',
                per_page: 100
            });

            // Filter to only merged PRs
            const mergedPRs = pullRequests.filter(pr => pr.merged_at !== null);

            if (since) {
                return mergedPRs.filter(pr =>
                    new Date(pr.merged_at!) > new Date(since)
                );
            }

            return mergedPRs;
        } catch (error) {
            console.error('Error fetching merged PRs:', error);
            throw error;
        }
    }

    async generateDocsSummary(since?: string) {
        const mergedPRs = await this.getMergedPRs(since);
        let summary = '# Recent Updates\n\n';

        for (const pr of mergedPRs) {
            // Get PR details including files changed
            const { data: prDetails } = await this.octokit.rest.pulls.get({
                owner: this.owner,
                repo: this.repo,
                pull_number: pr.number
            });

            summary += `## ${pr.title}\n`;
            summary += `Merged on: ${new Date(pr.merged_at!).toLocaleDateString()}\n`;
            summary += `PR #${pr.number} by @${pr.user?.login}\n\n`;

            if (pr.body) {
                summary += `### Description\n${pr.body}\n\n`;
            }

            // Add files changed summary
            const { data: files } = await this.octokit.rest.pulls.listFiles({
                owner: this.owner,
                repo: this.repo,
                pull_number: pr.number
            });

            summary += '### Files Changed\n';
            files.forEach(file => {
                summary += `- ${file.filename} (${file.changes} changes)\n`;
            });

            summary += '\n---\n\n';
        }

        return summary;
    }

    async updateFeed(content: string) {
        try {
            // Get the current feed file if it exists
            let existingContent = '';
            let sha: string | undefined;
            try {
                const { data: existingFile } = await this.octokit.rest.repos.getContent({
                    owner: this.owner,
                    repo: this.repo,
                    path: 'docs/CHANGELOG.md'
                });

                if ('content' in existingFile && typeof existingFile.content === 'string') {
                    existingContent = Buffer.from(existingFile.content, 'base64').toString();
                }

                if ('sha' in existingFile) {
                    sha = existingFile.sha;
                }
            } catch (error) {
                // File doesn't exist yet, that's ok
            }

            // Prepend new content to existing content
            const updatedContent = content + (existingContent ? '\n' + existingContent : '');

            // Create or update the file
            await this.octokit.rest.repos.createOrUpdateFileContents({
                owner: this.owner,
                repo: this.repo,
                path: 'docs/CHANGELOG.md',
                message: 'docs: update changelog from merged PRs',
                content: Buffer.from(updatedContent).toString('base64'),
                sha: sha
            });

        } catch (error) {
            console.error('Error updating feed:', error);
            throw error;
        }
    }

    async getLatestPRSummaries(limit: number = 10) {
        try {
            const { data: pullRequests } = await this.octokit.rest.pulls.list({
                owner: this.owner,
                repo: this.repo,
                state: 'closed',
                sort: 'updated',
                direction: 'desc',
                per_page: limit
            });

            const mergedPRs = pullRequests.filter(pr => pr.merged_at !== null);

            // Get detailed summaries for each PR
            const summaries = await Promise.all(mergedPRs.slice(0, limit).map(async pr => {
                const { data: files } = await this.octokit.rest.pulls.listFiles({
                    owner: this.owner,
                    repo: this.repo,
                    pull_number: pr.number
                });

                return {
                    title: pr.title,
                    number: pr.number,
                    mergedAt: pr.merged_at,
                    author: pr.user?.login,
                    description: pr.body || '',
                    files: files.map(file => ({
                        filename: file.filename,
                        changes: file.changes,
                        additions: file.additions,
                        deletions: file.deletions
                    })),
                    url: pr.html_url
                };
            }));

            return summaries;
        } catch (error) {
            console.error('Error fetching PR summaries:', error);
            throw error;
        }
    }
} 