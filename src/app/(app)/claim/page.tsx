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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);

      console.log(user?.externalAccounts);
      const githubAccount = user?.externalAccounts.find(
        (account) => (account.provider as GithubProvider) === "github"
      );

      if (!githubAccount?.username) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/allocations?username=${githubAccount.username}`
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAllocations(data);
      } catch (error) {
        console.error("Failed to fetch allocations:", error);
        setError(
          "Failed to load your token allocations. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAllocations();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="pt-24">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-zinc-400"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-zinc-400"></div>
            <div className="w-4 h-4 rounded-full animate-pulse bg-zinc-400"></div>
          </div>
          <p className="text-center mt-4 text-zinc-500">
            Loading your allocations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24">
        <div className="max-w-lg mx-auto">
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24">
        <div className="max-w-lg mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="mb-4">
              Please sign in to view your token allocations.
            </p>
            <Button>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !user?.externalAccounts.some(
      (a) => (a.provider as GithubProvider) === "github"
    )
  ) {
    return (
      <div className="pt-24">
        <div className="max-w-lg mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Connect GitHub Account</h1>
            <p className="mb-4">
              Please connect your GitHub account to claim your tokens.
            </p>
            <Button>Connect GitHub</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="max-w-lg mx-auto">
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
    </div>
  );
}
