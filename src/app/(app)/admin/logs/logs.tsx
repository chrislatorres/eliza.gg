"use client";

import { CodeBlock } from "@/components/app/code-block";
import { MemoizedMarkdown } from "@/components/app/memoized-markdown";
import { Dialog, DialogBody, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import useSWR from "swr";
import { getLogs, type AILog } from "./actions";

interface LogsProps {
  initialData: AILog[];
}

interface DialogState {
  isOpen: boolean;
  log: AILog | null;
}

export function Logs({ initialData }: LogsProps) {
  const { data: logs } = useSWR<AILog[]>("ai_logs", getLogs, {
    fallbackData: initialData,
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    log: null,
  });

  const markdownOptions = {
    forceBlock: true,
    overrides: {
      code: {
        component: CodeBlock,
      },
      reference: {
        component: ({ children }) => {
          return (
            <span className="inline-flex items-center justify-center text-[#ff8c00]">
              [{children}]
            </span>
          );
        },
      },
    },
  };

  return (
    <main className="flex flex-col min-h-dvh pt-16">
      <div className="flex-1 relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            AI Chat Logs
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A list of all AI chat interactions on the platform
          </p>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Time</TableHeader>
              <TableHeader>User Message</TableHeader>
              <TableHeader>AI Response</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell
                  className="cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, log })}
                >
                  {new Date(log["xata.createdAt"]).toLocaleString()}
                </TableCell>
                <TableCell
                  className="max-w-[300px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, log })}
                >
                  {log.userMessage}
                </TableCell>
                <TableCell
                  className="max-w-[300px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, log })}
                >
                  {log.aiResponse}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog
          open={dialog.isOpen}
          onClose={() => setDialog({ isOpen: false, log: null })}
        >
          {dialog.log && (
            <>
              <DialogTitle className="pt-6 px-6">Chat Log Details</DialogTitle>
              <DialogBody className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Time
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {new Date(dialog.log["xata.createdAt"]).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      User Message
                    </h3>
                    <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                      <MemoizedMarkdown
                        content={dialog.log.userMessage}
                        id={`user-${dialog.log.id}`}
                        options={markdownOptions}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      AI Response
                    </h3>
                    <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                      <MemoizedMarkdown
                        content={dialog.log.aiResponse}
                        id={dialog.log.id}
                        options={markdownOptions}
                      />
                    </div>
                  </div>
                </div>
              </DialogBody>
            </>
          )}
        </Dialog>
      </div>
    </main>
  );
}
