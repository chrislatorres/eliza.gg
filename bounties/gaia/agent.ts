export interface GaiaConfig {
  endpoint: string;
  model: string;
  embeddingModel?: string;
  apiKey?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stream?: boolean;
}

export interface EmbeddingResponse {
  object: string;
  data: {
    index: number;
    object: string;
    embedding: number[];
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface RetrieveResponse {
  points: {
    source: string;
    score: number;
  }[];
  limit: number;
  score_threshold: number;
}

export class GaiaAgent {
  private config: GaiaConfig;

  constructor(config: GaiaConfig) {
    this.config = {
      endpoint: config.endpoint.replace(/\/$/, ""),
      model: config.model,
      embeddingModel: config.embeddingModel || "nomic-embed-text-v1.5.f16",
      apiKey: config.apiKey,
    };
  }

  private async fetchWithRetry(
    endpoint: string,
    options: RequestInit,
    retries = 3
  ): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (this.config.apiKey) {
          headers.Authorization = `Bearer ${this.config.apiKey}`;
        }

        const response = await fetch(`${this.config.endpoint}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
    throw new Error("Max retries reached");
  }

  async chat(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ReadableStream | any> {
    const response = await this.fetchWithRetry("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        messages,
        model: this.config.model,
        stream: options.stream,
        temperature: options.temperature,
        top_p: options.topP,
        presence_penalty: options.presencePenalty,
        frequency_penalty: options.frequencyPenalty,
      }),
    });

    if (options.stream) {
      return response.body;
    }

    return response.json();
  }

  async embed(texts: string[]): Promise<EmbeddingResponse> {
    const response = await this.fetchWithRetry("/embeddings", {
      method: "POST",
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: texts,
      }),
    });

    return response.json();
  }

  async retrieve(
    query: string,
    options: ChatCompletionOptions = {}
  ): Promise<RetrieveResponse> {
    const response = await this.fetchWithRetry("/retrieve", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: query },
        ],
        model: this.config.embeddingModel,
        ...options,
      }),
    });

    return response.json();
  }

  async generateWithContext(
    query: string,
    context: string[],
    systemPrompt?: string
  ): Promise<ReadableStream | any> {
    // First retrieve relevant context
    const retrievalResults = await this.retrieve(query);

    // Combine retrieved context with provided context
    const fullContext = [
      ...context,
      ...retrievalResults.points.map((p) => p.source),
    ].join("\n\n");

    // Generate response using chat completion
    return this.chat(
      [
        {
          role: "system",
          content:
            systemPrompt ||
            `You are a helpful assistant. Use this context to inform your response:\n\n${fullContext}`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      { stream: true }
    );
  }

  static domains = {
    llama8b: "https://llama8b.gaia.domains/v1",
    whisper: "https://whisper.gaia.domains/v1",
    portrait: "https://portrait.gaia.domains/v1",
    coder: "https://coder.gaia.domains/v1",
    rustCoder: "https://rustcoder.gaia.domains/v1",
    llama3b: "https://llama3b.gaia.domains/v1",
    qwen7b: "https://qwen7b.gaia.domains/v1",
    qwen72b: "https://qwen72b.gaia.domains/v1",
  } as const;
}
