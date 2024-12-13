import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    ppr: "incremental",
    inlineCss: true,
  },
  devIndicators: {
    buildActivityPosition: "bottom-right",
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
