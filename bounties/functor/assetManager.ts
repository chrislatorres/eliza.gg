import { FunctorClient } from "./execute";
import { RiskParameters, SessionKeyConfig } from "./types";

export class AssetManager {
  private functorClient: FunctorClient;

  constructor() {
    this.functorClient = new FunctorClient();
  }

  async createAssetManagementSession(
    walletAddress: string,
    aiAgentAddress: string,
    riskParams: RiskParameters
  ) {
    // Define ERC20/721 transfer permissions
    const transferAbi = [
      {
        constant: false,
        inputs: [
          { name: "_to", type: "address" },
          { name: "_value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        type: "function",
      },
    ];

    const sessionConfig: SessionKeyConfig = {
      walletAddress,
      permissions: [
        {
          abi: JSON.stringify(transferAbi),
          methods: ["transfer(address,uint256)"],
        },
      ],
      expirySeconds: 24 * 60 * 60, // 1 day
      label: `AI Asset Manager - ${aiAgentAddress}`,
      riskParameters: riskParams,
    };

    return this.functorClient.createSessionKey(sessionConfig);
  }

  async createEscrowSession(
    walletAddress: string,
    escrowAddress: string,
    assetAddress: string,
    amount: string
  ) {
    const escrowAbi = [
      {
        constant: false,
        inputs: [
          { name: "_asset", type: "address" },
          { name: "_amount", type: "uint256" },
        ],
        name: "deposit",
        outputs: [],
        type: "function",
      },
    ];

    const riskParams: RiskParameters = {
      maxTransactionValue: parseInt(amount),
      dailyLimit: parseInt(amount),
      allowedAssets: [assetAddress],
      blacklistedAddresses: [],
      requireMultiSig: true,
      cooldownPeriod: 3600, // 1 hour cooldown
    };

    const sessionConfig: SessionKeyConfig = {
      walletAddress,
      permissions: [
        {
          abi: JSON.stringify(escrowAbi),
          methods: ["deposit(address,uint256)"],
        },
      ],
      expirySeconds: 7 * 24 * 60 * 60, // 1 week
      label: `Escrow Session - ${escrowAddress}`,
      riskParameters: riskParams,
    };

    return this.functorClient.createSessionKey(sessionConfig);
  }
}
