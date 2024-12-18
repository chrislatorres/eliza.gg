import { ImageGenerator } from "@/app/(app)/imagine/image-generator";
import { siteConfig } from "@/app/constants";
import { Metadata } from "next";
import { Suspense } from "react";

const pageTitle = "Imagine Eliza";
const pageDescription = "Imagine and generate unique images of Eliza.";
const pageImage = "/universe.jpg";

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
    url: `${siteConfig.url}/imagine`,
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
      <ImageGenerator />
    </Suspense>
  );
}
