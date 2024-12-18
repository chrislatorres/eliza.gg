import { provider } from "@/lib/ai/custom-provider";

export const ELIZA_MODEL = provider.languageModel(
  "anthropic/claude-3.5-sonnet:beta"
);
