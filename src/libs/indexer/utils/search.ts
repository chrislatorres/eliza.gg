import { getDocuments } from "./get-documents";

interface SearchResult {
    title: string;
    content: string;
    score: number;
}

export async function searchDocuments(query: string): Promise<SearchResult[]> {
    const docs = await getDocuments();

    // Simple search implementation
    const results = docs.map(doc => {
        // Calculate relevance score based on term frequency
        const score = calculateScore(doc.content.toLowerCase(), query.toLowerCase());

        return {
            title: doc.title,
            content: doc.content,
            score
        };
    });

    // Sort by score and return top matches
    return results.sort((a, b) => b.score - a.score);
}

function calculateScore(content: string, query: string): number {
    const words = query.split(/\s+/);
    let score = 0;

    for (const word of words) {
        // Skip very short words
        if (word.length < 3) continue;

        const regex = new RegExp(word, 'gi');
        const matches = content.match(regex);
        if (matches) {
            score += matches.length;
        }
    }

    return score;
} 