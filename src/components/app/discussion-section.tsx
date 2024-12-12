"use client";

import { BlogComment } from "@/lib/comments";
import { useState } from "react";
import { BlogComments } from "./blog-comments";
import { ChatCommentsToggle } from "./chat-comments-toggle";
import { PostChat } from "./post-chat";

interface DiscussionSectionProps {
    postSlug: string;
    postContent: string;
    initialComments: BlogComment[];
}

export function DiscussionSection({ postSlug, postContent, initialComments }: DiscussionSectionProps) {
    const [mode, setMode] = useState<'chat' | 'comments'>('chat');

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-100">Discussion</h2>
                <ChatCommentsToggle mode={mode} onToggle={setMode} />
            </div>
            {mode === 'chat' ? (
                <PostChat postSlug={postSlug} postContent={postContent} />
            ) : (
                <BlogComments
                    postSlug={postSlug}
                    postContent={postContent}
                    initialComments={initialComments}
                />
            )}
        </div>
    );
} 