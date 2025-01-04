import { siteConfig } from "@/app/constants";
import { inter } from "@/app/fonts";
import "@/app/globals.css";
import { ProgressBar } from "@/app/progress-bar";
import { Providers } from "@/app/providers";
import { Toaster } from "@/app/toaster";
import { Header } from "@/components/layout/header";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "white",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} - Learn about the Eliza Agent Framework`,
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    title: "The Documentation for Eliza",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    type: "website",
    url: siteConfig.url,
    locale: "en_US",
  },
  icons: siteConfig.icons,
  twitter: {
    card: "summary_large_image",
    site: siteConfig.name,
    title: "The Documentation for Eliza",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={inter.className}>
      <body className="min-h-dvh antialiased bg-white text-black scheme-light dark:bg-black dark:text-white dark:scheme-dark selection:!bg-[#fff0dd] dark:selection:!bg-[#3d2b15] overscroll-none">
        <div className="flex min-h-dvh w-full flex-col grow">
          <div className="flex grow flex-col size-full min-h-dvh">
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Providers>
                <Header />
                {children}
              </Providers>
            </ThemeProvider>
          </div>
        </div>
        <ProgressBar />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
