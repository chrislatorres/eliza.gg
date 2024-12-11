import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getCerebrasModel(model: string) {
  const openai = createOpenAI({
    baseURL: "https://api.cerebras.ai/v1",
    apiKey: process.env.CEREBRAS_API_KEY,
  });

  return openai(model);
}

export function getOpenRouterModel(model: string) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
      "HTTP-Referer": process.env.APP_URL,
      "X-Title": process.env.APP_TITLE,
    },
  });

  return openrouter(model);
}
