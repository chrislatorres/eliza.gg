import { Citation } from "@/types/chat";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { Message } from "ai";
import clsx from "clsx";
import { memo, useState } from "react";
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
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);

  console.log({
    message,
    citations,
    i,
  });
  const markdownOptions = {
    forceBlock: true,
    overrides: {
      code: {
        component: CodeBlock,
      },
      reference: {
        component: ({ children, index }) => {
          const citationIndex = Number(index);
          const citation = citations?.find((c, i) => i === citationIndex);

          // If citation not found in uniqueCitations, find first citation with same URL
          const displayCitation =
            uniqueCitations?.find((c) => c.url === citation?.url) || citation;

          return (
            <a
              href={displayCitation?.url}
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

  // Deduplicate citations by URL and preserve order
  const uniqueCitations = citations?.reduce((acc, current, idx) => {
    const existingCitation = acc.find(
      (c) => c.url === current.url && c.index === idx
    );
    if (!existingCitation) {
      acc.push({ ...current, index: idx });
    }
    return acc;
  }, [] as (Citation & { index: number })[]);

  return (
    <div
      className={clsx(
        "w-full",
        message.role === "user" && i !== 0
          ? "border-t pt-4 border-zinc-950/5 dark:border-white/5"
          : ""
      )}
    >
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

      {message.role === "assistant" &&
        uniqueCitations &&
        uniqueCitations.length > 0 && (
          <div className="mt-2 text-sm">
            <button
              onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
              className="group flex items-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
            >
              <span className="font-medium">
                {uniqueCitations.length} source
                {uniqueCitations.length > 1 ? "s" : ""}
              </span>
              <div className="flex items-center justify-center w-4 h-4">
                {isSourcesExpanded ? (
                  <ChevronUpIcon className="w-3 h-3" />
                ) : (
                  <ChevronDownIcon className="w-3 h-3" />
                )}
              </div>
            </button>

            {isSourcesExpanded && (
              <div className="flex flex-wrap gap-2 mt-2">
                {uniqueCitations.map((citation, index) => (
                  <a
                    key={index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 max-w-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  >
                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
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
                                className: "truncate",
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

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
