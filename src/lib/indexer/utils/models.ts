import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { initLogger, wrapAISDKModel } from "braintrust";
import { openai } from "@ai-sdk/openai";

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
  });
  return openrouter(model);
}

export function getTogetherModel(model: string) {
  const togetherai = createTogetherAI({
    apiKey: process.env.TOGETHER_API_KEY,
  });

  return togetherai(model);
}

const logger = initLogger({
  projectName: "eliza.gg",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

const model = wrapAISDKModel(openai.chat("gpt-3.5-turbo"));

async function main() {
  // This will automatically log the request, response, and metrics to Braintrust
  const response = await model.doGenerate({
    inputFormat: "messages",
    mode: {
      type: "regular",
    },
    prompt: [
      {
        role: "user",
        content: [{ type: "text", text: "What is the capital of France?" }],
      },
    ],
  });
  console.log(response);
}

main();
