import { siteConfig } from "@/app/constants";
import { Metadata } from "next";
import { Suspense } from "react";
import { getLogs } from "./actions";
import { Logs } from "./logs";

const pageTitle = "AI Chat Logs";
const pageDescription = "View the AI chat logs of the platform.";
const pageImage = "/ai-logs.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    siteName: siteConfig.name,
    title: pageTitle,
    description: pageDescription,
    images: [pageImage],
    type: "website",
    url: `${siteConfig.url}/admin/logs`,
    locale: "en_US",
  },
  icons: siteConfig.icons,
  twitter: {
    card: "summary_large_image",
    site: siteConfig.name,
    title: pageTitle,
    description: pageDescription,
    images: [pageImage],
    creator: siteConfig.creator,
  },
};

function LoadingLogs() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-medium">Loading AI chat logs...</div>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Please wait while we fetch the latest data
        </div>
      </div>
    </div>
  );
}

async function LogsWrapper() {
  const initialData = await getLogs();
  return <Logs initialData={initialData} />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingLogs />}>
      <LogsWrapper />
    </Suspense>
  );
}
