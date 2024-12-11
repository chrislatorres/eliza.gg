"use client";

import { ChatMessages } from "@/components/app/chat-messages";
import { ChatResponse } from "@/types/chat";
import { useChat } from "ai/react";
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
    data,
  } = useChat({
    api: "/api/search",
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Extract citations from stream data using safe type assertion
  const citations = (data?.[0] as unknown as ChatResponse)?.citations || [];

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
    <main className="flex flex-col size-full relative max-w-xl mx-auto w-full px-4 md:px-0">
      <div className="flex-1 pt-16 pb-32">
        <ChatMessages messages={messages} citations={citations} />
      </div>
      <div className="fixed w-full max-w-xl mx-auto left-0 right-0 bottom-0 py-4 ">
        <TextareaWithActions
          input={input}
          onInputChange={handleInputChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};
