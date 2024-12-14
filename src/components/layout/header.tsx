import { Logo } from "@/components/ui/logo";
import clsx from "clsx";
import Link from "next/link";

export function Header() {
  return (
    <header className="absolute md:fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-8 z-10">
      <Link href="/">
        <Logo width={32} height={32} />
      </Link>
      <Link
        href="/explore"
        className={clsx([
          "text-sm font-medium",
          "text-zinc-500 hover:text-zinc-900",
          "dark:text-zinc-400 dark:hover:text-white",
          "transition-colors",
        ])}
      >
        Explore
      </Link>
    </header>
  );
}
