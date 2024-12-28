"use server";

import { getXataClient } from "@/xata";
import { revalidateTag, unstable_cache } from "next/cache";

const xata = getXataClient();

export type Partnership = {
  id: string;
  name: string;
  category: string;
  interests: string;
  contactInfo: string;
  status: string;
  "xata.createdAt": string;
};

export const getPartnerships = unstable_cache(
  async (): Promise<Partnership[]> => {
    const partnerships = await xata.db.partnerships
      .select([
        "id",
        "name",
        "category",
        "interests",
        "contactInfo",
        "status",
        "xata.createdAt",
      ])
      .getMany();

    return partnerships.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      interests: p.interests,
      contactInfo: p.contactInfo,
      status: p.status ?? "pending",
      "xata.createdAt": p.xata.createdAt.toString(),
    }));
  },
  ["partnerships"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ["partnerships"],
  }
);

export async function updatePartnershipStatus(id: string, status: string) {
  await xata.db.partnerships.update(id, {
    status,
  });

  // Revalidate the partnerships cache after update
  revalidateTag("partnerships");
}
