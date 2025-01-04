"use client";

import { ChatMessages } from "@/components/app/chat-messages";
import { ChatResponse, Citation } from "@/types/chat";
import { useChat } from "ai/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
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
    append,
  } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const citations = useMemo(() => {
    return (
      (data as unknown as ChatResponse[])?.reduce((acc, d, index) => {
        acc[index] = d.citations || [];
        return acc;
      }, {} as Record<number, Citation[]>) || {}
    );
  }, [data]);

  const followUpPrompts = useMemo(() => {
    return (
      (data as unknown as ChatResponse[])?.reduce((acc, d, index) => {
        acc[Math.floor(index / 2)] = d.followUpPrompts || [];
        return acc;
      }, {} as Record<number, string[]>) || {}
    );
  }, [data]);

  const handleFollowUpClick = useCallback(
    (prompt: string) => {
      append({
        content: prompt,
        role: "user",
      });
    },
    [append]
  );

  // Memoize handlers
  const onInputChange = useCallback(handleInputChange, [handleInputChange]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleSubmit(e);
    },
    [handleSubmit]
  );

  // Handle initial query from URL
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && messages.length === 0) {
      setInput(query);
      setTimeout(() => {
        handleSubmit(new Event("submit") as any);
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

  return (
    <main className="flex flex-col min-h-dvh">
      <div className="flex-1 relative md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem] mx-auto w-full px-4 md:px-0">
        <div className="pt-24 pb-40">
          <ChatMessages
            messages={messages}
            citationsMap={citations}
            followUpPromptsMap={followUpPrompts}
            onFollowUpClick={handleFollowUpClick}
          />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-black pb-4 pt-0.5">
        <div className="max-w-3xl mx-auto px-4 md:px-0">
          <TextareaWithActions {...textareaProps} />
        </div>
      </div>
    </main>
  );
};
