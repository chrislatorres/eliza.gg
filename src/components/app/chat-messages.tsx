"use client";

import { ChatMessage } from "@/components/app/chat-message";
import { ChatScrollAnchor } from "@/components/app/chat-scroll-anchor";
import { Citation } from "@/types/chat";
import { Message } from "ai";
import { useEffect } from "react";

interface ChatMessagesProps {
  messages: Message[];
  citations?: Citation[];
}

export function ChatMessages({ messages, citations }: ChatMessagesProps) {
  useEffect(() => {
    // Check if we're near the bottom before auto-scrolling
    const isNearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100;

    if (isNearBottom) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 whitespace-normal break-words">
      {messages.map((message, i) => (
        <ChatMessage
          key={message.id}
          message={message}
          i={i}
          citations={message.role === "assistant" ? citations : undefined}
        />
      ))}
      <ChatScrollAnchor />
    </div>
  );
}
