const CROSSMINT_API_URL = "https://www.crossmint.com/api/v1-alpha2/wallets";

interface CrossmintResponse {
  id: string;
  status: "pending" | "success" | "failed";
  transactionHash?: string;
  error?: string;
  onChain?: {
    txId: string;
    transaction: string;
    lastValidBlockHeight: number;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation, ${retries} attempts remaining`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function sendTransactionToCrossmint(
  walletAddress: string,
  serializedTransaction: string
): Promise<CrossmintResponse> {
  console.log(`Sending transaction to Crossmint for wallet: ${walletAddress}`);

  return retryWithBackoff(async () => {
    const response = await fetch(
      `${CROSSMINT_API_URL}/${walletAddress}/transactions`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.CROSSMINT_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          params: {
            transaction: serializedTransaction,
            options: {
              skipPreflight: true, // Skip preflight as recommended
              maxRetries: 0, // We handle retries ourselves
            },
          },
        }),
      }
    );

    console.log(`Crossmint API response status: ${response.status}`);

    const connectionType = response.headers.get("X-Helius-ConnectionType");
    console.log(`Using connection type: ${connectionType}`);

    if (!response.ok) {
      const error = await response.json();
      console.error("Crossmint API error details:", {
        status: response.status,
        error,
        walletAddress,
      });
      throw new Error(
        error.message || `Failed to send transaction: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Crossmint successful response:", data);
    return data;
  });
}

export async function getCrossmintTransactionStatus(
  walletAddress: string,
  transactionId: string
): Promise<CrossmintResponse> {
  return retryWithBackoff(async () => {
    console.log(`Checking transaction status:`, {
      walletAddress,
      transactionId,
    });

    const response = await fetch(
      `${CROSSMINT_API_URL}/${walletAddress}/transactions/${transactionId}`,
      {
        headers: {
          "X-API-KEY": process.env.CROSSMINT_API_KEY!,
        },
      }
    );

    console.log(`Status check response: ${response.status}`);

    if (!response.ok) {
      const error = await response.json();
      console.error("Status check error:", error);
      throw new Error(error.message || "Failed to get transaction status");
    }

    const data = await response.json();
    console.log("Transaction status:", data);
    return data;
  });
}
