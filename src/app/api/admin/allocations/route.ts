import { isUserAdmin } from "@/lib/auth/admin";
import { getXataClient } from "@/xata";
import { auth } from "@clerk/nextjs/server";

const xata = getXataClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { githubUsername, tokenSymbol, amount } = await request.json();

    if (!githubUsername || !tokenSymbol || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create allocation record
    const allocation = await xata.db.token_allocations.create({
      githubUsername,
      tokenSymbol,
      amount,
      allocatedBy: userId,
      claimed: false,
    });

    return Response.json(allocation);
  } catch (error) {
    console.error("Failed to create allocation:", error);
    return Response.json(
      { error: "Failed to create allocation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // If username is provided, no need for admin check - users can view their own allocations
    if (username) {
      const allocations = await xata.db.token_allocations
        .filter({ githubUsername: username })
        .sort("xata.createdAt", "desc")
        .getMany();
      return Response.json(allocations);
    }

    // If no username provided (listing all), check for admin
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const allocations = await xata.db.token_allocations
      .sort("xata.createdAt", "desc")
      .getMany();

    return Response.json(allocations);
  } catch (error) {
    console.error("Failed to fetch allocations:", error);
    return Response.json(
      { error: "Failed to fetch allocations" },
      { status: 500 }
    );
  }
}
