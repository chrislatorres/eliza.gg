"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <AppProgressBar
      height="1px"
      color="#6366f1"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
