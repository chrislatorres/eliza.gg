"use server";

import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { createUSDCTransferTransaction } from "./transfer";

// USDC token mint address (Solana mainnet)
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOLANA_RPC_URL =
  "https://red-weathered-theorem.solana-mainnet.quiknode.pro/bcebff344bdf1b96bb92ffd2a9fc1281ad16d7f3";
const SOLANA_WS_URL =
  "wss://red-weathered-theorem.solana-mainnet.quiknode.pro/bcebff344bdf1b96bb92ffd2a9fc1281ad16d7f3";
const SOLSCAN_BASE_URL = "https://solscan.io/tx";

export async function getWalletBalance(walletAddress: string) {
  // Check if user is authenticated and is admin
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    throw new Error("Forbidden");
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const walletPublicKey = new PublicKey(walletAddress);

    // Get the associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletPublicKey
    );

    // Check if token account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);

    if (!accountInfo) {
      return {
        amount: "0",
        decimals: 6,
      };
    }

    // Get token account balance
    const balance = await connection.getTokenAccountBalance(tokenAccount);

    return {
      amount: balance.value.amount,
      decimals: balance.value.decimals,
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error("Failed to fetch wallet balance");
  }
}

export async function initiateUSDCTransfer(
  senderAddress: string,
  recipientAddress: string,
  amount: number
) {
  console.log(`Initiating USDC transfer:`, {
    sender: senderAddress,
    recipient: recipientAddress,
    amount,
  });

  const { userId } = await auth();
  if (!userId) {
    console.error("Transfer attempted without authentication");
    throw new Error("Unauthorized");
  }

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    console.error(`Non-admin user attempted transfer: ${userId}`);
    throw new Error("Forbidden");
  }

  try {
    const { transaction } = await createUSDCTransferTransaction(
      senderAddress,
      recipientAddress,
      amount
    );

    // Create connection with commitment
    const connection = new Connection(SOLANA_RPC_URL, {
      commitment: "confirmed",
      wsEndpoint: SOLANA_WS_URL,
    });

    // Send transaction with proper options
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });

    console.log(`Transaction sent with signature: ${signature}`);

    // Create WebSocket subscription for confirmation
    const confirmationPromise = new Promise<string>((resolve, reject) => {
      let timeout: ReturnType<typeof setTimeout>;

      const wsSubscription = connection.onSignature(
        signature,
        (result, context) => {
          clearTimeout(timeout);
          console.log("Transaction confirmation received:", {
            result,
            context,
          });

          if (result.err) {
            reject(new Error(`Transaction failed: ${result.err}`));
          } else {
            resolve(signature);
          }
        },
        "confirmed"
      );

      // Set timeout for confirmation
      timeout = setTimeout(() => {
        connection.removeSignatureListener(wsSubscription);
        reject(new Error("Transaction confirmation timeout"));
      }, 30000); // 30 second timeout
    });

    // Wait for confirmation
    const confirmedSignature = await confirmationPromise;

    return {
      signature: confirmedSignature,
      solscanUrl: `${SOLSCAN_BASE_URL}/${confirmedSignature}`,
      status: "success",
    };
  } catch (error) {
    console.error("Transfer error:", error);
    throw error;
  }
}

export async function initiateAI16ZTransfer(
  senderAddress: string,
  recipientAddress: string,
  amount: number
): Promise<{ signature: string; solscanUrl: string }> {
  const response = await fetch("/api/admin/wallet/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderAddress,
      recipientAddress,
      amount,
      tokenMint: "Ai16Z2tPz1kxgvHsDpFr6mPzMJGqPxm9pTYrTQNXVRa4",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to transfer AI16Z");
  }

  const result = await response.json();
  return result;
}
