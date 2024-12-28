"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import {
  getPartnerships,
  updatePartnershipStatus,
  type Partnership,
} from "./actions";

export function PartnershipsRequests() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartnerships = async () => {
      try {
        const data = await getPartnerships();
        setPartnerships(data);
      } catch (error) {
        console.error("Failed to load partnerships:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPartnerships();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updatePartnershipStatus(id, status);
    const data = await getPartnerships();
    setPartnerships(data);
  };

  if (loading) {
    return (
      <main className="flex flex-col min-h-dvh">
        <div className="flex-1 relative mx-auto w-full max-w-7xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-dvh">
      <div className="flex-1 relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Partnership Requests
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A list of all partnership requests submitted to the platform
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:pl-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Interests
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Submitted
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-black">
                {partnerships.map((partnership) => (
                  <tr key={partnership.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 sm:pl-6">
                      {partnership.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {partnership.category}
                    </td>
                    <td className="px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {partnership.interests}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {partnership.contactInfo}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDistanceToNow(
                        new Date(partnership["xata.createdAt"]),
                        {
                          addSuffix: true,
                        }
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <select
                        value={partnership.status}
                        onChange={(e) =>
                          handleStatusChange(partnership.id, e.target.value)
                        }
                        className="rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:ring-zinc-500 dark:focus:ring-zinc-400 focus:border-zinc-500 dark:focus:border-zinc-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
