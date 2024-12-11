import { LandingTextarea } from "@/components/app/landing-textarea";
import Link from "next/link";
import { Suspense } from "react";

export const experimental_ppr = true;

export default function Page() {
  return (
    <main className="flex-1 size-full overflow-hidden flex flex-col justify-center items-center">
      <div className="flex-1 size-full overflow-hidden flex flex-col justify-center items-center gap-8 px-4 md:px-0">
        <h1 className="text-3xl xl:text-4xl font-semibold text-center tracking-tighter text-pretty">
          Ask anything about Eliza
        </h1>
        <div className="max-w-xl mx-auto w-full">
          <Suspense fallback={null}>
            <LandingTextarea />
          </Suspense>
        </div>
      </div>
      <p className="mt-auto text-center text-xs text-zinc-400 dark:text-zinc-600 mb-2">
        By messaging, you agree to our{" "}
        <Link href="/terms" className="underline" target="_blank">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline" target="_blank">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
