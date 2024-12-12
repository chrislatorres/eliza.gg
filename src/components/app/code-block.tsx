import { basicSetup } from "@/components/app/basic-setup";
import "@/styles/editor.css";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { sql } from "@codemirror/lang-sql";
import { StreamLanguage } from "@codemirror/language";
import { shell as shellMode } from "@codemirror/legacy-modes/mode/shell";
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
    return className?.replace("lang-", "") || "";
  }, [children, className]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  const getLanguageExtension = useCallback((lang: string) => {
    switch (lang.toLowerCase()) {
      case "javascript":
      case "js":
        return javascript();
      case "typescript":
      case "ts":
        return javascript({ typescript: true });
      case "jsx":
        return javascript({ jsx: true });
      case "tsx":
        return javascript({ typescript: true, jsx: true });
      case "json":
        return json();
      case "bash":
      case "shell":
      case "sh":
        return StreamLanguage.define(shellMode);
      case "css":
        return css();
      case "html":
        return html();
      case "markdown":
      case "md":
        return markdown();
      case "sql":
        return sql();
      default:
        return javascript(); // fallback to javascript
    }
  }, []);

  useEffect(() => {
    if (!children.includes("\n")) return;

    let trimmedContent = children.trimEnd();

    const state = EditorState.create({
      doc: trimmedContent,
      extensions: [
        basicSetup,
        getLanguageExtension(language),
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
  }, [children, element, resolvedTheme, language, getLanguageExtension]);

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
        <div className="bg-zinc-100 dark:bg-zinc-900 flex items-center pl-4 pr-2 text-xs font-sans py-1 text-zinc-500 border-b border-zinc-950/5 dark:border-white/5">
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
