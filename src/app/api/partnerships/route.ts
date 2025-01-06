import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(req: Request) {
  const { name, category, interests, contactInfo, source } = await req.json();
  try {
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
      source,
    });

    return { success: true, data: record.toSerializable() };
  } catch (error) {
    console.error("Error submitting partnership:", error);
    return {
      error: "Failed to submit partnership request",
    };
  }
}
