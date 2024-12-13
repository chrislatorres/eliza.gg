import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { createWalletClient, http, type WalletClient } from "viem";
import { mainnet } from "viem/chains";

const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// Helper function to ensure hex format
function toHexString(str: string): `0x${string}` {
  return `0x${str.replace(/^0x/, "")}` as `0x${string}`;
}

export interface IPMetadata {
  name: string;
  description: string;
  mediaUrl: string;
  contentType: string;
  aiTrainingTerms: {
    allowFineTuning: boolean;
    requireAttribution: boolean;
    commercialUse: boolean;
    pricePerEpoch: number;
  };
}

export class StoryIPManager {
  private story: StoryClient;
  private wallet: WalletClient;

  constructor(config: StoryConfig) {
    this.story = StoryClient.newClient({
      ...config,
      transport: http(),
    });

    this.wallet = createWalletClient({
      chain: mainnet,
      transport: http(),
    });
  }

  async registerIPForAITraining(metadata: IPMetadata) {
    try {
      const address = await this.wallet
        .getAddresses()
        .then((addresses) => addresses[0]);

      // 1. Register the IP Asset
      const ipAssetResponse = await this.story.ipAsset.mintAndRegisterIp({
        spgNftContract:
          "0x0000000000000000000000000000000000000000" as `0x${string}`, // Replace with actual SPG NFT contract address
        ipMetadata: {
          ipMetadataURI: `data:application/json,${encodeURIComponent(
            JSON.stringify({
              name: metadata.name,
              description: metadata.description,
              mediaUrl: metadata.mediaUrl,
              attributes: {
                contentType: metadata.contentType,
                aiTrainingTerms: metadata.aiTrainingTerms,
              },
            })
          )}`,
          ipMetadataHash: "0x",
        },
      });

      const ipAssetId = ipAssetResponse.tokenId;

      // 2. Create PIL License Terms for AI Training
      const licenseResponse = await this.story.license.registerPILTerms({
        transferable: true,
        royaltyPolicy:
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
        defaultMintingFee: BigInt(metadata.aiTrainingTerms.pricePerEpoch),
        expiration: BigInt(0),
        commercialUse: metadata.aiTrainingTerms.commercialUse,
        commercialAttribution: metadata.aiTrainingTerms.requireAttribution,
        commercializerChecker:
          "0x0000000000000000000000000000000000000000" as `0x${string}`,
        commercializerCheckerData: "0x" as `0x${string}`,
        commercialRevShare: 0,
        commercialRevCeiling: BigInt(0),
        derivativesAllowed: metadata.aiTrainingTerms.allowFineTuning,
        derivativesAttribution: true,
        derivativesApproval: false,
        derivativesReciprocal: false,
        derivativeRevCeiling: BigInt(0),
        currency: USDC_CONTRACT_ADDRESS as `0x${string}`,
        uri: "",
      });

      const licenseTermsId = licenseResponse.licenseTermsId;

      // 3. Link License Terms to IP Asset
      await this.story.license.attachLicenseTerms({
        ipId: ipAssetId as any,
        licenseTermsId,
      });

      // 4. Setup Royalty Policy
      await this.story.royalty.payRoyaltyOnBehalf({
        receiverIpId: ipAssetId as any,
        payerIpId: ipAssetId as any,
        token: USDC_CONTRACT_ADDRESS,
        amount: BigInt(100),
      });

      return {
        ipAssetId,
        licenseTermsId,
        status: "success",
        message: "IP successfully registered with AI training terms",
      };
    } catch (error) {
      console.error("Failed to register IP:", error);
      throw new Error(`IP registration failed: ${error.message}`);
    }
  }

  async getRevenueInfo(ipAssetId: string) {
    const address = await this.wallet
      .getAddresses()
      .then((addresses) => addresses[0]);

    const claimableRevenue = await this.story.royalty.claimableRevenue({
      royaltyVaultIpId: toHexString(ipAssetId),
      account: address,
      snapshotId: "0x0",
      token: USDC_CONTRACT_ADDRESS,
    });

    return {
      totalRevenue: Number(claimableRevenue),
      withdrawableFunds: Number(claimableRevenue),
      currency: "USDC",
    };
  }

  async claimRoyalties(ipAssetId: string) {
    try {
      const address = await this.wallet
        .getAddresses()
        .then((addresses) => addresses[0]);

      const response = await this.story.royalty.claimRevenue({
        royaltyVaultIpId: toHexString(ipAssetId),
        token: USDC_CONTRACT_ADDRESS,
        account: address,
        snapshotIds: ["0x0"],
      });

      return {
        status: "success",
        message: "Royalties successfully claimed",
        transactionHash: response.txHash,
      };
    } catch (error) {
      console.error("Failed to claim royalties:", error);
      throw new Error(`Royalty claim failed: ${error.message}`);
    }
  }
}
