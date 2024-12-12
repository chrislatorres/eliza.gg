"use client";

import { TextareaWithActions } from "@/components/app/textarea-with-actions";
import { BlogComment } from "@/lib/comments";
import { useChat } from "ai/react";
import { useState } from "react";

interface BlogCommentsProps {
    postSlug: string;
    postContent: string;
    initialComments?: BlogComment[];
}

export function BlogComments({ postSlug, postContent, initialComments = [] }: BlogCommentsProps) {
    const [comments, setComments] = useState<BlogComment[]>(initialComments);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const {
        messages,
        input,
        handleInputChange,
        isLoading,
    } = useChat({
        api: "/api/blog-comment",
        body: {
            postSlug,
            postContent,
            replyTo: replyingTo
        }
    });

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isAiMention = input.toLowerCase().includes('@eliza');

        // Optimistically add the comment
        const newComment: BlogComment = {
            id: Date.now().toString(), // Temporary ID
            postSlug,
            userMessage: input,
            aiResponse: isAiMention ? "Loading AI response..." : "Temporary response",
            createdAt: new Date().toISOString(),
            replyTo: replyingTo
        };

        setComments(prev => [newComment, ...prev]);

        // Make the actual API call
        const response = await fetch('/api/blog-comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ content: input, role: 'user' }],
                postSlug,
                replyTo: replyingTo,
                isAiMention
            })
        });

        const data = await response.json();

        // Update with the real comment data
        setComments(prev => prev.map(comment =>
            comment.id === newComment.id ? data.comment : comment
        ));

        // Clear input and reply state
        handleInputChange('');
        setReplyingTo(null);
    };

    // Group comments by parent
    const parentComments = comments.filter(c => !c.replyTo);
    const repliesByParent = comments.reduce((acc, comment) => {
        if (comment.replyTo) {
            acc[comment.replyTo] = [...(acc[comment.replyTo] || []), comment];
        }
        return acc;
    }, {} as Record<string, BlogComment[]>);

    const CommentThread = ({ comment }: { comment: BlogComment }) => (
        <div className="border-b border-zinc-900 pb-6">
            <p className="text-gray-300 mb-2">{comment.userMessage}</p>
            {comment.aiResponse !== "Temporary response" && (
                <div className="ml-6 mt-4 p-4 bg-zinc-900 rounded-lg">
                    <p className="text-orange-400 font-medium mb-2">Eliza</p>
                    <p className="text-gray-300">{comment.aiResponse}</p>
                </div>
            )}
            <div className="flex items-center justify-between mt-4">
                <time className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                </time>
                <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-sm text-orange-400 hover:text-orange-300"
                >
                    Reply
                </button>
            </div>

            {/* Show replies */}
            {repliesByParent[comment.id]?.map(reply => (
                <div key={reply.id} className="ml-8 mt-4 border-l-2 border-gray-700 pl-4">
                    <p className="text-gray-300 mb-2">{reply.userMessage}</p>
                    {reply.aiResponse !== "Temporary response" && (
                        <div className="ml-6 mt-4 p-4 bg-gray-800 rounded-lg">
                            <p className="text-orange-400 font-medium mb-2">Eliza</p>
                            <p className="text-gray-300">{reply.aiResponse}</p>
                        </div>
                    )}
                    <time className="text-sm text-gray-500 block mt-2">
                        {new Date(reply.createdAt).toLocaleString()}
                    </time>
                </div>
            ))}

            {/* Reply form */}
            {replyingTo === comment.id && (
                <div className="mt-4 ml-8">
                    <TextareaWithActions
                        input={input}
                        onInputChange={handleInputChange}
                        onSubmit={handleCommentSubmit}
                        isLoading={isLoading}
                        placeholder="Reply to this comment... (use @Eliza to get AI response)"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="mt-8 border-t border-gray-700 pt-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Comments & Questions</h2>

            <div className="space-y-8">
                {/* New comment form */}
                {!replyingTo && (
                    <div className="rounded-lg bg-gray-800 ring-1 ring-gray-700">
                        <TextareaWithActions
                            input={input}
                            onInputChange={handleInputChange}
                            onSubmit={handleCommentSubmit}
                            isLoading={isLoading}
                            placeholder="Start a new discussion... (use @Eliza to get AI response)"
                        />
                    </div>
                )}

                {/* Comment threads */}
                {parentComments.map(comment => (
                    <CommentThread key={comment.id} comment={comment} />
                ))}
            </div>
        </div>
    );
} 