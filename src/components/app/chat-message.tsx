import { CodeBlock } from "@/components/app/code-block";
import { Citation } from "@/types/chat";
import { Message } from "ai";
import clsx from "clsx";
import Markdown from "markdown-to-jsx";

interface ChatMessageProps {
  message: Message;
  i: number;
  citations?: Citation[];
}

export function ChatMessage({ message, i, citations }: ChatMessageProps) {
  return (
    <div
      key={message.id}
      className={clsx([
        "w-full whitespace-pre-wrap",
        "prose prose-slate dark:prose-invert prose-headings:my-0 prose-p:mt-0 !max-w-full",
        message.role === "user" ? "text-3xl font-semibold" : "",
        message.role === "user" && i !== 0
          ? "border-t pt-4 border-zinc-950/5 dark:border-white/5"
          : "",
      ])}
    >
      <Markdown
        options={{
          overrides: {
            code: {
              component: CodeBlock,
            },
          },
        }}
      >
        {message.content as string}
      </Markdown>

      {citations && citations.length > 0 && (
        <div className="text-sm pt-4">
          <div className="font-medium mb-2">Sources:</div>
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={index} className="text-zinc-600 dark:text-zinc-400">
                [{index + 1}]{" "}
                <a
                  href={citation.url}
                  className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {citation.url}
                </a>
                <div className="text-xs mt-1">{citation.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
