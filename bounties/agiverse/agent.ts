import { SmartBuilding } from "agiverse";

interface SearchResult {
  url: string;
  title: string;
  content: string;
}

interface ResearchContext {
  query: string;
  results: SearchResult[];
  followUpPrompts?: string[];
}

class ResearchAssistant {
  private building: SmartBuilding;
  private searchCache: Map<string, ResearchContext> = new Map();

  constructor(apiKey: string, buildingIdStr: string) {
    const buildingId = parseInt(buildingIdStr, 10);

    if (isNaN(buildingId)) {
      throw new Error("buildingId must be a valid number");
    }

    this.building = new SmartBuilding({
      apiKey,
      buildingId,
    });

    this.initializeBuilding();
  }

  private async initializeBuilding() {
    // Set up the building name and description
    await this.building.updateBuilding(
      "Research Nexus",
      "An AI-powered research assistant that integrates real-world data and provides actionable insights."
    );

    // Register event handlers
    this.building.on("ready", () => {
      console.log(
        `Research Nexus (${this.building.buildingId}) is ready to assist`
      );
    });

    // Register research actions
    this.registerActions();

    // Start the building
    this.building.run();
  }

  private registerActions() {
    // Search action
    this.building.action(
      {
        action: "search",
        payloadDescription: '{"query": string} - The search query to research',
        paymentDescription: "1", // Charge 1 token per search
      },
      async (ctx, payload, payment) => {
        if (!payload?.query || payment < 1) {
          return ctx.sendResult(
            "Please provide a query and sufficient payment",
            0
          );
        }

        try {
          const results = await this.performSearch(payload.query);
          this.searchCache.set(ctx.playerId, results);

          await ctx.sendResult(
            {
              message: "Research completed successfully",
              results: results.results,
              followUpPrompts: results.followUpPrompts,
            },
            1
          );
        } catch (error) {
          await ctx.sendResult({ error: "Failed to perform search" }, 0);
        }
      }
    );

    // Get insights action
    this.building.action(
      {
        action: "analyze",
        payloadDescription:
          '{"topic": string} - Get AI-powered insights on a specific topic from your last search',
      },
      async (ctx, payload) => {
        const lastSearch = this.searchCache.get(ctx.playerId);
        if (!lastSearch) {
          return ctx.sendResult("Please perform a search first");
        }

        const insights = await this.generateInsights(
          lastSearch,
          payload?.topic
        );
        await ctx.sendResult(insights);
      }
    );

    // Export data action
    this.building.action(
      {
        action: "export",
        payloadDescription:
          '{"format": "json" | "csv" | "markdown"} - Export your research data',
        paymentDescription: "2", // Charge 2 tokens for export
      },
      async (ctx, payload, payment) => {
        if (payment < 2) {
          return ctx.sendResult("Insufficient payment for export", 0);
        }

        const lastSearch = this.searchCache.get(ctx.playerId);
        if (!lastSearch) {
          return ctx.sendResult("No research data to export", 0);
        }

        const exportedData = this.exportData(
          lastSearch,
          payload?.format || "json"
        );
        await ctx.sendResult({ data: exportedData }, 2);
      }
    );
  }

  private async performSearch(query: string): Promise<ResearchContext> {
    // Simulate API call to your search endpoint
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ content: query }],
      }),
    });

    const data = await response.json();

    return {
      query,
      results: data.citations || [],
      followUpPrompts: data.followUpPrompts,
    };
  }

  private async generateInsights(
    context: ResearchContext,
    topic?: string
  ): Promise<string> {
    // Implement AI-powered insight generation
    const relevantResults = topic
      ? context.results.filter((r) =>
          r.content.toLowerCase().includes(topic.toLowerCase())
        )
      : context.results;

    return (
      `Analysis of ${relevantResults.length} sources related to "${
        topic || context.query
      }":\n\n` +
      relevantResults
        .map((r) => `- ${r.title}: ${r.content.slice(0, 100)}...`)
        .join("\n")
    );
  }

  private exportData(context: ResearchContext, format: string): string {
    switch (format) {
      case "json":
        return JSON.stringify(context, null, 2);
      case "csv":
        return `Title,URL,Content\n${context.results
          .map((r) => `"${r.title}","${r.url}","${r.content}"`)
          .join("\n")}`;
      case "markdown":
        return `# Research Results: ${context.query}\n\n${context.results
          .map((r) => `## ${r.title}\n\n${r.content}\n\n[Source](${r.url})`)
          .join("\n\n")}`;
      default:
        return JSON.stringify(context, null, 2);
    }
  }
}
