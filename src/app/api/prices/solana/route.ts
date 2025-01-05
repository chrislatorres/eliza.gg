import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_URL = "https://api.coingecko.com/api/v3";
const CACHE_DURATION = 60; // Cache for 60 seconds

interface CoinGeckoResponse {
  solana: {
    usd: number;
  };
}

let priceCache: {
  data: CoinGeckoResponse;
  timestamp: number;
} | null = null;

export async function GET() {
  try {
    // Auth checks...
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check cache
    const now = Date.now();
    if (priceCache && now - priceCache.timestamp < CACHE_DURATION * 1000) {
      return Response.json(priceCache.data, {
        headers: {
          "Cache-Control": `public, max-age=${CACHE_DURATION}`,
        },
      });
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_URL}/simple/price?ids=solana&vs_currencies=usd`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-cg-demo-api-key": COINGECKO_API_KEY || "",
        },
        next: {
          revalidate: CACHE_DURATION,
        },
      }
    );

    if (!response.ok) {
      if (priceCache) {
        console.warn("Using stale price data due to API error");
        return Response.json(priceCache.data, {
          headers: {
            "Cache-Control": "public, max-age=30",
          },
        });
      }

      console.error("Failed to fetch Solana price", {
        status: response.status,
        statusText: response.statusText,
      });

      return Response.json(
        { error: "Failed to fetch Solana price" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as CoinGeckoResponse;

    // Validate response shape
    if (!data.solana?.usd) {
      throw new Error("Invalid price data received");
    }

    // Update cache
    priceCache = {
      data,
      timestamp: now,
    };

    return Response.json(data, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
      },
    });
  } catch (error) {
    console.error("Solana price fetch error:", error);

    if (priceCache) {
      console.warn("Using stale price data due to error");
      return Response.json(priceCache.data, {
        headers: {
          "Cache-Control": "public, max-age=30",
        },
      });
    }

    return Response.json(
      { error: "Failed to fetch Solana price" },
      { status: 500 }
    );
  }
}
