import { basicSetup } from "@/components/app/basic-setup";
import "@/styles/editor.css";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { drawSelection } from "@codemirror/view";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "codemirror";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export function CodeBlock({ className, children }) {
  const language = className?.replace("lang-", "");
  const [copySuccess, setCopySuccess] = useState("");
  const { resolvedTheme } = useTheme();
  const [element, setElement] = useState<HTMLElement>();

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    setElement(node);
  }, []);

  useEffect(() => {
    if (children.includes("\n")) {
      const trimmedContent = children.trimEnd();

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
    }
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
      <div className="read-only-editor w-full bg-white dark:bg-zinc-950 rounded-md overflow-hidden max-w-full min-w-full">
        <div className="bg-zinc-100 dark:bg-zinc-900 flex items-center px-4 text-xs font-sans py-2 text-zinc-600">
          <span>{language}</span>
          <div className="ml-auto flex items-center">
            <button
              className="flex gap-1 cursor-pointer items-center"
              onClick={copyToClipboard}
            >
              {copySuccess ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>{copySuccess}</span>
                </>
              ) : (
                <>
                  <ClipboardIcon className="w-4 h-4" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="py-4 code-block">
          <div ref={ref} />
        </div>
      </div>
    </div>
  ) : (
    <code className="rounded-[0.375rem] border bg-gray-100 dark:bg-zinc-900 px-[0.25rem] py-[0.15rem] font-mono text-xs font-normal before:hidden after:hidden border-zinc-950/5 dark:border-white/5">
      {children}
    </code>
  );
}
