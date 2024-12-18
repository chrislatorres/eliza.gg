import { route } from "@fal-ai/server-proxy/nextjs";

// Let's add some custom logic to POST requests - i.e. when the request is
// submitted for processing
export const POST = (req) => {
  // Add some analytics
  //   analytics.track("fal.ai request", {
  //     targetUrl: req.headers["x-fal-target-url"],
  //     userId: req.user.id,
  //   });

  //   // Apply some rate limit
  //   if (rateLimiter.shouldLimit(req)) {
  //     res.status(429).json({ error: "Too many requests" });
  //   }

  // If everything passed your custom logic, now execute the proxy handler
  return route.POST(req);
};

// For GET requests we will just use the built-in proxy handler
// But you could also add some custom logic here if you need
export const GET = route.GET;
