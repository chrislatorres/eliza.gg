"use server";

import { getXataClient } from "@/xata";

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

export async function getPartnerships(): Promise<Partnership[]> {
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
    "xata.createdAt": p.xata.createdAt.toISOString(),
  }));
}

export async function updatePartnershipStatus(id: string, status: string) {
  await xata.db.partnerships.update(id, {
    status,
  });
}
