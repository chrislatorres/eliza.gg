export function PRContent({ content }: { content: string }) {
    return (
        <div className="prose prose-invert prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{
                __html: content
                    .replace(/\r\n/g, '\n')
                    .split('\n')
                    .map(line => `<div>${line}</div>`)
                    .join('')
            }} />
        </div>
    );
} 