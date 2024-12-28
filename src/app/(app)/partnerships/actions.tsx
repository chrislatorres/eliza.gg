"use server";

import { getXataClient } from "@/xata";

const xata = getXataClient();

type PartnershipResponse = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function submitPartnership(
  formData: FormData
): Promise<PartnershipResponse> {
  try {
    const name = formData.get("name")?.toString();
    const category = formData.get("category")?.toString();
    const interests = formData.get("interests")?.toString();
    const contactInfo = formData.get("contactInfo")?.toString();

    if (!name || !category || !interests || !contactInfo) {
      return {
        error: "All fields are required",
      };
    }

    const record = await xata.db.partnerships.create({
      name,
      category,
      interests,
      contactInfo,
      status: "pending",
    });

    return { success: true, data: record.toSerializable() };
  } catch (error) {
    console.error("Error submitting partnership:", error);
    return {
      error: "Failed to submit partnership request",
    };
  }
}
