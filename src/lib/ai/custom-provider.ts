import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_customProvider as customProvider } from "ai";
import { initLogger } from "braintrust";

export const ELIZA_MODEL_NAME = "openai/gpt-4o-2024-11-20";

const openrouter = createOpenRouter();

initLogger({
  projectName: "eliza.gg",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

export const provider = customProvider({
  languageModels: {
    [ELIZA_MODEL_NAME]: openrouter(ELIZA_MODEL_NAME),
  },
});
