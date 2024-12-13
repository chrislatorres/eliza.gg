export interface SmartAccountConfig {
  owner: string;
  recoveryAddresses: string[];
  paymaster: string;
}

export interface Permission {
  abi: string;
  methods: string[];
}

export interface RiskParameters {
  maxTransactionValue: number;
  dailyLimit: number;
  allowedAssets: string[];
  blacklistedAddresses: string[];
  requireMultiSig: boolean;
  cooldownPeriod: number;
}

export interface SessionKeyConfig {
  walletAddress: string;
  permissions: Permission[];
  expirySeconds: number;
  label: string;
  riskParameters: RiskParameters;
}

export interface FunctorResponse {
  jsonrpc: string;
  result: any;
  id: number;
}
