"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function ChatScrollAnchor({
  trackVisibility = true,
}: {
  trackVisibility?: boolean;
}) {
  const { ref, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: "0px 0px -150px 0px",
  });

  useEffect(() => {
    if (!inView) {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (isNearBottom) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "instant",
        });
      }
    }
  }, [inView]);

  return <div ref={ref} className="h-px w-full" />;
}
