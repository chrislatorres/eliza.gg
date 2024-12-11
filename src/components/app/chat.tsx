"use client";

import { useChat } from "ai/react";
import clsx from "clsx";
import Markdown from "markdown-to-jsx";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { TextareaWithActions } from "./textarea-with-actions";

export const Chat = () => {
  const searchParams = useSearchParams();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "/api/search",
    onError: (error) => {
      console.error("Chat error:", error);
      // You could add toast notification here
    },
  });

  // Handle initial query from URL
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && messages.length === 0) {
      setInput(query);
      // Use setTimeout to ensure the form submission happens after render
      setTimeout(() => {
        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
          handleSubmit(new Event("submit") as any);
        } else {
          toast.info("Coming soon!");
        }
      }, 0);
    }
  }, [searchParams, messages.length, setInput, handleSubmit]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      handleSubmit(e);
    } else {
      toast.info("Coming soon!");
      return;
    }
  };

  return (
    <main className="flex flex-col min-h-dvh size-full relative pt-14 max-w-xl mx-auto w-full px-4 md:px-0">
      <div className="flex-1">
        <div className="flex flex-col w-full pb-8">
          {messages.length > 0 && (
            <div className="flex flex-col gap-4">
              {messages.map((message, i) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="sticky w-full bottom-0 py-4">
        <div className="">
          <TextareaWithActions
            input={input}
            onInputChange={handleInputChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
};
