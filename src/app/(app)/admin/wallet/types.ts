export interface Token {
  symbol: string;
  mint: string;
  decimals: number;
  icon: string;
  balance: number | null;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface Transaction {
  signature: string;
  recipient: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
  solscanUrl?: string;
  error?: string;
  tokenSymbol: string;
}

export interface FeeEstimate {
  totalSOL: number;
  totalUSD: number | null;
  isNewAccount: boolean;
  loading: boolean;
  error?: string;
}
