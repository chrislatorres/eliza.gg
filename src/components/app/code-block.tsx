import { basicSetup } from "@/components/app/basic-setup";
import "@/styles/editor.css";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { drawSelection } from "@codemirror/view";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import clsx from "clsx";
import { EditorView } from "codemirror";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";

export function CodeBlock({ className, children }) {
  const [copySuccess, setCopySuccess] = useState("");
  const { resolvedTheme } = useTheme();
  const [element, setElement] = useState<HTMLElement>();

  const language = useMemo(() => {
    if (children?.startsWith?.("javascript\n")) {
      return "javascript";
    }
    return className?.replace("lang-", "") || "";
  }, [children, className]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  useEffect(() => {
    if (!children.includes("\n")) return;

    let trimmedContent = children;

    const state = EditorState.create({
      doc: trimmedContent,
      extensions: [
        basicSetup,
        javascript(),
        EditorView.lineWrapping,
        EditorView.editable.of(false),
        resolvedTheme === "dark" ? githubDark : githubLight,
        drawSelection({
          drawRangeCursor: false,
          cursorBlinkRate: -9999,
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: element,
    });

    return () => {
      view?.destroy();
    };
  }, [children, element, resolvedTheme]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children.trim());
      setCopySuccess("Copied!");

      setTimeout(() => {
        setCopySuccess("");
      }, 500);
    } catch (err) {
      setCopySuccess("Failed to copy.");
    }
  };

  return children.includes("\n") ? (
    <div className="not-prose">
      <div className="read-only-editor w-full bg-zinc-50 dark:bg-zinc-950 rounded-md overflow-hidden max-w-full min-w-full border border-zinc-950/5 dark:border-white/5">
        <div className="bg-zinc-100 dark:bg-zinc-900 flex items-center pl-4 pr-2 text-xs font-sans py-2 text-zinc-500 border-b border-zinc-950/5 dark:border-white/5">
          <span>{language}</span>
          <div className="ml-auto">
            <button
              className={clsx([
                "flex gap-1 cursor-pointer items-center",
                // Base
                "relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-base/6 font-semibold",
                // Sizing
                "px-1 py-1",
                // Base
                "border-transparent hover:bg-zinc-950/5",
                // Dark mode
                "dark:hover:bg-white/10",
              ])}
              onClick={copyToClipboard}
            >
              {copySuccess ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="py-2 code-block">
          <div ref={ref} />
        </div>
      </div>
    </div>
  ) : (
    <code className="rounded-[0.375rem] border bg-zinc-100 dark:bg-zinc-900 px-[0.25rem] py-0.5 font-mono text-xs font-normal before:hidden after:hidden border-zinc-950/5 dark:border-white/5 my-0.5">
      {children}
    </code>
  );
}
