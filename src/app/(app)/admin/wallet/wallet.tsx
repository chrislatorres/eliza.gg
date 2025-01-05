"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import useSWR from "swr";
import type { Token } from "./types";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const data = await res.json();
    (error as any).status = res.status;
    (error as any).info = data;
    throw error;
  }
  return res.json();
};

interface Allocation {
  id: string;
  githubUsername: string;
  tokenSymbol: string;
  amount: number;
  claimed: boolean;
  claimedAt: string | null;
  claimTransaction: string | null;
}

const TOKENS: Token[] = [
  {
    symbol: "AI16Z",
    mint: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
    decimals: 9,
    icon: "https://assets.coingecko.com/coins/images/51090/standard/AI16Z.jpg",
    balance: null,
  },
];

export function WalletDetails() {
  const [walletAddress] = useState<string>(
    "HXUCCS91dKLkFSBBVN61spjZYMi6VLGmE6qxMyqXURQK"
  );
  const [copied, setCopied] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState(false);
  const [selectedToken] = useState<Token>(TOKENS[0]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [ai16zBalance, setAi16zBalance] = useState<number | null>(null);
  const [ai16zPrice, setAi16zPrice] = useState<number | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);

  const { data: balance, error: balanceError } = useSWR(
    walletAddress ? `/api/admin/wallet?address=${walletAddress}` : null,
    fetcher
  );

  const { data: allocationData } = useSWR<Allocation[]>(
    "/api/admin/allocations",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  useEffect(() => {
    if (allocationData) {
      setAllocations(allocationData);
    }
  }, [allocationData]);

  const handleCopy = async () => {
    const success = await copyToClipboard(walletAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAllocateTokens = async (
    githubUsername: string,
    amount: number
  ) => {
    try {
      const response = await fetch("/api/admin/allocations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUsername,
          tokenSymbol: selectedToken.symbol,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to allocate tokens");
      }

      // Refresh allocations
      const newAllocation = await response.json();
      setAllocations((prev) => [newAllocation, ...prev]);

      setAllocationSuccess(true);
      setTimeout(() => setAllocationSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to allocate tokens:", error);
      throw error;
    }
  };

  const fetchBalances = async () => {
    try {
      const connection = new Connection(
        "https://red-weathered-theorem.solana-mainnet.quiknode.pro/bcebff344bdf1b96bb92ffd2a9fc1281ad16d7f3"
      );
      const senderPublicKey = new PublicKey(walletAddress);

      // Fetch SOL balance
      const solBalance = await connection.getBalance(senderPublicKey);
      setSolBalance(solBalance / 1e9);

      // Fetch prices for both SOL and AI16Z
      const priceResponse = await fetch("/api/prices?ids=solana,ai16z");
      if (!priceResponse.ok) {
        throw new Error("Failed to fetch token prices");
      }
      const priceData = await priceResponse.json();
      setSolPrice(priceData?.solana?.usd || null);
      setAi16zPrice(priceData?.ai16z?.usd || null);

      // Fetch AI16Z balance
      const AI16Z_MINT = new PublicKey(
        "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC"
      );
      const ai16zATA = await getAssociatedTokenAddress(
        AI16Z_MINT,
        senderPublicKey
      );

      try {
        const accountInfo = await connection.getAccountInfo(ai16zATA);
        if (accountInfo) {
          const ai16zAccountInfo = await connection.getTokenAccountBalance(
            ai16zATA
          );
          setAi16zBalance(Number(ai16zAccountInfo.value.uiAmount));
        } else {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            senderPublicKey,
            { mint: AI16Z_MINT }
          );
          if (tokenAccounts.value.length > 0) {
            const balance =
              tokenAccounts.value[0].account.data.parsed.info.tokenAmount
                .uiAmount;
            setAi16zBalance(Number(balance));
          } else {
            setAi16zBalance(0);
          }
        }
      } catch (e) {
        console.error("Error fetching AI16Z balance:", e);
        setAi16zBalance(0);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [walletAddress, balance]);

  if (balanceError?.status === 401) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          Please sign in to access this page
        </div>
      </div>
    );
  }

  if (balanceError?.status === 403) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          You don't have permission to access this page
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Wallet details and allocation form */}
        <div className="space-y-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Treasury Wallet:
            </h3>
            <div className="flex items-center gap-2">
              <p className="break-all text-zinc-700 dark:text-zinc-300">
                {walletAddress}
              </p>
              <Button onClick={handleCopy} title="Copy to clipboard" plain>
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <ClipboardDocumentIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Balances
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://assets.coingecko.com/coins/images/4128/small/solana.png"
                    alt="Solana"
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        Solana
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {solBalance !== null
                        ? `${solBalance.toFixed(6)} SOL`
                        : "Loading..."}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {solBalance !== null && solPrice !== null
                      ? `$${(solBalance * solPrice).toFixed(2)}`
                      : "..."}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
                    alt="USDC"
                    className="w-8 h-8"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        USDC
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {balance ? `${balance.balance} USDC` : "Loading..."}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    ${balance ? Number(balance.balance).toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="https://assets.coingecko.com/coins/images/51090/standard/AI16Z.jpg"
                    alt="AI16Z"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        AI16Z
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {ai16zBalance !== null
                        ? `${ai16zBalance.toLocaleString()} AI16Z`
                        : "Loading..."}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {ai16zBalance !== null && ai16zPrice !== null
                      ? `$${(ai16zBalance * ai16zPrice).toFixed(2)}`
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Allocate Tokens
            </h3>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsAllocating(true);
                try {
                  await handleAllocateTokens(githubUsername, Number(amount));
                  setGithubUsername("");
                  setAmount("");
                } catch (error) {
                  console.error("Failed to allocate:", error);
                } finally {
                  setIsAllocating(false);
                }
              }}
            >
              <div>
                <label
                  htmlFor="github-username"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  GitHub Username
                </label>
                <input
                  id="github-username"
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Amount ({selectedToken.symbol})
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isAllocating}>
                {isAllocating ? "Allocating..." : "Allocate Tokens"}
              </Button>
            </form>

            {allocationSuccess && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                Tokens allocated successfully!
              </div>
            )}
          </div>
        </div>

        {/* Right column - Allocations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Token Allocations
          </h2>
          <div className="space-y-2">
            {allocations.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400">
                No tokens allocated yet
              </p>
            ) : (
              allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {allocation.amount} {allocation.tokenSymbol}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Allocated to: {allocation.githubUsername}
                      </p>
                    </div>
                    <div className="text-right">
                      {allocation.claimed ? (
                        <div>
                          <span className="text-green-600 dark:text-green-400 text-sm">
                            Claimed
                          </span>
                          {allocation.claimTransaction && (
                            <a
                              href={`https://solscan.io/tx/${allocation.claimTransaction}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-500 hover:text-blue-600 dark:text-blue-400 text-sm"
                            >
                              View on Solscan →
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                          Unclaimed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Wallet() {
  return (
    <div className="h-full flex flex-col justify-center items-center grow">
      <WalletDetails />
    </div>
  );
}
