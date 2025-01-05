import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { getWalletKeypair } from "./keys";

// USDC token mint address (Solana mainnet)
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOLANA_RPC_URL =
  "https://red-weathered-theorem.solana-mainnet.quiknode.pro/bcebff344bdf1b96bb92ffd2a9fc1281ad16d7f3";
const SOLANA_WS_URL =
  "wss://red-weathered-theorem.solana-mainnet.quiknode.pro/bcebff344bdf1b96bb92ffd2a9fc1281ad16d7f3";

export async function createUSDCTransferTransaction(
  senderAddress: string,
  recipientAddress: string,
  amount: number
) {
  console.log(`Creating USDC transfer transaction:`, {
    sender: senderAddress,
    recipient: recipientAddress,
    amount,
  });

  const connection = new Connection(SOLANA_RPC_URL, "confirmed");

  // Convert addresses to PublicKeys
  const senderPublicKey = new PublicKey(senderAddress);
  const recipientPublicKey = new PublicKey(recipientAddress);

  // Get latest blockhash with "confirmed" commitment
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  console.log(`Got latest blockhash: ${blockhash}`);

  // Get associated token accounts for simulation
  const senderTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    senderPublicKey
  );
  const recipientTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    recipientPublicKey
  );

  const amountInBaseUnits = Math.floor(amount * 1_000_000);

  // Create test instructions for simulation
  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
  ];

  // Check if recipient token account exists for simulation
  const recipientAccountInfo = await connection.getAccountInfo(
    recipientTokenAccount
  );

  if (!recipientAccountInfo) {
    testInstructions.push(
      createAssociatedTokenAccountInstruction(
        senderPublicKey,
        recipientTokenAccount,
        recipientPublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add transfer instruction to test instructions
  testInstructions.push(
    createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const testTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: senderPublicKey,
      recentBlockhash: blockhash,
    }).compileToV0Message()
  );

  console.log("Simulating transaction to determine compute units...");
  const rpcResponse = await connection.simulateTransaction(testTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });

  if (rpcResponse.value.err) {
    console.error("Simulation failed:", rpcResponse.value.err);
    throw new Error(`Transaction simulation failed: ${rpcResponse.value.err}`);
  }

  const unitsConsumed = rpcResponse.value.unitsConsumed || 200_000;
  const computeUnits = Math.ceil(unitsConsumed * 1.1); // Add 10% margin

  console.log(`Compute units needed: ${computeUnits}`);

  // Build final transaction with optimized compute units
  const instructions = [];

  // Get recommended priority fee using QuickNode API
  const priorityFeeResponse = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "qn_estimatePriorityFees",
      params: {
        last_n_blocks: 2,
        api_version: 1,
      },
    }),
  });

  const priorityFeeData = await priorityFeeResponse.json();
  if (priorityFeeData.error) {
    console.error("Priority fee estimation failed:", priorityFeeData.error);
    throw new Error("Failed to estimate priority fee");
  }

  // Use QuickNode's priority fee levels
  const priorityFeeLevels = priorityFeeData.result?.per_compute_unit;
  let priorityFee = 2_000_000; // Default fallback

  if (priorityFeeLevels) {
    // Always use extreme priority fee for faster processing
    priorityFee = Math.ceil(priorityFeeLevels.extreme * 1.5); // 50% higher than extreme

    console.log("Priority fee metrics:", {
      estimatedFee: priorityFee,
      feeLevels: priorityFeeLevels,
    });
  }

  console.log(`Using priority fee: ${priorityFee} microlamports`);

  // Add compute budget instructions at the very start
  instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    }),
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 200_000, // Increased from 100_000
    })
  );

  // Move the transfer instruction to the front for faster processing
  if (!recipientAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        senderPublicKey,
        recipientTokenAccount,
        recipientPublicKey,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  instructions.push(
    createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderPublicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  console.log(`Created ${instructions.length} instructions`);

  // Get the wallet keypair
  const walletKeypair = getWalletKeypair();

  // Verify the sender address matches our keypair
  if (walletKeypair.publicKey.toBase58() !== senderAddress) {
    throw new Error("Sender address does not match wallet keypair");
  }

  // Calculate required SOL for rent and fees
  const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
    165
  );
  const senderBalance = await connection.getBalance(senderPublicKey);

  // Estimate minimum SOL needed (rent + estimated fee)
  const estimatedFee = 5000; // Base fee in lamports
  const totalNeeded = !recipientAccountInfo
    ? rentExemptBalance + estimatedFee
    : estimatedFee;

  if (senderBalance < totalNeeded) {
    const neededSOL = totalNeeded / 1e9;
    const currentSOL = senderBalance / 1e9;
    throw new Error(
      `Insufficient SOL balance for ${
        !recipientAccountInfo ? "account creation and " : ""
      }transaction fees. ` +
        `Have ${currentSOL.toFixed(6)} SOL, need ${neededSOL.toFixed(6)} SOL`
    );
  }

  // Create and sign the final transaction
  const message = new TransactionMessage({
    instructions,
    recentBlockhash: blockhash,
    payerKey: senderPublicKey,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  // Sign the transaction with our keypair
  transaction.sign([walletKeypair]);

  return {
    transaction,
    serializedTx: bs58.encode(transaction.serialize()),
  };
}
