import { FunctorResponse, SessionKeyConfig, SmartAccountConfig } from "./types";

const FUNCTOR_RPC = "http://54.163.51.119:3007";
const API_KEY = process.env.FUNCTOR_API_KEY || "";

export class FunctorClient {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    };
  }

  // Create a new smart account wallet
  async createSmartAccount(
    config: SmartAccountConfig
  ): Promise<FunctorResponse> {
    const body = {
      id: 1,
      jsonrpc: "2.0",
      method: "functor_createSmartAccount",
      params: [config.owner, config.recoveryAddresses, config.paymaster],
    };

    const response = await fetch(FUNCTOR_RPC, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }

  // Create a session key with specific permissions
  async createSessionKey(config: SessionKeyConfig): Promise<FunctorResponse> {
    const body = {
      jsonrpc: "2.0",
      method: "functor_createSessionKey",
      params: [
        config.walletAddress,
        config.permissions.map((permission) => ({
          contractAbi: permission.abi,
          allowedMethods: permission.methods,
        })),
        config.expirySeconds,
        {
          label: config.label,
          restricted: true,
          riskParameters: config.riskParameters,
        },
      ],
      id: 1,
    };

    const response = await fetch(FUNCTOR_RPC, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    return response.json();
  }
}
