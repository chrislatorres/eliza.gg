"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface TokenAllocation {
  id: string;
  githubUsername: string;
  tokenSymbol: string;
  amount: number;
  claimed: boolean;
}

type GithubProvider = "oauth_github" | "github" | string;

export default function ClaimPage() {
  const { user } = useUser();
  const [allocations, setAllocations] = useState<TokenAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      const githubAccount = user?.externalAccounts.find(
        (account) => (account.provider as GithubProvider) === "oauth_github"
      );

      if (!githubAccount?.username) return;

      try {
        const response = await fetch(
          `/api/admin/allocations?username=${githubAccount.username}`
        );
        const data = await response.json();
        setAllocations(data);
      } catch (error) {
        console.error("Failed to fetch allocations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllocations();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (
    !user?.externalAccounts.some(
      (a) => (a.provider as GithubProvider) === "oauth_github"
    )
  ) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect GitHub Account</h1>
          <p className="mb-4">
            Please connect your GitHub account to claim your tokens.
          </p>
          <Button>Connect GitHub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Token Allocations</h1>

      {allocations.length === 0 ? (
        <p>No tokens allocated yet.</p>
      ) : (
        <div className="space-y-4">
          {allocations.map((allocation) => (
            <div
              key={allocation.id}
              className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {allocation.amount} {allocation.tokenSymbol}
                  </div>
                  <div className="text-sm text-zinc-500">
                    Allocated to: {allocation.githubUsername}
                  </div>
                </div>
                <Button disabled={allocation.claimed}>
                  {allocation.claimed ? "Claimed" : "Claim"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
