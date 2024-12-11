import { inter } from "@/app/fonts";
import "@/app/globals.css";
import { ProgressBar } from "@/app/progress-bar";
import { Toaster } from "@/app/toaster";
import { Header } from "@/components/layout/header";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "white",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://eliza.gg"),
  title: "Eliza.gg - The Documentation for Eliza",
  description:
    "Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents.",
  openGraph: {
    siteName: "Eliza.gg",
    title: "The Documentation for Eliza",
    description:
      "Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents.",
    images: ["/api/og"],
    type: "website",
    url: "https://eliza.gg",
    locale: "en_US",
  },
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/eliza-black.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      type: "image/png",
      url: "/eliza-white.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
  twitter: {
    card: "summary_large_image",
    site: "Eliza.gg",
    title: "The Documentation for Eliza",
    description:
      "Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents.",
    images: ["/api/og"],
    creator: "@chrislatorres",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={inter.className}>
      <body className="min-h-dvh antialiased bg-white text-black scheme-light dark:bg-black dark:text-white dark:scheme-dark selection:bg-[#ff8c00]/25 overscroll-none">
        <div className="flex min-h-dvh w-full flex-col grow">
          <div className="flex grow flex-col size-full min-h-dvh">
            <Header />
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </div>
        </div>
        <ProgressBar />
        <Toaster />
      </body>
    </html>
  );
}
