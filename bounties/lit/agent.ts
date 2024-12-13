import {
  LitAbility,
  LitActionResource,
  createSiweMessage,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

interface VerificationResponse {
  response: {
    verified: boolean;
    message?: string;
  };
}

class AutonomusKnowledgeAgent {
  private litNodeClient: LitNodeClient;
  private walletClient: ReturnType<typeof createWalletClient>;
  private account: ReturnType<typeof privateKeyToAccount>;

  constructor() {
    this.litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
  }

  async initialize() {
    await this.litNodeClient.connect();
    // Initialize wallet for autonomous operations
    this.account = privateKeyToAccount(
      process.env.AGENT_PRIVATE_KEY! as `0x${string}`
    );
    this.walletClient = createWalletClient({
      account: this.account,
      transport: http(process.env.RPC_URL),
    });
  }

  private async getSessionSigs() {
    return await this.litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
      resourceAbilityRequests: [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: this.account.address,
          nonce: await this.litNodeClient.getLatestBlockhash(),
          litNodeClient: this.litNodeClient,
        });

        // Create a signer object that matches Lit Protocol's expected interface
        const signer = {
          signMessage: async (message: string) => {
            const signature = await this.walletClient.signMessage({
              message,
              account: this.account,
            });
            return signature;
          },
          getAddress: async () => this.account.address,
        };

        return await generateAuthSig({
          signer,
          toSign,
        });
      },
    });
  }

  async verifyAndProcessQuery(
    query: string,
    context: string
  ): Promise<VerificationResponse> {
    const verificationAction = `
      const verifyInfo = async () => {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: \`Bearer \${Lit.Actions.getParam("apiKey")}\`,
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "Verify if this query and context are consistent and factual."
                },
                {
                  role: "user",
                  content: Lit.Actions.getParam("query") + "\\n\\nContext:\\n" + Lit.Actions.getParam("context")
                }
              ],
              response_format: { type: "json_object" }  // Enforce JSON response
            })
          });

          if (!response.ok) {
            throw new Error(\`OpenAI API error: \${response.statusText}\`);
          }

          const result = await response.json();
          if (!result.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from OpenAI');
          }

          const verification = result.choices[0].message.content;
          console.log("Verification result:", verification);  // Add logging

          const isVerified = verification.toLowerCase().includes("verified");
          if (isVerified) {
            console.log("🔒 Signing verified content...");
            const messageHash = viem.keccak256(viem.stringToHex(verification));
            const sigShare = await Lit.Actions.signEcdsa({
              toSign: messageHash,
              publicKey: Lit.Actions.getParam("publicKey"),
              sigName: "verification"
            });
            console.log("✅ Content signed successfully");
          }

          return {
            verified: isVerified,
            message: verification,
            timestamp: Date.now()  // Add timestamp for tracking
          };
        } catch (error) {
          console.error("❌ Error in verifyInfo:", error);
          throw error;
        }
      };

      (async () => {
        try {
          const result = await verifyInfo();
          console.log("Final verification result:", result);
          Lit.Actions.setResponse({ response: result });
        } catch (e) {
          console.error("❌ Error in Lit Action:", e);
          Lit.Actions.setResponse({
            response: {
              verified: false,
              message: \`Error: \${e.message}\`,
              error: true,
              timestamp: Date.now()
            }
          });
        }
      })();
    `;

    const sessionSigs = await this.getSessionSigs();

    const litResponse = await this.litNodeClient.executeJs({
      sessionSigs,
      code: verificationAction,
      jsParams: {
        query,
        context,
        apiKey: process.env.OPENAI_API_KEY,
        publicKey: this.account.address,
      },
    });

    if (typeof litResponse.response === "string") {
      return {
        response: {
          verified: false,
          message: litResponse.response,
        },
      };
    }

    return litResponse as VerificationResponse;
  }

  async storeVerifiedKnowledge(knowledge: string) {
    const storageAction = `
      const storeKnowledge = async () => {
        const knowledge = Lit.Actions.getParam("knowledge");

        // Sign the knowledge to prove authenticity
        const messageHash = viem.keccak256(viem.stringToHex(knowledge));
        const sigShare = await Lit.Actions.signEcdsa({
          toSign: messageHash,
          publicKey: Lit.Actions.getParam("publicKey"),
          sigName: "knowledgeSignature"
        });

        // Store in a decentralized storage (could be IPFS, Ceramic, etc)
        const response = await fetch("https://api.ceramic.network/...", {
          method: "POST",
          body: JSON.stringify({
            knowledge,
            signature: sigShare
          })
        });

        return { stored: true, signature: sigShare };
      };

      (async () => {
        const result = await storeKnowledge();
        Lit.Actions.setResponse({ response: result });
      })();
    `;

    const sessionSigs = await this.getSessionSigs();

    return await this.litNodeClient.executeJs({
      sessionSigs,
      code: storageAction,
      jsParams: {
        knowledge,
        publicKey: this.account.address,
      },
    });
  }

  async handleUserQuery(query: string) {
    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ content: query }],
      }),
    });

    const searchResult = await response.json();

    const verifiedResult = await this.verifyAndProcessQuery(
      query,
      JSON.stringify(searchResult.citations)
    );

    if (verifiedResult?.response?.verified) {
      await this.storeVerifiedKnowledge(
        JSON.stringify({
          query,
          result: searchResult,
          verification: verifiedResult,
        })
      );
    }

    return {
      ...searchResult,
      verification: verifiedResult,
    };
  }

  async executeVerifiedTransaction(txData: any) {
    const transactionAction = `
      const executeTx = async () => {
        try {
          console.log("🔒 Preparing transaction...");
          const signature = await Lit.Actions.signEcdsa({
            toSign: Lit.Actions.getParam("txData"),
            publicKey: Lit.Actions.getParam("publicKey"),
            sigName: "transaction"
          });

          console.log("📝 Transaction signed, sending to network...");
          const response = await Lit.Actions.runOnce(
            { waitForResponse: true, name: "txSender" },
            async () => {
              try {
                const provider = new ethers.providers.JsonRpcProvider(
                  Lit.Actions.getParam("rpcUrl")
                );
                const tx = await provider.sendTransaction(signature);
                return {
                  success: true,
                  hash: tx.hash,
                  message: "Transaction sent successfully"
                };
              } catch (error) {
                console.error("Transaction error:", error);
                return {
                  success: false,
                  error: error.message
                };
              }
            }
          );

          return response;
        } catch (error) {
          console.error("❌ Error in executeTx:", error);
          throw error;
        }
      };

      (async () => {
        try {
          const result = await executeTx();
          Lit.Actions.setResponse({ response: result });
        } catch (e) {
          console.error("❌ Error in Lit Action:", e);
          Lit.Actions.setResponse({
            response: {
              success: false,
              error: e.message
            }
          });
        }
      })();
    `;

    const sessionSigs = await this.getSessionSigs();
    return await this.litNodeClient.executeJs({
      sessionSigs,
      code: transactionAction,
      jsParams: {
        txData,
        publicKey: this.account.address,
        rpcUrl: process.env.RPC_URL,
      },
    });
  }
}

export const agent = new AutonomusKnowledgeAgent();
