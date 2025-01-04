"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
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
      <a
        href="https://eliza.gg/eliza/"
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
        Docs
        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
      </a>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-black">
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
              href="https://eliza.gg/discord"
              target="_blank"
            >
              Join Discord
            </Button>
          </div>
        </div>
      </nav>

      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
        variant="slideout"
      >
        <div className="px-6 py-6 h-full">
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
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                color="orange"
                href="https://eliza.gg/discord"
                target="_blank"
                className="w-full justify-center text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Discord
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
