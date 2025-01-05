export function USDCIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none">
      <circle cx="64" cy="64" r="64" fill="#2775CA" />
      <path
        d="M64 25.6c-21.2 0-38.4 17.2-38.4 38.4S42.8 102.4 64 102.4s38.4-17.2 38.4-38.4S85.2 25.6 64 25.6zM56.7 80.5c0 1.8-1.4 2.8-3.2 2.8-1.8 0-3.2-1-3.2-2.8V47.5c0-1.8 1.4-2.8 3.2-2.8 1.8 0 3.2 1 3.2 2.8v33zm21.8 0c0 1.8-1.4 2.8-3.2 2.8-1.8 0-3.2-1-3.2-2.8V47.5c0-1.8 1.4-2.8 3.2-2.8 1.8 0 3.2 1 3.2 2.8v33z"
        fill="white"
      />
    </svg>
  );
}
