import { Citation } from "@/types/chat";
import { ArrowRightIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Message } from "ai";
import clsx from "clsx";
import { memo } from "react";
import { CodeBlock } from "./code-block";
import { MemoizedMarkdown } from "./memoized-markdown";

interface ChatMessageProps {
  message: Message;
  i: number;
  citations?: Citation[];
  followUpPrompts?: string[];
  onFollowUpClick?: (prompt: string) => void;
}

export const ChatMessage = memo(function ChatMessage({
  message,
  i,
  citations,
  followUpPrompts,
  onFollowUpClick,
}: ChatMessageProps) {
  const markdownOptions = {
    forceBlock: true,
    overrides: {
      code: {
        component: CodeBlock,
      },
      reference: {
        component: ({ children, index }) => {
          const citationIndex = Number(index);
          const citation = citations?.[citationIndex];

          return (
            <a
              href={citation?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx([
                "inline-flex items-center justify-center",
                "align-super text-[0.6em] font-normal",
                "no-underline rounded-sm",
                "text-[#ff8c00]",
                "hover:text-[#cc7000]",
                "py-0.5",
                "leading-none",
              ])}
            >
              [{children}]
            </a>
          );
        },
      },
    },
  };

  // Deduplicate citations by URL
  const uniqueCitations = citations?.reduce((acc, current) => {
    const existingCitation = acc.find((c) => c.url === current.url);
    if (!existingCitation) {
      acc.push(current);
    }
    return acc;
  }, [] as Citation[]);

  return (
    <div
      className={clsx(
        "w-full",
        message.role === "user" && i !== 0
          ? "border-t pt-4 border-zinc-950/5 dark:border-white/5"
          : ""
      )}
    >
      {message.role === "assistant" &&
        uniqueCitations &&
        uniqueCitations.length > 0 && (
          <div className="mb-4 text-sm">
            <div className="flex flex-wrap gap-2 text-zinc-500">
              <span className="font-medium">Sources:</span>
              {uniqueCitations.map((citation, index) => (
                <a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 max-w-sm"
                >
                  <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                  <div className="flex-1 truncate">
                    <MemoizedMarkdown
                      id={`citation-${message.id}-${index}`}
                      content={citation.title}
                      options={{
                        wrapper: "span",
                        forceInline: true,
                        overrides: {
                          p: {
                            component: "span",
                            props: {
                              className:
                                "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 truncate",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      <div
        className={clsx(
          "prose prose-zinc dark:prose-invert !max-w-full",
          "prose-headings:mt-0 prose-headings:mb-0 prose-headings:my-0 prose-p:mt-0"
        )}
      >
        <MemoizedMarkdown
          id={message.id}
          content={
            message.role === "user" ? `### ${message.content}` : message.content
          }
          options={markdownOptions}
        />
      </div>

      {message.role === "assistant" && followUpPrompts?.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-col divide-y divide-zinc-950/5 dark:divide-white/5">
            {followUpPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onFollowUpClick?.(prompt)}
                className={clsx([
                  "flex items-center justify-between",
                  "py-2",
                  "bg-transparent",
                  "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                  "transition-colors",
                  "group cursor-pointer",
                  "text-left text-sm",
                  "w-full",
                ])}
              >
                <span>{prompt}</span>
                <ArrowRightIcon className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
