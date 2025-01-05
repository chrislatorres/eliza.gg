export function SolanaIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none">
      <circle cx="64" cy="64" r="64" fill="#000000" />
      <path
        d="M42.4 82.8c0.6-0.6 1.4-1 2.2-1h64.1c1.4 0 2.1 1.7 1.1 2.7l-14.3 14.3c-0.6 0.6-1.4 1-2.2 1H29.2c-1.4 0-2.1-1.7-1.1-2.7l14.3-14.3z"
        fill="url(#paint0_linear)"
      />
      <path
        d="M42.4 29.2c0.6-0.6 1.4-1 2.2-1h64.1c1.4 0 2.1 1.7 1.1 2.7l-14.3 14.3c-0.6 0.6-1.4 1-2.2 1H29.2c-1.4 0-2.1-1.7-1.1-2.7l14.3-14.3z"
        fill="url(#paint1_linear)"
      />
      <path
        d="M93.3 55.9c-0.6-0.6-1.4-1-2.2-1H27c-1.4 0-2.1 1.7-1.1 2.7l14.3 14.3c0.6 0.6 1.4 1 2.2 1h64.1c1.4 0 2.1-1.7 1.1-2.7L93.3 55.9z"
        fill="url(#paint2_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="29.5"
          y1="89.8"
          x2="109.5"
          y2="89.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="29.5"
          y1="36.2"
          x2="109.5"
          y2="36.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="29.5"
          y1="63"
          x2="109.5"
          y2="63"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#00FFA3" />
          <stop offset="1" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
