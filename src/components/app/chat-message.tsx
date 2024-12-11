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
          forceBlock: true,
          overrides: {
            p: (props) => (
              <div
                className={clsx(["flex items-center", props.className])}
                {...props}
              />
            ),
            pre: (props) => (
              <pre
                className={clsx(["!px-0 !py-0 !mb-0 !mt-4", props.className])}
                {...props}
              />
            ),
            code: {
              component: CodeBlock,
            },
            reference: {
              component: ({ children, index }) => (
                <a
                  href={citations?.[index]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx([
                    "inline-flex items-center justify-center",
                    "align-super text-[0.6em] font-normal",
                    "no-underline rounded-sm",
                    "text-blue-600 dark:text-blue-400",
                    "hover:text-blue-800 dark:hover:text-blue-200",
                    "py-0.5",
                    "leading-none",
                  ])}
                >
                  [{children}]
                </a>
              ),
            },
          },
        }}
      >
        {message.content as string}
      </Markdown>

      {/* {citations && citations.length > 0 && (
        <div className="text-sm pt-4">
          <div className="font-medium mb-2">Sources:</div>
          <div className="space-y-2">
            {citations.map((citation, index) => (
              <div key={index} className="text-zinc-600 dark:text-zinc-400">
                {index + 1}.{" "}
                <a
                  href={citation.url}
                  className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {citation.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
