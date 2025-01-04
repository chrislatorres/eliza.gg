"use client";

import { SignUp } from "@clerk/nextjs";
import clsx from "clsx";

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center">
        <SignUp
          appearance={{
            layout: {
              unsafe_disableDevelopmentModeWarnings: true,
            },
            elements: {
              formFieldCheckboxInput: clsx([
                "relative isolate flex size-[1.125rem] items-center justify-center rounded-[0.3125rem] sm:size-4",
                // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
                "before:absolute before:inset-0 before:-z-10 before:rounded-[calc(0.3125rem-1px)] before:bg-white before:shadow",
                // Background color when checked
                "before:group-data-[checked]:bg-[--checkbox-checked-bg]",
                // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
                "dark:before:hidden",
                // Background color applied to control in dark mode
                "dark:bg-white/5 dark:group-data-[checked]:bg-[--checkbox-checked-bg]",
                // Border
                "border border-zinc-950/15 group-data-[checked]:border-transparent group-data-[checked]:group-data-[hover]:border-transparent group-data-[hover]:border-zinc-950/30 group-data-[checked]:bg-[--checkbox-checked-border]",
                "dark:border-white/15 dark:group-data-[checked]:border-white/5 dark:group-data-[checked]:group-data-[hover]:border-white/5 dark:group-data-[hover]:border-white/30",
                // Inner highlight shadow
                "after:absolute after:inset-0 after:rounded-[calc(0.3125rem-1px)] after:shadow-[inset_0_1px_theme(colors.white/15%)]",
                "dark:after:-inset-px dark:after:hidden dark:after:rounded-[0.3125rem] dark:group-data-[checked]:after:block",
                // Focus ring
                "group-data-[focus]:outline group-data-[focus]:outline-2 group-data-[focus]:outline-offset-2 group-data-[focus]:outline-indigo-500",
                // Disabled state
                "group-data-[disabled]:opacity-50",
                "group-data-[disabled]:border-zinc-950/25 group-data-[disabled]:bg-zinc-950/5 group-data-[disabled]:[--checkbox-check:theme(colors.zinc.950/50%)] group-data-[disabled]:before:bg-transparent",
                "dark:group-data-[disabled]:border-white/20 dark:group-data-[disabled]:bg-white/[2.5%] dark:group-data-[disabled]:[--checkbox-check:theme(colors.white/50%)] dark:group-data-[disabled]:group-data-[checked]:after:hidden",
                // Forced colors mode
                "forced-colors:[--checkbox-check:HighlightText] forced-colors:[--checkbox-checked-bg:Highlight] forced-colors:group-data-[disabled]:[--checkbox-check:Highlight]",
                "dark:forced-colors:[--checkbox-check:HighlightText] dark:forced-colors:[--checkbox-checked-bg:Highlight] dark:forced-colors:group-data-[disabled]:[--checkbox-check:Highlight]",
              ]),
              card: "!bg-transparent !shadow-none !border-none",
              cardBox: "!bg-transparent !shadow-none !border-none",
              footer: "!bg-transparent !bg-none !shadow-none !border-none",
              footerAction:
                "!bg-transparent !bg-none !shadow-none !border-none",
              // header: "hidden",
              formFieldCheckboxLabel: "text-zinc-500 !text-[12px]",
            },
          }}
        />
      </div>
    </div>
  );
}
