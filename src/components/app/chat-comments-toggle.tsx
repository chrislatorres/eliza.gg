"use client";

interface ChatCommentsToggleProps {
    mode: 'chat' | 'comments';
    onToggle: (mode: 'chat' | 'comments') => void;
}

export function ChatCommentsToggle({ mode, onToggle }: ChatCommentsToggleProps) {
    return (
        <div className="flex space-x-1 bg-zinc-900 p-1 rounded-lg">
            <button
                onClick={() => onToggle('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'chat'
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:text-white"
                    }`}
            >
                Chat
            </button>
            <button
                onClick={() => onToggle('comments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'comments'
                    ? "bg-orange-500 text-white"
                    : "text-gray-400 hover:text-white"
                    }`}
            >
                Comments
            </button>
        </div>
    );
} 