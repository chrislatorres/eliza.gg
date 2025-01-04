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

// USDC token mint address (Solana mainnet)
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOLANA_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

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

  // Get recommended priority fee using Helius API
  const priorityFeeResponse = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getPriorityFeeEstimate",
      params: [
        {
          transaction: bs58.encode(testTransaction.serialize()),
          options: {
            includeAllPriorityFeeLevels: true,
            // Use ultra-small lookback for most recent fees
            lookbackSlots: 2,
            evaluateEmptySlotAsZero: false,
          },
        },
      ],
    }),
  });

  const priorityFeeData = await priorityFeeResponse.json();
  if (priorityFeeData.error) {
    console.error("Priority fee estimation failed:", priorityFeeData.error);
    throw new Error("Failed to estimate priority fee");
  }

  // Use the priority fee levels to determine optimal fee
  const priorityFeeLevels = priorityFeeData.result?.priorityFeeLevels;
  let priorityFee = 2_000_000; // Double the default fallback for extreme cases
  let networkLoad = 1;

  if (priorityFeeLevels) {
    networkLoad = priorityFeeLevels.veryHigh / priorityFeeLevels.medium;

    // Start with 5x unsafeMax as absolute base
    priorityFee = Math.ceil(priorityFeeLevels.unsafeMax * 5);

    // Simplified multiplier based on amount
    const amountInUSD = amount;
    let amountMultiplier = 10; // Start with 10x for all transactions

    if (amountInUSD < 1) {
      amountMultiplier = 25; // 25x for sub-dollar transactions
    }

    // Set absolute minimum fee floor
    const minimumFee = Math.max(
      Math.ceil(priorityFeeLevels.unsafeMax * amountMultiplier),
      20_000_000 // 20M microlamports minimum
    );

    priorityFee = Math.max(priorityFee, minimumFee);

    // Network congestion multiplier
    const congestionMultiplier = networkLoad > 2 ? 3 : 2;
    priorityFee = Math.ceil(priorityFee * congestionMultiplier);

    // Final boost to ensure we're way above network average
    const avgFee = (priorityFeeLevels.high + priorityFeeLevels.veryHigh) / 2;
    priorityFee = Math.max(
      priorityFee,
      avgFee * 1000, // 1000x average network fee
      priorityFeeLevels.unsafeMax * 10 // Minimum 10x unsafeMax
    );

    const microlamportsPerCU = priorityFee / computeUnits;
    console.log("Fee metrics:", {
      microlamportsPerCU,
      totalFee: priorityFee,
      computeUnits,
      estimatedCostSOL: (priorityFee * computeUnits) / 1e9,
      networkLoad,
      unsafeMax: priorityFeeLevels.unsafeMax,
      amountUSD: amountInUSD,
      amountMultiplier,
      congestionMultiplier,
      avgNetworkFee: avgFee,
    });
  }

  console.log(
    `Using priority fee: ${priorityFee} microlamports (Network load factor: ${networkLoad})`
  );

  // Add compute budget instructions at the very start
  instructions.unshift(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: priorityFee,
    }),
    ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.min(computeUnits, 150_000), // Further reduce compute units
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

  const message = new TransactionMessage({
    instructions,
    recentBlockhash: blockhash,
    payerKey: senderPublicKey,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  const serializedTx = bs58.encode(transaction.serialize());

  console.log(`Transaction created and serialized successfully`);

  return {
    serializedTx,
    computeUnits,
    priorityFee,
  };
}
