import { LandingTextarea } from "@/components/app/landing-textarea";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";

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
      <Footer />
    </main>
  );
}
