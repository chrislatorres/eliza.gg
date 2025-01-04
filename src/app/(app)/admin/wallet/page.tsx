import { Wallet } from "@/app/(app)/admin/wallet/wallet";
import { siteConfig } from "@/app/constants";
import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const pageTitle = "Admin Wallet";
const pageDescription = "Admin view of the Eliza wallet.";
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

export default async function Page() {
  const { userId } = await auth();

  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    return redirect("/");
  }

  return (
    <Suspense fallback={null}>
      <Wallet />
    </Suspense>
  );
}
