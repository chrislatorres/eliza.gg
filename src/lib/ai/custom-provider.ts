import { wrapModel } from "@/lib/ai/logging-middleware";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { experimental_customProvider as customProvider } from "ai";
import { initLogger } from "braintrust";

const openrouter = createOpenRouter();

initLogger({
  projectName: "eliza.gg",
  apiKey: process.env.BRAINTRUST_API_KEY,
});

export const provider = customProvider({
  languageModels: {
    "anthropic/claude-3.5-sonnet": wrapModel(
      openrouter("anthropic/claude-3.5-sonnet")
    ),
  },
});
