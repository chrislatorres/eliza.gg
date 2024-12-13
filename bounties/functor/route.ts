import { NextResponse } from "next/server";
import { AssetManager } from "./assetManager";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, aiAgentAddress, riskParameters, action } = body;

    const assetManager = new AssetManager();

    if (action === "create_session") {
      const result = await assetManager.createAssetManagementSession(
        walletAddress,
        aiAgentAddress,
        riskParameters
      );
      return NextResponse.json(result);
    }

    if (action === "create_escrow") {
      const { escrowAddress, assetAddress, amount } = body;
      const result = await assetManager.createEscrowSession(
        walletAddress,
        escrowAddress,
        assetAddress,
        amount
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Asset management error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
