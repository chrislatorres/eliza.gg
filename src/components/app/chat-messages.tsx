"use client";

import { ChatMessage } from "@/components/app/chat-message";
import { Citation } from "@/types/chat";
import { Message } from "ai";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
  citations?: Citation[];
}

export function ChatMessages({ messages, citations }: ChatMessagesProps) {
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight * 2,
      behavior: "instant",
    });
  }, [messages]);

  // Also scroll when the last message content changes (streaming)
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      window.scrollTo({
        top: document.documentElement.scrollHeight * 2,
        behavior: "instant",
      });
    }
  }, [messages[messages.length - 1]?.content]);

  return (
    <div className="flex flex-col gap-4 whitespace-normal break-words">
      {messages.map((message, i) => (
        <div
          key={message.id}
          ref={i === messages.length - 1 ? lastMessageRef : undefined}
        >
          <ChatMessage
            message={message}
            i={i}
            citations={message.role === "assistant" ? citations : undefined}
          />
        </div>
      ))}
    </div>
  );
}
