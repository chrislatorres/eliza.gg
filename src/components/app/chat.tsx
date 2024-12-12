"use client";

import { ChatMessages } from "@/components/app/chat-messages";
import { ChatResponse } from "@/types/chat";
import { useChat } from "ai/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
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
    data,
  } = useChat({
    api: "/api/search",
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Memoize citations
  const citations = useMemo(() => {
    return (data?.[0] as unknown as ChatResponse)?.citations || [];
  }, [data]);

  // Memoize handlers
  const onInputChange = useCallback(handleInputChange, [handleInputChange]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        handleSubmit(e);
      } else {
        toast.info("Coming soon!");
      }
    },
    [handleSubmit]
  );

  // Handle initial query from URL
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && messages.length === 0) {
      setInput(query);
      setTimeout(() => {
        if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
          handleSubmit(new Event("submit") as any);
        } else {
          toast.info("Coming soon!");
        }
      }, 0);
    }
  }, [searchParams, messages.length, setInput, handleSubmit]);

  // Memoize textarea props
  const textareaProps = useMemo(
    () => ({
      input,
      onInputChange,
      onSubmit,
      isLoading,
    }),
    [input, onInputChange, onSubmit, isLoading]
  );

  // Add this near the top of your chat component
  useEffect(() => {
    // Preload markdown and code block components
    const preload = async () => {
      await Promise.all([
        import("markdown-to-jsx"),
        import("@/components/app/code-block"),
      ]);
    };
    preload();
  }, []);

  console.log({ messages });
  return (
    <main className="flex flex-col size-full relative md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] mx-auto w-full">
      <div className="flex-1 pt-16 pb-32  px-4 md:px-0">
        <ChatMessages messages={messages} citations={citations} />
      </div>
      <div className="fixed w-full md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] mx-auto left-0 right-0 bottom-0 pb-4 px-4 md:px-0 bg-white dark:bg-black rounded-t-lg">
        <TextareaWithActions {...textareaProps} />
      </div>
    </main>
  );
};
