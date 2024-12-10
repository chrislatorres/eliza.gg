import { createOpenAI } from "@ai-sdk/openai";

export function getCerebrasModel(model: string) {
  const openai = createOpenAI({
    baseURL: "https://api.cerebras.ai/v1",
    apiKey: process.env.CEREBRAS_API_KEY,
  });

  return openai(model);
}
