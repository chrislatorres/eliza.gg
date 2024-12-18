"use client";

import { fal } from "@fal-ai/client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always",
  });
}

export function Providers({ children }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
