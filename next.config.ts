import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    ppr: true,
    inlineCss: true,
  },
  devIndicators: {
    buildActivityPosition: "bottom-right",
    appIsrStatus: false,
    buildActivity: false,
  },
  async redirects() {
    return [
      {
        source: "/start",
        destination: "https://ai16z.github.io/eliza/docs/intro/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path(.*)",
        destination: "https://us-assets.i.posthog.com/static/:path",
      },
      {
        source: "/ingest/:path(.*)",
        destination: "https://us.i.posthog.com/:path",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
