import { getXataClient } from "@/xata";

export async function POST(req: Request) {
  const { name, category, interests, contactInfo, source } = await req.json();
  try {
    if (!name || !category || !interests || !contactInfo) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const xata = getXataClient();
    const record = await xata.db.partnerships.create({
      name,
      category,
      interests,
      contactInfo,
      source,
    });

    return Response.json(
      { success: true, data: record.toSerializable() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting partnership:", error);
    return Response.json(
      {
        error: "Failed to submit partnership request",
      },
      { status: 500 }
    );
  }
}
