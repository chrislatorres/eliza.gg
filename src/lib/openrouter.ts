const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function getCompletion(messages: any[], context?: string) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:3000',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'anthropic/claude-3-opus-20240229',
            messages: context
                ? [{ role: 'system', content: `Context: ${context}` }, ...messages]
                : messages,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
} 