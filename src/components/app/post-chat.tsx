"use client";

import { ChatMessages } from "@/components/app/chat-messages";
import { TextareaWithActions } from "@/components/app/textarea-with-actions";
import { getCompletion } from "@/lib/openrouter";
import { useState } from "react";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

interface PostChatProps {
    postSlug: string;
    postContent: string;
}

export const PostChat = ({ postSlug, postContent }: PostChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        const userMessage = input;
        setInput("");

        // Add user message immediately
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);

        try {
            // Just send the current question, but with PR context
            const chatMessages = [{
                role: "user",
                content: userMessage
            }];

            const context = `You are Eliza, an AI assistant who understands the Eliza codebase and its development. 
Here is the conversation history:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Here is the PR being discussed:
${postContent}

Please help answer the user's question about this PR.`;

            const response = await getCompletion(chatMessages, context);

            // Add AI response
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`
            }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col relative">
            <div className="flex-1">
                <ChatMessages messages={messages} citations={[]} />
            </div>
            <div className="mt-4">
                <TextareaWithActions
                    input={input}
                    onInputChange={(e) => setInput(e.target.value)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    placeholder="Ask about this PR..."
                />
            </div>
        </div>
    );
}; 