import { inter } from "@/app/fonts";
import "@/app/globals.css";
import { ProgressBar } from "@/app/progress-bar";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "white",
};

export const metadata: Metadata = {
  title: "Eliza Documentation",
  description:
    "Eliza is a powerful multi-agent simulation framework designed to create, deploy, and manage autonomous AI agents.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className={inter.className}>
      <body className="min-h-dvh antialiased bg-black text-white scheme-dark dark">
        <div className="flex min-h-dvh w-full flex-col grow">
          <div className="flex grow flex-col size-full min-h-dvh">
            {children}
          </div>
        </div>
        <ProgressBar />
      </body>
    </html>
  );
}
