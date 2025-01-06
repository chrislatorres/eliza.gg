import { getXataClient } from "@/xata";

// Define allowed origins
const allowedOrigins = [
  "https://eliza-studios-static-git-contact-lgds.vercel.app",
  "https://www.elizastudios.ai",
];

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";

  // Check if the origin is allowed
  if (allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return new Response(null, { status: 204 });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "";

  try {
    const { name, category, interests, contactInfo, source } = await req.json();

    if (!name || !category || !interests || !contactInfo) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: allowedOrigins.includes(origin)
            ? {
                "Access-Control-Allow-Origin": origin,
                "Content-Type": "application/json",
              }
            : {
                "Content-Type": "application/json",
              },
        }
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

    return new Response(
      JSON.stringify({ success: true, data: record.toSerializable() }),
      {
        status: 200,
        headers: allowedOrigins.includes(origin)
          ? {
              "Access-Control-Allow-Origin": origin,
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/json",
            },
      }
    );
  } catch (error) {
    console.error("Error submitting partnership:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit partnership request" }),
      {
        status: 500,
        headers: allowedOrigins.includes(origin)
          ? {
              "Access-Control-Allow-Origin": origin,
              "Content-Type": "application/json",
            }
          : {
              "Content-Type": "application/json",
            },
      }
    );
  }
}
