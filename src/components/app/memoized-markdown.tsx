import { Lexer } from "marked";
import { memo, useMemo } from "react";
import dynamic from "next/dynamic";

const Markdown = dynamic(() => import("markdown-to-jsx"), {
  ssr: true,
});

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const lexer = new Lexer();
  const tokens = lexer.lex(markdown);
  return tokens.map((token) => token.raw);
}

const MemoizedMarkdownBlock = memo(
  ({ content, options }: { content: string; options: any }) => {
    return <Markdown options={options}>{content}</Markdown>;
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id, options }: { content: string; id: string; options: any }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock
        content={block}
        options={options}
        key={`${id}-block_${index}`}
      />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
