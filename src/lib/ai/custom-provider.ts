import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_customProvider as customProvider } from "ai";

export const ELIZA_MODEL_NAME = "anthropic/claude-3.5-sonnet:beta";

const openrouter = createOpenRouter();

export const provider = customProvider({
  languageModels: {
    [ELIZA_MODEL_NAME]: openrouter(ELIZA_MODEL_NAME),
  },
});
