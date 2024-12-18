import { createTurso } from "@/lib/indexer/utils/create-turso";
import { embed } from "@/lib/indexer/utils/embed";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

export class CryptoSherpa {
  private toolkit: CdpToolkit;
  private agent: any;
  private db: any;
  private marketMonitor: any = null;
  private tradingStrategy: any = null;
  private portfolioRebalancer: any = null;

  constructor() {
    this.initializeAgent();
  }

  private async initializeAgent() {
    // Initialize CDP AgentKit with Base network configuration
    const agentkit = await CdpAgentkit.configureWithWallet({
      networkId: "base",
      source: "crypto-sherpa",
    });

    // Create toolkit with all available tools
    this.toolkit = new CdpToolkit(agentkit);

    // Initialize LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.7,
    });

    // Create agent with tools
    this.agent = createReactAgent({
      llm: model,
      tools: this.toolkit.getTools(),
    });

    // Initialize knowledge DB connection
    this.db = createTurso();
  }

  async processQuery(query: string) {
    // Get knowledge context
    const queryEmbedding = await embed(query);
    const { rows } = await this.db.execute({
      sql: `
        SELECT content, vector_distance_cos(full_emb, vector32(?)) as similarity
        FROM crypto_knowledge
        ORDER BY similarity ASC
        LIMIT 3
      `,
      args: [`[${queryEmbedding.join(", ")}]`],
    });

    // Combine knowledge with onchain capabilities
    const context = rows.map((row) => row[0]).join("\n\n");

    const systemPrompt = `
      You are CryptoSherpa, an AI guide that helps users navigate Web3.
      You can both provide knowledge and execute onchain actions.

      Available Actions:
      - Check wallet balances
      - Request testnet funds
      - Transfer tokens
      - Trade assets
      - Deploy/interact with contracts

      Context:
      ${context}

      Always explain what you're doing before executing actions.
      Prioritize user safety and education.
    `;

    const result = await this.agent.invoke({
      messages: [new HumanMessage(systemPrompt), new HumanMessage(query)],
    });

    return {
      response: result.messages[result.messages.length - 1].content,
      actions: result.actions || [],
    };
  }

  // Helper methods for common operations
  async checkBalance(address: string) {
    const balanceTool = this.toolkit
      .getTools()
      .find((t) => t.name === "get_balance");
    return await balanceTool.call({ address });
  }

  async executeTransfer(to: string, amount: string, token: string) {
    const transferTool = this.toolkit
      .getTools()
      .find((t) => t.name === "transfer");
    return await transferTool.call({ to, amount, token });
  }

  // Add Base-specific helper methods
  async deployToBase(contractCode: string) {
    const deployTool = this.toolkit
      .getTools()
      .find((t) => t.name === "deploy_contract");
    return await deployTool.call({
      network: "base",
      code: contractCode,
    });
  }

  async swapOnBase(fromToken: string, toToken: string, amount: string) {
    const swapTool = this.toolkit.getTools().find((t) => t.name === "swap");

    return await swapTool.call({
      fromToken,
      toToken,
      amount,
      network: "base",
    });
  }

  // Autonomous monitoring and actions
  async startAutonomousMode(config: {
    monitoredTokens: string[];
    tradingStrategy: string;
    riskLevel: "low" | "medium" | "high";
  }) {
    if (!config.monitoredTokens?.length) {
      throw new Error("No tokens specified for monitoring");
    }

    // Start monitoring market conditions
    this.startMarketMonitor(config.monitoredTokens);

    // Initialize trading strategy
    this.initTradingStrategy(config.tradingStrategy, config.riskLevel);
    this.tradingStrategy.monitoredTokens = config.monitoredTokens;

    // Set up automated portfolio management
    this.startPortfolioRebalancer();
  }

  private async evaluateMarketConditions() {
    const marketTool = this.toolkit
      .getTools()
      .find((t) => t.name === "get_market_data");

    const priceData = await Promise.all(
      this.tradingStrategy.monitoredTokens.map(async (token: string) => {
        return await marketTool.call({ token });
      })
    );

    // Analyze price movements and volatility
    const analysis = priceData.map((data, index) => ({
      token: this.tradingStrategy.monitoredTokens[index],
      price: data.price,
      change24h: data.priceChange24h,
      volume: data.volume24h,
    }));

    return analysis;
  }

  private async executeTradingStrategy() {
    if (!this.tradingStrategy?.active) return;

    const marketConditions = await this.evaluateMarketConditions();

    for (const condition of marketConditions) {
      // Execute trades based on risk level and market conditions
      if (this.tradingStrategy.risk === "low") {
        // Conservative strategy: Only trade if 24h change is between -2% and 2%
        if (Math.abs(condition.change24h) <= 2) {
          await this.swapOnBase(
            condition.token,
            "USDC",
            condition.price > 0 ? "0.1" : "0"
          );
        }
      } else if (this.tradingStrategy.risk === "medium") {
        // Moderate strategy: Trade on moderate volatility
        if (Math.abs(condition.change24h) <= 5) {
          await this.swapOnBase(
            condition.token,
            "USDC",
            condition.price > 0 ? "0.5" : "0"
          );
        }
      } else {
        // High risk strategy: Trade on high volatility
        if (Math.abs(condition.change24h) > 5) {
          await this.swapOnBase(
            condition.token,
            "USDC",
            condition.price > 0 ? "1.0" : "0"
          );
        }
      }
    }
  }

  private startMarketMonitor(tokens: string[]) {
    this.marketMonitor = setInterval(async () => {
      try {
        await this.evaluateMarketConditions();
        // Add execution of trading strategy after market evaluation
        await this.executeTradingStrategy();
      } catch (error) {
        console.error("Market monitoring error:", error);
        // Optionally implement retry logic or alerting
      }
    }, 60000);
  }

  private initTradingStrategy(
    strategy: string,
    riskLevel: "low" | "medium" | "high"
  ) {
    if (!strategy || !riskLevel) {
      throw new Error("Invalid trading strategy configuration");
    }

    this.tradingStrategy = {
      type: strategy,
      risk: riskLevel,
      active: true,
      monitoredTokens: [], // This should be set from config
    };
  }

  private startPortfolioRebalancer() {
    // Implementation for portfolio rebalancing
    this.portfolioRebalancer = setInterval(() => {
      this.rebalancePortfolio();
    }, 3600000); // Check every hour
  }

  private async rebalancePortfolio() {
    if (!this.tradingStrategy?.active) return;

    // Get current portfolio balances
    const balanceTool = this.toolkit
      .getTools()
      .find((t) => t.name === "get_balance");

    const balances = await Promise.all(
      this.tradingStrategy.monitoredTokens.map(async (token: string) => {
        return {
          token,
          balance: await balanceTool.call({ token }),
        };
      })
    );

    // Calculate target allocations based on risk level
    const targetAllocations = this.calculateTargetAllocations(balances);

    // Execute rebalancing trades
    for (const target of targetAllocations) {
      const current = balances.find((b) => b.token === target.token);
      if (current && Math.abs(current.balance - target.allocation) > 0.05) {
        // Rebalance if difference is more than 5%
        const amount = (target.allocation - current.balance).toString();
        if (amount > "0") {
          await this.swapOnBase("USDC", target.token, amount);
        } else {
          await this.swapOnBase(
            target.token,
            "USDC",
            Math.abs(Number(amount)).toString()
          );
        }
      }
    }
  }

  private calculateTargetAllocations(
    balances: Array<{ token: string; balance: string }>
  ) {
    const riskWeights = {
      low: { stablecoin: 0.7, volatile: 0.3 },
      medium: { stablecoin: 0.5, volatile: 0.5 },
      high: { stablecoin: 0.3, volatile: 0.7 },
    };

    const weights = riskWeights[this.tradingStrategy.risk];
    const totalBalance = balances.reduce(
      (sum, b) => sum + Number(b.balance),
      0
    );

    return balances.map((balance) => ({
      token: balance.token,
      allocation:
        balance.token === "USDC"
          ? totalBalance * weights.stablecoin
          : totalBalance * (weights.volatile / (balances.length - 1)),
    }));
  }

  // Clean up method for autonomous features
  public stopAutonomousMode() {
    if (this.marketMonitor) clearInterval(this.marketMonitor);
    if (this.portfolioRebalancer) clearInterval(this.portfolioRebalancer);
    this.tradingStrategy = null;
  }
}
