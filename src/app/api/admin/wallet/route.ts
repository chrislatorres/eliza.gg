import { getWalletBalance } from "@/app/(app)/admin/wallet/actions";
import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  // Check if user is authenticated and is admin
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await isUserAdmin(userId);
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return Response.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    const balance = await getWalletBalance(address);
    const formattedBalance = (
      Number(balance.amount) / Math.pow(10, balance.decimals)
    ).toFixed(2);

    return Response.json({ balance: formattedBalance });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
}
