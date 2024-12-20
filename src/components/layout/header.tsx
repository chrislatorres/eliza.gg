import { Logo } from "@/components/ui/logo";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";

export function Header() {
  return (
    <header className="absolute md:fixed top-0 left-0 right-0 z-10">
      <nav className="flex items-center justify-between py-4 px-4">
        <div className="flex-1">
          <Link href="/">
            <Logo width={32} height={32} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center gap-8">
          <Link
            href="/explore"
            className={clsx([
              "text-sm font-medium",
              "text-zinc-500 hover:text-zinc-900",
              "dark:text-zinc-500 dark:hover:text-white",
              "transition-colors",
            ])}
          >
            Explore
          </Link>
          <Link
            href="/imagine"
            className={clsx([
              "text-sm font-medium",
              "text-zinc-500 hover:text-zinc-900",
              "dark:text-zinc-500 dark:hover:text-white",
              "transition-colors",
            ])}
          >
            Imagine
          </Link>
          <a
            href="https://ai16z.github.io/website/"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx([
              "text-sm font-medium",
              "text-zinc-500 hover:text-zinc-900",
              "dark:text-zinc-500 dark:hover:text-white",
              "transition-colors",
              "flex items-center gap-1",
            ])}
          >
            Bounties
            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </a>
          <a
            href="https://elizaos.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx([
              "text-sm font-medium",
              "text-zinc-500 hover:text-zinc-900",
              "dark:text-zinc-500 dark:hover:text-white",
              "transition-colors",
              "flex items-center gap-1",
            ])}
          >
            ElizaOS
            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </a>
        </div>

        <div className="flex-1" />
      </nav>
    </header>
  );
}
