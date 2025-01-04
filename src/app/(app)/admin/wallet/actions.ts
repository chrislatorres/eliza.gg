"use server";

import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import {
  Connection,
  ParsedTransactionWithMeta,
  PublicKey,
  RpcResponseAndContext,
  SignatureStatus,
} from "@solana/web3.js";
import {
  getCrossmintTransactionStatus,
  sendTransactionToCrossmint,
} from "./crossmint";
import { createUSDCTransferTransaction } from "./transfer";

// USDC token mint address (Solana mainnet)
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOLANA_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
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
    const { serializedTx } = await createUSDCTransferTransaction(
      senderAddress,
      recipientAddress,
      amount
    );

    console.log("Transaction created successfully, sending to Crossmint");

    // Send to Crossmint for signing and broadcasting
    const initialResponse = await sendTransactionToCrossmint(
      senderAddress,
      serializedTx
    );

    console.log(`Initial Crossmint response:`, initialResponse);

    // Poll for transaction status
    let status = initialResponse;
    let attempts = 0;
    const maxAttempts = 90;
    const pollInterval = 100; // Poll every 100ms
    const wsUrl = `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

    // Create both HTTP and WebSocket connections
    const connection = new Connection(SOLANA_RPC_URL, {
      commitment: "confirmed",
      wsEndpoint: wsUrl,
    });

    // Initial delay to allow Crossmint to process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a promise that resolves when confirmation is received via WebSocket
    const wsConfirmationPromise = new Promise<string | null>((resolve) => {
      if (!status.onChain?.txId) {
        resolve(null);
        return;
      }

      try {
        connection.onSignature(
          status.onChain.txId,
          (result, context) => {
            console.log("WebSocket confirmation received:", {
              result,
              context,
            });
            if (result.err) {
              console.error("Transaction failed:", result.err);
              resolve(null);
            } else {
              resolve(status.onChain?.txId || null);
            }
          },
          "confirmed"
        );
      } catch (error) {
        console.error("WebSocket subscription error:", error);
        resolve(null);
      }
    });

    while (attempts < maxAttempts) {
      if (status.status === "failed") {
        console.error("Transaction failed:", status);
        throw new Error(status.error || "Transaction failed");
      }

      // Check Crossmint status first
      const crossmintStatus = await getCrossmintTransactionStatus(
        senderAddress,
        initialResponse.id
      );
      status = crossmintStatus;

      // If transaction is on chain, check for confirmation
      if (status.onChain?.txId) {
        try {
          // Race between WebSocket and RPC confirmation
          const confirmation = await Promise.race([
            wsConfirmationPromise,
            Promise.all([
              connection.getSignatureStatus(status.onChain.txId),
              connection.getParsedTransaction(status.onChain.txId, {
                maxSupportedTransactionVersion: 0,
                commitment: "confirmed",
              }),
            ]) as Promise<
              [
                RpcResponseAndContext<SignatureStatus>,
                ParsedTransactionWithMeta
              ]
            >,
          ]);

          // If we got a valid signature from WebSocket
          if (typeof confirmation === "string" && confirmation) {
            return {
              signature: confirmation,
              solscanUrl: `${SOLSCAN_BASE_URL}/${confirmation}`,
              status: "success",
            };
          }

          // If it's an array, it's the RPC confirmation
          if (Array.isArray(confirmation)) {
            const [signatureStatus, parsedTx] = confirmation;
            if (
              signatureStatus.value?.confirmationStatus ||
              parsedTx ||
              signatureStatus.value?.confirmations > 0
            ) {
              return {
                signature: status.onChain.txId,
                solscanUrl: `${SOLSCAN_BASE_URL}/${status.onChain.txId}`,
                status: "success",
              };
            }
          }
        } catch (error) {
          console.warn("Error checking confirmation:", error);
        }
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // If we have a transaction ID but it's not confirmed yet, return pending
    if (status.onChain?.txId) {
      return {
        signature: status.onChain.txId,
        solscanUrl: `${SOLSCAN_BASE_URL}/${status.onChain.txId}`,
        status: "pending",
        message:
          "Transaction submitted but confirmation is taking longer than usual. You can track it on Solscan.",
      };
    }

    console.log("Transaction polling timed out");
    return {
      signature: null,
      solscanUrl: null,
      status: "pending",
      message:
        "Transaction submitted but still processing. Please check your wallet for confirmation.",
    };
  } catch (error) {
    console.error("Transfer error:", {
      error,
      sender: senderAddress,
      recipient: recipientAddress,
      amount,
    });
    throw new Error(error instanceof Error ? error.message : "Transfer failed");
  }
}
