import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

// Store private key securely in environment variables
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY!;

if (!WALLET_PRIVATE_KEY) {
  throw new Error("WALLET_PRIVATE_KEY environment variable is not set");
}

// Create keypair from private key
export const getWalletKeypair = () => {
  try {
    const decodedKey = bs58.decode(WALLET_PRIVATE_KEY);
    return Keypair.fromSecretKey(decodedKey);
  } catch (error) {
    console.error("Failed to create keypair:", error);
    throw new Error("Invalid wallet private key");
  }
};
