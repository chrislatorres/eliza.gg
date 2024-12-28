import { siteConfig } from "@/app/constants";
import { Metadata } from "next";
import { Suspense } from "react";
import { getPartnerships } from "./actions";
import { PartnershipsRequests } from "./partnership-requests";

const pageTitle = "Partnership Program";
const pageDescription =
  "Submit your partnership or collaboration request for the Eliza ecosystem.";
const pageImage = "/partnerships.jpg";

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
    url: `${siteConfig.url}/partnerships`,
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

function LoadingPartnershipRequests() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-medium">
          Loading partnership requests...
        </div>
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Please wait while we fetch the latest data
        </div>
      </div>
    </div>
  );
}

async function PartnershipRequestsWrapper() {
  const initialData = await getPartnerships();
  return <PartnershipsRequests initialData={initialData} />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingPartnershipRequests />}>
      <PartnershipRequestsWrapper />
    </Suspense>
  );
}
