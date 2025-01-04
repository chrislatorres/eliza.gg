import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  // Pages
  "/",
  "/terms",
  "/privacy",
  "/explore",
  "/partnerships",
  "/search(.*)",
  "/blog(.*)",
  "/auth/callback",

  // Auth
  "/login(.*)",
  "/sign-up(.*)",

  // API
  "/api/(.*)",

  // Docs
  "/docs(.*)",
  "/eliza(.*)",

  // Static
  "/sitemap(.*)",
  "/.well-known/apple-developer-merchantid-domain-association",

  // Rewrites
  "/ingest(.*)",
  "/widget(.*)",
  "/monitoring(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Handle public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect non-public routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
