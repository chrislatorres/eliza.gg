import { Citation } from "@/types/chat";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Message } from "ai";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load markdown-to-jsx
const Markdown = dynamic(() => import("markdown-to-jsx"), {
  ssr: true,
});

// Lazy load CodeBlock component
const CodeBlock = dynamic(
  () => import("@/components/app/code-block").then((mod) => mod.CodeBlock),
  {
    ssr: true,
  }
);

interface ChatMessageProps {
  message: Message;
  i: number;
  citations?: Citation[];
  followUpPrompts?: string[];
  onFollowUpClick?: (prompt: string) => void;
}

export function ChatMessage({
  message,
  i,
  citations,
  followUpPrompts,
  onFollowUpClick,
}: ChatMessageProps) {
  console.log({
    message,
    i,
    citations,
    followUpPrompts,
  });
  return (
    <div
      key={message.id}
      className={clsx([
        "w-full",
        "prose prose-zinc dark:prose-invert !max-w-full",
        "prose-headings:mt-0 prose-headings:mb-0  prose-headings:my-0 prose-p:mt-0 ",
        message.role === "user" && i !== 0
          ? "border-t pt-4 border-zinc-950/5 dark:border-white/5"
          : "",
      ])}
    >
      <Suspense fallback={null}>
        <Markdown
          options={{
            forceBlock: true,
            overrides: {
              // p: (props) => (
              //   <div
              //     className={clsx(["flex items-center", props.className])}
              //     {...props}
              //   />
              // ),
              // pre: (props) => (
              //   <pre
              //     className={clsx(["!px-0 !py-0 !mb-0 !mt-4", props.className])}
              //     {...props}
              //   />
              // ),
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
          }}
        >
          {message.role === "user"
            ? `# ${message.content}`
            : (message.content as string)}
        </Markdown>
      </Suspense>

      {message.role === "assistant" &&
        followUpPrompts &&
        followUpPrompts.length > 0 && (
          <div className="mt-4 border-t border-zinc-950/5 dark:border-zinc-950/5 pt-4">
            <div className="flex flex-col divide-y divide-zinc-950/5 dark:divide-zinc-950/5">
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
}
