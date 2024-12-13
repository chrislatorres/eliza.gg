"use client";

import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Array<{ role: string; content: string }>;
  citations?: Array<any>;
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
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
            }`}
        >
          <div className={`max-w-[80%] rounded-lg p-4 ${message.role === "user"
              ? "bg-orange-500 text-white"
              : "bg-gray-800 text-gray-100"
            }`}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
