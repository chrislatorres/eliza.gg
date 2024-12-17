import { Chat } from "@/components/app/chat";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Chat />
    </Suspense>
  );
}
