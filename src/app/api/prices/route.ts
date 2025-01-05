import { isUserAdmin } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const COINGECKO_URL = "https://api.coingecko.com/api/v3";
const CACHE_DURATION = 60; // Cache for 60 seconds

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

// Cache structure to store multiple token prices
const priceCache: {
  [tokenId: string]: {
    data: CoinGeckoResponse;
    timestamp: number;
  };
} = {};

export async function GET(request: Request) {
  try {
    // Auth checks
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get token IDs from query params
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return Response.json({ error: "Missing token IDs" }, { status: 400 });
    }

    const tokenIds = ids.split(",");
    const now = Date.now();

    // Check if all requested tokens are in cache and not expired
    const allCached = tokenIds.every(
      (id) =>
        priceCache[id] && now - priceCache[id].timestamp < CACHE_DURATION * 1000
    );

    if (allCached) {
      // Combine cached data for all requested tokens
      const cachedData = tokenIds.reduce(
        (acc, id) => ({
          ...acc,
          ...priceCache[id].data,
        }),
        {}
      );

      return Response.json(cachedData, {
        headers: {
          "Cache-Control": `public, max-age=${CACHE_DURATION}`,
        },
      });
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `${COINGECKO_URL}/simple/price?ids=${ids}&vs_currencies=usd`,
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
      // Return cached data if available, even if some tokens are missing
      const cachedData = tokenIds.reduce((acc, id) => {
        if (priceCache[id]) {
          return { ...acc, ...priceCache[id].data };
        }
        return acc;
      }, {});

      if (Object.keys(cachedData).length > 0) {
        console.warn("Using stale price data due to API error");
        return Response.json(cachedData, {
          headers: {
            "Cache-Control": "public, max-age=30",
          },
        });
      }

      console.error("Failed to fetch token prices", {
        status: response.status,
        statusText: response.statusText,
      });

      return Response.json(
        { error: "Failed to fetch token prices" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as CoinGeckoResponse;

    // Validate response shape
    if (!Object.keys(data).length) {
      throw new Error("Invalid price data received");
    }

    // Update cache for each token
    Object.keys(data).forEach((tokenId) => {
      priceCache[tokenId] = {
        data: { [tokenId]: data[tokenId] },
        timestamp: now,
      };
    });

    return Response.json(data, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
      },
    });
  } catch (error) {
    console.error("Token price fetch error:", error);

    // Return cached data if available
    const tokenIds =
      new URL(request.url).searchParams.get("ids")?.split(",") || [];
    const cachedData = tokenIds.reduce((acc, id) => {
      if (priceCache[id]) {
        return { ...acc, ...priceCache[id].data };
      }
      return acc;
    }, {});

    if (Object.keys(cachedData).length > 0) {
      console.warn("Using stale price data due to error");
      return Response.json(cachedData, {
        headers: {
          "Cache-Control": "public, max-age=30",
        },
      });
    }

    return Response.json(
      { error: "Failed to fetch token prices" },
      { status: 500 }
    );
  }
}
