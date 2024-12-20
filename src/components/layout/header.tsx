"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Dialog, DialogPanel } from "@headlessui/react";
import {
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        href="/explore"
        className={clsx(
          "text-sm font-medium",
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        Explore
      </Link>
      <Link
        href="/imagine"
        className={clsx(
          "text-sm font-medium",
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        Imagine
      </Link>
      <a
        href="https://elizagen.howieduhzit.best/"
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "text-sm font-medium flex items-center gap-1",
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        Generator
        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
      </a>
      <a
        href="https://ai16z.github.io/website/"
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "text-sm font-medium flex items-center gap-1",
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        Bounties
        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
      </a>
      <a
        href="https://elizaos.ai"
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "text-sm font-medium flex items-center gap-1",
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        ElizaOS
        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
      </a>
    </>
  );

  return (
    <header className="absolute md:fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-black/80">
      <nav className="px-4 lg:px-6" aria-label="Global">
        <div className="flex items-center justify-between py-4">
          <div className="flex">
            <Link href="/" className="-m-1.5 p-1.5">
              <Logo width={32} height={32} />
            </Link>
          </div>

          <div className="hidden md:flex md:gap-x-4 lg:gap-x-8 md:ml-8">
            <NavLinks />
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-zinc-700 dark:text-zinc-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-end">
            <Button
              color="orange"
              href="https://jup.ag/swap/SOL-ai16z?referrer=243q1Q3mDezpdMm9TTJTo3CLvp5mJfRJ3bNzSFnLSbsh&feeBps=100"
              target="_blank"
            >
              Buy $ai16z
            </Button>
          </div>
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-zinc-900/10 dark:sm:ring-white/10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="-m-1.5 p-1.5"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Logo width={32} height={32} />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-zinc-700 dark:text-zinc-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="space-y-2 py-6">
              <NavLinks mobile />
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
