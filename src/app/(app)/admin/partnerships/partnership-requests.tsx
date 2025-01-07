"use client";

import { Button } from "@/components/ui/button";
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
import { getPartnerships, type Partnership } from "./actions";

interface PartnershipsRequestsProps {
  initialData: Partnership[];
}

// Add interface for dialog state
interface DialogState {
  isOpen: boolean;
  partnership: Partnership | null;
}

export function PartnershipsRequests({
  initialData,
}: PartnershipsRequestsProps) {
  const { data: partnerships, mutate } = useSWR<Partnership[]>(
    "partnerships",
    getPartnerships,
    {
      fallbackData: initialData,
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  // Add state for dialog
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    partnership: null,
  });

  const generateCsv = (partnerships: Partnership[]): string => {
    const headers = [
      "Name",
      "Category",
      "Interests",
      "Contact Info",
      "Telegram Username",
      "Created At",
    ];
    const rows = partnerships.map((p) =>
      [
        p.name,
        p.category,
        p.interests,
        p.contactInfo,
        p.telegram_username || "",
        p["xata.createdAt"],
      ]
        .map((field) => `"${field?.replace(/"/g, '""')}"`)
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  };

  const handleExportCsv = () => {
    if (!partnerships) return;

    const csv = generateCsv(partnerships);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `partnerships-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex flex-col min-h-dvh pt-16">
      <div className="flex-1 relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Partnership Requests
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              A list of all {partnerships?.length} partnership requests
              submitted to the platform
            </p>
          </div>
          <Button onClick={handleExportCsv}>Export CSV</Button>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Interests</TableHeader>
              <TableHeader>Contact</TableHeader>
              <TableHeader>Telegram</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {partnerships?.map((partnership) => (
              <TableRow key={partnership.id}>
                <TableCell
                  className="max-w-[200px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, partnership })}
                >
                  {partnership.name}
                </TableCell>
                <TableCell
                  className="max-w-[150px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, partnership })}
                >
                  {partnership.category}
                </TableCell>
                <TableCell
                  className="max-w-[250px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, partnership })}
                >
                  {partnership.interests}
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, partnership })}
                >
                  {partnership.contactInfo}
                </TableCell>
                <TableCell
                  className="max-w-[150px] truncate cursor-pointer hover:text-orange-500"
                  onClick={() => setDialog({ isOpen: true, partnership })}
                >
                  {partnership.telegram_username || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog
          open={dialog.isOpen}
          onClose={() => setDialog({ isOpen: false, partnership: null })}
        >
          {dialog.partnership && (
            <>
              <DialogTitle className="pt-6 px-6">
                Partnership Details
              </DialogTitle>
              <DialogBody className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Name
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {dialog.partnership.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Category
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {dialog.partnership.category}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Interests
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {dialog.partnership.interests}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Contact Information
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {dialog.partnership.contactInfo}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      Telegram Username
                    </h3>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {dialog.partnership.telegram_username || "Not provided"}
                    </p>
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
