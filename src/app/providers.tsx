"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { fal } from "@fal-ai/client";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      <PostHogProvider client={posthog}>{children}</PostHogProvider>
    </ClerkProvider>
  );
}
