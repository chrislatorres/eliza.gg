import { siteConfig } from "@/app/constants";
import { Metadata } from "next";
import { Suspense } from "react";
import { PartnershipsForm } from "./partnerships-form";

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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PartnershipsForm />
    </Suspense>
  );
}
