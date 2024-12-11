import clsx from "clsx";
import Markdown from "markdown-to-jsx";

export function ChatMessage({ message, i }) {
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
      <Markdown>{message.content as string}</Markdown>
    </div>
  );
}
