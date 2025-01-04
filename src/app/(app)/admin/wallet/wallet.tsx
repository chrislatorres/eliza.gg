"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { initiateUSDCTransfer } from "./actions";

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
    // Add extra info to the error object
    const data = await res.json();
    (error as any).status = res.status;
    (error as any).info = data;
    throw error;
  }
  return res.json();
};

export function WalletDetails() {
  const [walletAddress, setWalletAddress] = useState<string>(
    "CKEyMkc5izAZmuYWYF5aCpUY26BMDodx2wy97jwy33m2"
  );
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [solscanUrl, setSolscanUrl] = useState<string | null>(null);

  const { data, error: balanceError } = useSWR(
    walletAddress ? `/api/admin/wallet?address=${walletAddress}` : null,
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  // Handle different types of errors
  const errorMessage = balanceError?.info?.error || "Failed to fetch balance";
  const isUnauthorized = balanceError?.status === 401;
  const isForbidden = balanceError?.status === 403;

  const handleCopy = async () => {
    const success = await copyToClipboard(walletAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  const handleTransfer = async () => {
    try {
      setTransferError(null);
      setTransferStatus("Preparing transaction...");
      setSolscanUrl(null); // Reset Solscan URL

      // Validate input
      if (!recipientAddress || !amount) {
        throw new Error("Please fill in all fields");
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Validate that recipient address is a valid Solana address
      try {
        new PublicKey(recipientAddress);
      } catch (e) {
        throw new Error("Invalid recipient address");
      }

      // Validate sufficient balance
      const currentBalance = parseFloat(data?.balance || "0");
      if (amountNum > currentBalance) {
        throw new Error("Insufficient balance");
      }

      setTransferStatus("Sending transaction...");

      const result = await initiateUSDCTransfer(
        walletAddress,
        recipientAddress,
        amountNum
      );

      if (result.status === "success") {
        setTransferStatus("Transaction completed successfully!");
        setSolscanUrl(result.solscanUrl);
        setRecipientAddress("");
        setAmount("");

        // Reset transfer status after a delay
        setTimeout(() => {
          setTransferStatus(null);
        }, 5000);

        // Trigger balance refresh
        await mutate(`/api/admin/wallet?address=${walletAddress}`);
      } else if (result.message) {
        setTransferStatus(result.message);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setTransferError(
        error instanceof Error ? error.message : "Transfer failed"
      );
      setTransferStatus(null);
    }
  };

  if (isUnauthorized) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          Please sign in to access this page
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          You don't have permission to access this page
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">
        Solana MPC Wallet
      </h1>

      {balanceError && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
          {"Failed to fetch balance"}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Wallet Address:
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
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Balance:
            </h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              {data ? `${data.balance} USDC` : "Loading..."}
            </p>
          </div>
        </div>

        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Send USDC
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                placeholder="Enter Solana address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <Button
              onClick={handleTransfer}
              className="w-full"
              disabled={!!transferStatus}
            >
              {transferStatus ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {transferStatus}
                </div>
              ) : (
                "Send USDC"
              )}
            </Button>

            {transferStatus && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {transferStatus}
              </div>
            )}

            {transferError && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {transferError}
              </div>
            )}

            {solscanUrl && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View transaction on Solscan →
                </a>
              </div>
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
