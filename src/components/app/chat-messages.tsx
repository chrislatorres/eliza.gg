"use client";

import { ChatMessage } from "@/components/app/chat-message";
import { Citation } from "@/types/chat";
import { Message } from "ai";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
  citationsMap: Record<number, Citation[]>;
  followUpPromptsMap: Record<number, string[]>;
  onFollowUpClick: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  citationsMap,
  followUpPromptsMap,
  onFollowUpClick,
}: ChatMessagesProps) {
  console.log({ messages, citationsMap, followUpPromptsMap });
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Calculate assistantIndex for each message
  const getAssistantIndex = (messages: Message[], currentIndex: number) => {
    // For each assistant message, we want to return its position * 2
    return (
      (messages.slice(0, currentIndex + 1).filter((m) => m.role === "assistant")
        .length -
        1) *
      2
    );
  };

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
      {messages.map((message, i) => {
        const assistantIndex =
          message.role === "assistant" ? getAssistantIndex(messages, i) : -1;

        const followUpPrompts =
          message.role === "assistant"
            ? followUpPromptsMap[assistantIndex]
            : undefined;

        return (
          <div
            key={message.id}
            ref={i === messages.length - 1 ? lastMessageRef : undefined}
          >
            <ChatMessage
              message={message}
              i={i}
              citations={
                message.role === "assistant"
                  ? citationsMap[assistantIndex]
                  : undefined
              }
              followUpPrompts={followUpPrompts}
              onFollowUpClick={onFollowUpClick}
            />
          </div>
        );
      })}
    </div>
  );
}
