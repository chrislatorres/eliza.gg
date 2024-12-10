"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export const TextareaWithActions = () => {
  const [value, setValue] = useState("");
  return (
    <span
      data-slot="control"
      className={clsx([
        "relative block w-full",
        "dark:before:hidden",
        "before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none",
      ])}
    >
      <div
        className={clsx([
          "relative block size-full appearance-none overflow-hidden rounded-lg",
          "text-base/6 text-zinc-950 placeholder:text-zinc-400 sm:text-sm/6 dark:text-white",
          "bg-zinc-50 dark:bg-white/5",
          "focus:outline-none",
          "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-600 data-[invalid]:data-[hover]:dark:border-red-600",
          "disabled:border-zinc-950/20 disabled:dark:border-white/15 disabled:dark:bg-white/[2.5%] dark:data-[hover]:disabled:border-white/15",
          "ring-offset-background",
          "focus-within:ring focus-within:dark:ring-white/15 focus-within:ring-zinc-950/15",
          "border dark:border-white/5",
        ])}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative min-h-[36px] w-full">
            <textarea
              aria-label="Prompt"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask anything..."
              className={clsx([
                "size-full bg-transparent",
                "relative block size-full appearance-none",
                "placeholder:text-zinc-500",
                "resize-none",
                "focus:outline-none",
                "scrollbar scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full scrollbar-w-[4px]",
                "text-base/6 sm:text-sm/6",
                "border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0",
                "p-0 px-4 pt-3",
                // Auto-resize using field-sizing
                "field-sizing-content resize-none",
                "scrollbar-thin scrollbar-thumb-rounded-md",
              ])}
            />
          </div>
          <div className="flex w-full items-center justify-between px-2 pb-2.5">
            <div />
            <Button
              color={(value ? "orange" : "dark") as "orange" | "dark"}
              disabled={!value}
              aria-label="Submit"
              className={clsx(
                "size-8"
                // "!rounded-full before:!rounded-full after:!rounded-full dark:after:!rounded-full"
                // "transition-all duration-50 ease-in-out"
              )}
            >
              {false ? (
                <Loader2 className="h-6 w-3 animate-spin" />
              ) : (
                <ArrowRightIcon className="!h-3 !w-3 !shrink-0" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </span>
  );
};
