import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
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
      "HTTP-Referer": process.env.OPENROUTER_REFERRER,
      "X-Title": process.env.OPENROUTER_TITLE,
    },
    extraBody: {
      provider: {
        order: ["Together"],
      },
    },
  });
  return openrouter(model);
}

export function getTogetherModel(model: string) {
  const togetherai = createTogetherAI({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  return togetherai(model);
}
