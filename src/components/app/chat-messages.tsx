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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<string>("");
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    // Clear any pending scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Schedule the scroll with a small delay to ensure content is rendered
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTarget =
        document.documentElement.scrollHeight - window.innerHeight;
      // Add extra padding to ensure content is above the textarea (increased from 200 to 400)
      window.scrollTo({
        top: document.documentElement.scrollHeight + 400,
        behavior,
      });
    }, 100);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage.content !== lastMessageRef.current;

    if (isNewMessage) {
      lastMessageRef.current = lastMessage.content;
      scrollToBottom("instant");
    }
  }, [messages]);

  // Scroll while assistant is streaming
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (isAtBottom) {
        scrollToBottom();
      }
    }
  }, [messages[messages.length - 1]?.content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  console.log({
    messages,
    citationsMap,
    followUpPromptsMap,
  });

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message, i) => {
        const assistantIndex =
          message.role === "assistant"
            ? messages.slice(0, i + 1).filter((m) => m.role === "assistant")
                .length - 1
            : -1;

        console.log({
          i,
          assistantIndex,
          citationsMap,
        });

        return (
          <div
            key={message.id}
            ref={i === messages.length - 1 ? messagesEndRef : undefined}
          >
            <ChatMessage
              message={message}
              i={i}
              citations={
                message.role === "assistant" ? citationsMap[i - 1] : undefined
              }
              followUpPrompts={
                message.role === "assistant"
                  ? followUpPromptsMap[assistantIndex]
                  : undefined
              }
              onFollowUpClick={onFollowUpClick}
            />
          </div>
        );
      })}
    </div>
  );
}
