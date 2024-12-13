const endpoint =
  process.env.FLOCK_BOT_ENDPOINT || "https://rag-chat-ml-backend-prod.flock.io";

interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

interface SyntheticDataConfig {
  taskType: "text2sql" | "code" | "conversation";
  domainContext?: string;
  diversityParams?: {
    languages?: string[];
    complexityLevels?: ("basic" | "intermediate" | "advanced")[];
    demographicFactors?: string[];
  };
  privacyRules?: {
    excludedPatterns: RegExp[];
    sensitiveTerms: string[];
  };
}

export class SyntheticDataGenerator {
  private chatHistory: ChatHistory[] = [];
  private modelId: string;

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  async generateSyntheticData(
    config: SyntheticDataConfig,
    sampleCount: number
  ): Promise<Array<{ input: string; output: string }>> {
    const syntheticData: Array<{ input: string; output: string }> = [];

    for (let i = 0; i < sampleCount; i++) {
      const prompt = this.constructPrompt(config);
      const response = await this.callFlockAPI(prompt);

      if (response) {
        const sanitizedData = this.sanitizeOutput(
          response,
          config.privacyRules
        );
        const validatedData = this.validateOutput(sanitizedData, config);

        if (validatedData) {
          syntheticData.push(validatedData);
        }
      }
    }

    return this.applyBiasMitigation(syntheticData, config);
  }

  private async callFlockAPI(prompt: string) {
    try {
      const payload = {
        question: prompt,
        chat_history: this.chatHistory,
        knowledge_source_id: this.modelId,
      };

      const response = await fetch(`${endpoint}/chat/conversational_rag_chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.FLOCK_BOT_API_KEY || "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update chat history
      this.chatHistory.push(
        { role: "user", content: prompt },
        { role: "assistant", content: data.answer }
      );

      return data.answer;
    } catch (error) {
      console.error("Error calling Flock API:", error);
      return null;
    }
  }

  private constructPrompt(config: SyntheticDataConfig): string {
    const taskPrompts = {
      text2sql: `Generate a realistic database query scenario with the following structure:
        1. A business context
        2. A natural language question
        3. The correct SQL query
        Make it ${this.getRandomComplexity(config)} complexity.`,

      code: `Create a programming challenge with:
        1. A problem description
        2. Example input/output
        3. The correct solution in a popular programming language
        Complexity: ${this.getRandomComplexity(config)}`,

      conversation: `Generate a natural conversation example with:
        1. User query or request
        2. Appropriate assistant response
        Context: ${config.domainContext || "general assistance"}`,
    };

    return taskPrompts[config.taskType];
  }

  private getRandomComplexity(config: SyntheticDataConfig): string {
    const levels = config.diversityParams?.complexityLevels || [
      "basic",
      "intermediate",
      "advanced",
    ];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private sanitizeOutput(
    output: string,
    privacyRules?: SyntheticDataConfig["privacyRules"]
  ): string | null {
    if (!privacyRules) return output;

    let sanitized = output;

    // Remove excluded patterns
    privacyRules.excludedPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    });

    // Remove sensitive terms
    privacyRules.sensitiveTerms.forEach((term) => {
      sanitized = sanitized.replace(new RegExp(term, "gi"), "[PROTECTED]");
    });

    return sanitized;
  }

  private validateOutput(
    output: string | null,
    config: SyntheticDataConfig
  ): { input: string; output: string } | null {
    if (!output) return null;

    // Basic validation based on task type
    const validators = {
      text2sql: (text: string) => text.toLowerCase().includes("select"),
      code: (text: string) => text.includes("function") || text.includes("def"),
      conversation: (text: string) =>
        text.includes("User:") && text.includes("Assistant:"),
    };

    if (!validators[config.taskType](output)) {
      return null;
    }

    // Split into input/output pairs based on task type
    const [input, generatedOutput] = this.splitIntoInputOutput(
      output,
      config.taskType
    );
    return { input, output: generatedOutput };
  }

  private splitIntoInputOutput(
    text: string,
    taskType: SyntheticDataConfig["taskType"]
  ): [string, string] {
    // Implementation depends on task type
    switch (taskType) {
      case "text2sql":
        const [question, query] = text.split("SQL:").map((s) => s.trim());
        return [question, query];
      case "code":
        const [problem, solution] = text
          .split("Solution:")
          .map((s) => s.trim());
        return [problem, solution];
      case "conversation":
        const [userQuery, response] = text
          .split("Assistant:")
          .map((s) => s.trim());
        return [userQuery.replace("User:", "").trim(), response];
      default:
        return [text, text];
    }
  }

  private applyBiasMitigation(
    data: Array<{ input: string; output: string }>,
    config: SyntheticDataConfig
  ): Array<{ input: string; output: string }> {
    // Implement bias detection and mitigation strategies
    return data.filter((item) => {
      // Remove entries with potential demographic biases
      const hasBias = config.diversityParams?.demographicFactors?.some(
        (factor) => item.input.toLowerCase().includes(factor.toLowerCase())
      );

      return !hasBias;
    });
  }
}
