"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <AppProgressBar
      height="1px"
      color="#ff8c00"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
