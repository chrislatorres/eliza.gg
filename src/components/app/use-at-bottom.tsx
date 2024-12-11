import { useEffect, useState } from "react";

export function useAtBottom(ref, offset = 0) {
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const { scrollTop, scrollHeight, clientHeight } = ref.current;
        setIsAtBottom(scrollHeight - scrollTop <= clientHeight + offset);
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleScroll);
      }
    };
  }, [ref, offset]);

  return isAtBottom;
}
