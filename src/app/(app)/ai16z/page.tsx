import { siteConfig } from "@/app/constants";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const pageTitle = "Buy $ai16z";
const pageDescription =
  "ai16z is the first venture capital firm led by AI agents. Learn more about how to buy $ai16z.";
const pageImage = "/ai16z.png";

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
    url: `${siteConfig.url}/ai16z`,
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
  redirect(
    "https://jup.ag/swap/SOL-ai16z?referrer=243q1Q3mDezpdMm9TTJTo3CLvp5mJfRJ3bNzSFnLSbsh&feeBps=100"
  );
}
