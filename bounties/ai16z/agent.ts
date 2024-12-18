import { createTurso } from "@/lib/indexer/utils/create-turso";
import { embed } from "@/lib/indexer/utils/embed";
import { getCerebrasModel } from "@/lib/indexer/utils/models";
import { z } from "zod";

interface Agent {
  handleMessage(
    message: string,
    platform: "discord" | "telegram"
  ): Promise<string>;
}

interface SecurityAlert {
  title: string;
  link: string;
  published: string;
  summary: string;
}

interface GenerateObjectResponse {
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  hasSensitiveInfo?: boolean;
  hasScamIndicators?: boolean;
  riskLevel?: "low" | "medium" | "high";
  warnings?: string[];
}

export class SecurityInspectorAgent implements Agent {
  private model = getCerebrasModel("llama-3.3-70b");
  private turso = createTurso();

  // Cache for CISA alerts
  private cisaAlertsCache: SecurityAlert[] = [];
  private lastCacheUpdate: Date | null = null;

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    await this.fetchCISAAlerts();
  }

  async searchKnowledgeBase(query: string) {
    const queryEmbedding = await embed(query);

    const { rows } = await this.turso.execute({
      sql: `
        SELECT
          hash,
          title,
          url,
          content,
          vector_distance_cos(full_emb, vector32(?)) as similarity
        FROM docs
        ORDER BY similarity ASC
        LIMIT 5
      `,
      args: [`[${queryEmbedding.join(", ")}]`],
    });

    return rows.map((row) => ({
      url: row[2] as string,
      content: row[3] as string,
    }));
  }

  async fetchCISAAlerts(): Promise<SecurityAlert[]> {
    // Only fetch new alerts every 6 hours
    if (
      this.lastCacheUpdate &&
      new Date().getTime() - this.lastCacheUpdate.getTime() < 6 * 60 * 60 * 1000
    ) {
      return this.cisaAlertsCache;
    }

    try {
      const response = await fetch("https://www.cisa.gov/feeds/alert.xml");
      const xmlText = await response.text();
      // Parse XML response and extract alerts
      // This is a simplified version - you'd want to properly parse the XML
      const alerts: SecurityAlert[] = []; // Parse XML to alerts array

      this.cisaAlertsCache = alerts;
      this.lastCacheUpdate = new Date();
      return alerts;
    } catch (error) {
      console.error("Error fetching CISA alerts:", error);
      return [];
    }
  }

  async generateSecurityQuiz(topic: string) {
    const result = await generateObject({
      model: this.model,
      schema: z.object({
        questions: z
          .array(
            z.object({
              question: z.string(),
              options: z.array(z.string()),
              correctAnswer: z.number(),
              explanation: z.string(),
            })
          )
          .length(3),
      }),
      system: `Generate a security quiz about ${topic}. Focus on practical scenarios.`,
      prompt: `Create 3 multiple-choice questions about ${topic} security.`,
    });

    return result.object.questions;
  }

  async analyzePDFSafety(pdfUrl: string) {
    // Integration with dangerzone.rocks
    // This would need to be implemented with proper PDF processing
    try {
      // Mock implementation
      const analysis = {
        safe: true,
        warnings: [],
        recommendations: [],
      };
      return analysis;
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      throw error;
    }
  }

  async moderateMessage(message: string) {
    const securityIssues = await generateObject({
      model: this.model,
      schema: z.object({
        hasSensitiveInfo: z.boolean(),
        hasScamIndicators: z.boolean(),
        riskLevel: z.enum(["low", "medium", "high"]),
        warnings: z.array(z.string()),
      }),
      system: `You are a security-focused content moderator. Analyze messages for security risks.`,
      prompt: `Analyze this message for security concerns: ${message}`,
    });

    return securityIssues.object;
  }

  async handleMessage(
    message: string,
    platform: "discord" | "telegram"
  ): Promise<string> {
    // First, check if it's a security risk
    const moderation = await this.moderateMessage(message);

    if (moderation.riskLevel === "high") {
      return `⚠️ Warning: This message contains potential security risks:\n${moderation.warnings.join(
        "\n"
      )}`;
    }

    // Handle different command types
    if (message.startsWith("/quiz")) {
      const topic = message.replace("/quiz", "").trim() || "social engineering";
      const quiz = await this.generateSecurityQuiz(topic);
      return this.formatQuiz(quiz);
    }

    if (message.startsWith("/alerts")) {
      const alerts = await this.fetchCISAAlerts();
      return this.formatAlerts(alerts);
    }

    // Default to knowledge base search for security advice
    const searchResults = await this.searchKnowledgeBase(message);
    return this.formatSearchResults(searchResults);
  }

  private formatQuiz(quiz: any[]) {
    return quiz
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question}\n${q.options
            .map((opt: string, j: number) => `${j + 1}. ${opt}`)
            .join("\n")}`
      )
      .join("\n\n");
  }

  private formatAlerts(alerts: SecurityAlert[]) {
    return alerts
      .slice(0, 3)
      .map(
        (alert) =>
          `🚨 ${alert.title}\n${alert.summary}\nMore info: ${alert.link}`
      )
      .join("\n\n");
  }

  private formatSearchResults(results: any[]) {
    return results.map((result) => result.content).join("\n\n");
  }
}

// Helper function with proper typing
async function generateObject({
  model,
  schema,
  system,
  prompt,
}: {
  model: any;
  schema: z.ZodType<any>;
  system: string;
  prompt: string;
}): Promise<{ object: GenerateObjectResponse }> {
  // Implementation similar to your existing generateObject function
  return {
    object: {
      questions: [],
      hasSensitiveInfo: false,
      hasScamIndicators: false,
      riskLevel: "low",
      warnings: [],
    },
  };
}
