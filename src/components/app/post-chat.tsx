"use client";

import { ChatMessages } from "@/components/app/chat-messages";
import { TextareaWithActions } from "@/components/app/textarea-with-actions";
import { ChatResponse } from "@/types/chat";
import { useChat } from "ai/react";
import { useCallback, useMemo } from "react";

interface PostChatProps {
    postSlug: string;
    postContent: string;
}

export const PostChat = ({ postSlug, postContent }: PostChatProps) => {
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        data,
    } = useChat({
        api: "/api/search",
        body: {
            postSlug,
            postContent,
            isPostChat: true
        },
        onError: (error) => {
            console.error("Post chat error:", error);
        },
    });

    // Memoize citations
    const citations = useMemo(() => {
        return (data?.[0] as unknown as ChatResponse)?.citations || [];
    }, [data]);

    // Memoize handlers
    const onInputChange = useCallback(handleInputChange, [handleInputChange]);
    const onSubmit = useCallback(handleSubmit, [handleSubmit]);

    return (
        <div className="flex flex-col relative">
            <div className="flex-1">
                <ChatMessages messages={messages} citations={citations} />
            </div>
            <div className="mt-4">
                <TextareaWithActions
                    input={input}
                    onInputChange={onInputChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    placeholder="Ask about this post..."
                />
            </div>
        </div>
    );
}; 