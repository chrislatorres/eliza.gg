import { Chat } from "@/components/app/chat";
import { Suspense } from "react";

export const experimental_ppr = true;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  );
}
