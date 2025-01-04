"use server";

import { getXataClient } from "@/xata";
import { unstable_cache } from "next/cache";

const xata = getXataClient();

export type AILog = {
  id: string;
  userMessage: string;
  aiResponse: string;
  "xata.createdAt": string;
};

export const getLogs = unstable_cache(
  async (): Promise<AILog[]> => {
    const logs = await xata.db.ai_logs
      .select(["id", "userMessage", "aiResponse", "xata.createdAt"])
      .sort("xata.createdAt", "desc")
      .getMany();

    return logs.map((log) => ({
      id: log.id,
      userMessage: log.userMessage ?? "",
      aiResponse: log.aiResponse ?? "",
      "xata.createdAt": log.xata.createdAt.toString(),
    }));
  },
  ["ai_logs"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["ai_logs"],
  }
);
