import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 px-2 py-2 md:px-4 w-full flex">
      <div className="mx-auto flex w-full justify-between items-center">
        <div className="text-xs text-zinc-400 dark:text-zinc-600"></div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
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

        <div className="text-xs text-zinc-400 dark:text-zinc-600">
          Created by{" "}
          <a
            href="https://x.com/chrislatorres"
            className="underline"
            target="_blank"
            rel="noopener"
          >
            @chrislatorres
          </a>
        </div>
      </div>
    </footer>
  );
}
